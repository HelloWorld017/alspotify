import {QApplication} from '@nodegui/nodegui';
import deepmerge from 'deepmerge';
import Observable from './Observable';
import fs from 'fs';

interface ConfigStruct {
  style: {
    font: string;
    nowPlaying: {
      color: string;
      background: string;
      backgroundProgress: string;
      fontSize: number;
      width: number;
    },
    lyric: {
      color: string;
      background: string;
      fontSize: number;
      width: number;
      height: number;
      align: string;
    }
  },
  lyric: {
    count: number;
    overflow: string;
  },
  windowPosition: {
    x: number;
    y: number;
    w: number;
    h: number;
  }
}

class Config {

  public observable: ConfigStruct & typeof Observable = null;
  private config: ConfigStruct = this.defaultConfig;
  private initialized = false;

  get defaultConfig(): ConfigStruct {
    const screens = QApplication.screens();
    const maxRight = Math.max(...screens.map(screen => screen.geometry().left() + (screen.geometry().width() * screen.devicePixelRatio())));
    const maxBottom = Math.max(...screens.map(screen => screen.geometry().top() + (screen.geometry().height() * screen.devicePixelRatio())));

    return {
      style: {
        font: 'KoPubWorldDotum',
        nowPlaying: {
          color: '#FFFFFF',
          background: 'rgba(29, 29, 29, .50)',
          backgroundProgress: 'rgba(29, 29, 29, .80)',
          fontSize: 11,
          width: 300
        },

        lyric: {
          color: '#FFFFFF',
          background: 'rgba(29, 29, 29, .70)',
          fontSize: 12,
          width: 500,
          height: 150,
          align: 'right'
        }
      },

      lyric: {
        count: 3,
        overflow: 'none' // 'elide' or 'wrap' or 'none'
      },

      windowPosition: {
        x: maxRight - 600,
        y: maxBottom - 250,
        w: 500,
        h: 150
      }
    };
  }

  init() {
    if (this.initialized) {return;}

    try {
      const configRaw = fs.readFileSync('./config.json', 'utf8');
      this.config = deepmerge(
        this.defaultConfig,
        JSON.parse(configRaw) as ConfigStruct,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        {arrayMerge: (d, s, o) => s}
      );
    } catch (e) {
      this.config = this.defaultConfig;
      this.save();
    }

    this.observable = Observable.init('config', this.config) as ConfigStruct & typeof Observable;
    this.initialized = true;
  }

  save() {
    fs.writeFileSync('./config.json', JSON.stringify(this.config, null, '\t'));
  }
}

const config = new Config();

export default () => {
  config.init();
  return config.observable;
};
