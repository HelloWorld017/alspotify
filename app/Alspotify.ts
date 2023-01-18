import cors from '@koa/cors';
import { QApplication } from '@nodegui/nodegui';
import Logger from '@ptkdev/logger';
import alsong from 'alsong';
import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import Router from 'koa-router';
import utils from './utils/Config';
import Observable, {ObserverPrototype} from './utils/Observable';

const logger = new Logger();
const config = utils();

interface Information {
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

class Alspotify {
  public info: Information & ObserverPrototype<Information>;
  private lastUri: string = null;
  private lastUpdate = -1;
  private app: Koa;
  private initialized: boolean;

  constructor() {
    this.info = Observable.init('api', {}) as Information & ObserverPrototype<Information>;

    const app = new Koa();
    app.use(cors());
    app.use(bodyParser());

    const router = new Router();

    router.post('/', async (ctx) => {
      await this.update(ctx.request.body as RequestBody);
    });

    router.get('/config', () => {});

    router.post('/config', () => {});

    router.post('/shutdown', () => {
      const qApp = QApplication.instance();
      qApp.quit();
    });

    app.use(router.routes()).use(router.allowedMethods());

    this.app = app;
    this.initialized = false;
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
    if (!body.data || body.data.status !== 'playing') {
      this.info.playing = false;
      return;
    }

    if (
      typeof body.data.progress !== 'number' ||
      !isFinite(body.data.progress) ||
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

    this.info.$assign({
      playing: true,
      title: body.data.title,
      artist: body.data.artists.join(', '),
      progress: body.data.progress,
      duration: body.data.duration,
    });

    if (body.data.cover_url && body.data.cover_url !== this.lastUri) {
      this.lastUri = body.data.cover_url;
      await this.updateLyric(body.data.lyrics);
    }
  }

  async updateLyric(spotifyLyric: { [key: string]: string[] }) {
    try {
      const lyric = await alsong(this.info.artist, this.info.title, {
        playtime: Number(this.info.duration),
      })
        .then((lyricItems) => {
          logger.info(
            `Retrieved alsong info: ${lyricItems[0].artist} - ${lyricItems[0].title}`
          );
          return alsong.getLyricById(lyricItems[0].lyricId);
        })
        .then((lyricData) => lyricData.lyric)
        .catch(() => {
          if (typeof spotifyLyric !== 'object') {
            return {};
          }

          return spotifyLyric;
        });

      if (!lyric['0']) {
        lyric['0'] = [];
      }

      const timestamp = Object.keys(lyric).sort(
        (v1, v2) => parseInt(v1) - parseInt(v2)
      );
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
    if (!this.info.lyric) {
      return;
    }

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

export default () => {
  api.init();

  return api;
};
