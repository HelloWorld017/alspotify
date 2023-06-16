import cors from '@koa/cors';
import { QApplication, QMenu } from '@nodegui/nodegui';
import Logger from '@ptkdev/logger';
import alsong from 'alsong';
import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import Router from 'koa-router';
import LyricsMapper, { lyricsMapper } from './LyricsMapper';
import utils, { ConfigApi } from './utils/Config';
import Observable, { Observer } from './utils/Observable';
import fs from 'fs';
import * as path from 'path';

const logger = new Logger({
  write: true,
  path: {
    debug_log: path.join(__dirname, '..', '/debug.log'),
    error_log: path.join(__dirname, '..', '/error.log')
  },
  rotate: {
    size: '10K',
    encoding: 'utf-8'
  }
});
const config = utils();

interface TunaOBSPayload {
  playing: boolean;
  title: string;
  artist: string;
  progress: number;
  duration: number;
  lyric?: {
    timestamp: string[];
    lyric: {
      [key: string]: string[];
    };
    current?: string[];
  };
  coverUrl: string;
}

interface RequestBody {
  data: {
    status: string;
    title: string;
    artists: string[];
    progress: number;
    duration: number;
    cover_url: string;
    lyrics: {
      [key: string]: string[];
    }
  }
}

interface Plugin {
  configureMenu?: (config: typeof ConfigApi, menu: QMenu) => void
  preprocess?: (body: RequestBody) => void
}

class Alspotify {
  public info: Observer<TunaOBSPayload | Record<string, never>>;
  private lastUri: string = null;
  private lastUpdate = -1;
  private app: Koa;
  private initialized: boolean;
  private readonly initPromise: Promise<void>;
  public plugins: Plugin[] = [];

  constructor() {
    this.info = Observable.init<TunaOBSPayload | Record<string, never>>(
      'api',
      {}
    );

    const app = new Koa();
    app.use(cors());
    app.use(bodyParser());

    const router = new Router();

    router.post('/', async (ctx) => {
      ctx.status = 200;
      await this.update(ctx.request.body as RequestBody);
    });

    router.get('/config', () => {
      // TODO: get config
    });

    router.post('/config', () => {
      // TODO: set config
    });

    router.post('/shutdown', () => {
      const qApp = QApplication.instance();
      qApp.quit();
    });

    app.use(router.routes()).use(router.allowedMethods());

    const pluginDirectory = path.join(__dirname, 'plugins');
    if (!fs.existsSync(pluginDirectory)) {
      fs.mkdirSync(pluginDirectory);
    }

    this.initPromise = Promise.allSettled([
      ...fs.readdirSync(pluginDirectory).map(async (file) => {
        const plugin = (await import('./plugins/' + file) as {
          default: Plugin;
        }).default;

        if (plugin) this.plugins.push(plugin);
      }),
      lyricsMapper.readFromFile(),
    ]).then(() => {
      this.initialized = false;
    }).catch((err) => {
      logger.error(String(err));
    });

    this.app = app;
  }

  async until() {
    await this.initPromise;
  }

  init() {
    if (this.initialized) {
      return;
    }

    this.initialized = true;
    this.app.listen(1608, '127.0.0.1');
    this.info.$observe(() => {
      this.updateProgress();
    });
    setInterval(() => this.tick(), 50);
  }

  tick() {
    if (this.info.playing) {
      this.info.progress = Math.min(
        this.info.duration,
        this.info.progress + 50
      );
    }
  }

  async update(body: RequestBody) {
    if (body.data?.status !== 'playing') {
      this.info.playing = false;
      return;
    }

    if (
      !Number.isFinite(Number(body.data.progress)) ||
      body.data.progress < 0 ||
      body.data.progress > body.data.duration
    ) {
      return;
    }

    body.data.progress = Math.max(
      0,
      Math.min(body.data.duration, body.data.progress)
    );

    if (
      typeof body.data.title !== 'string' ||
      !Array.isArray(body.data.artists)
    ) {
      this.info.progress = body.data.progress;
      return;
    }

    if (
      typeof body.data.duration !== 'number' ||
      !isFinite(body.data.duration) ||
      body.data.duration < 0
    ) {
      return;
    }

    this.plugins.forEach((plugin) => {
      try {
        plugin.preprocess?.(body);
      } catch (e) {
        logger.error(String(e), 'Plugin preprocess');
      }
    });

    this.info.$assign({
      playing: true,
      title: body.data.title,
      artist: body.data.artists.join(', '),
      progress: body.data.progress,
      duration: body.data.duration,
      coverUrl: body.data.cover_url,
    });

    if (body.data.cover_url && body.data.cover_url !== this.lastUri) {
      this.lastUri = body.data.cover_url;
      await this.updateLyric(body.data.lyrics);
    }
  }

  async updateLyric(spotifyLyric: { [key: string]: string[] }) {
    try {
      // let lyric: Record<string, string[]> = {};
      const lyric = (!LyricsMapper().get(this.info.coverUrl) ? await alsong(this.info.artist, this.info.title, {
        playtime: Number(this.info.duration),
      }).then((lyricItems) => {
        logger.info(
          `Retrieved alsong info: ${lyricItems[0].artist} - ${lyricItems[0].title}`
        );
        return alsong.getLyricById(lyricItems[0].lyricId);
      })
      .then((lyricData) => lyricData.lyric)
      .catch((it) => {
        logger.error(String(it));
        if (typeof spotifyLyric !== 'object') return {};

        return spotifyLyric;
      }) : (await alsong.getLyricById(LyricsMapper().get(this.info.coverUrl))).lyric);

      lyric['0'] ??= [];

      const timestamp = Object.keys(lyric).sort(Number);
      this.info.lyric = {
        timestamp,
        lyric,
      };
      this.lastUpdate = -1;

      logger.info(`Retrieved lyric: ${this.info.artist} - ${this.info.title}`);
    } catch (e) {
      this.info.lyric = {
        timestamp: ['0'],
        lyric: {
          '0': [],
        },
        current: [],
      };
      this.lastUpdate = -1;
      logger.error(`Error while retrieving lyric: ${String(e)}`);
    }
  }

  updateProgress() {
    if (!this.info.lyric) return;

    let i = 0;
    for (; i < this.info.lyric.timestamp.length; i++) {
      if (parseInt(this.info.lyric.timestamp[i + 1]) > this.info.progress) {
        break;
      }
    }

    if (this.lastUpdate !== i) {
      const currentLyric = (
        this.info.lyric.lyric[this.info.lyric.timestamp[i]] || []
      ).slice();
      while (config.lyric.count > currentLyric.length) {
        currentLyric.unshift('');
      }

      this.info.lyric.current = currentLyric;
      this.lastUpdate = i;
    }
  }
}

const api = new Alspotify();
api.init();

export default () => api;
