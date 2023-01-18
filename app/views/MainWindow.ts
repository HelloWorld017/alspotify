import {
  FlexLayout,
  QApplication,
  QIcon,
  QMainWindow,
  QMenu,
  QSystemTrayIcon,
  QWidget,
  WidgetAttribute,
  WindowType
} from '@nodegui/nodegui';
import LyricsView from '../components/LyricsView';
import NowPlayingView from '../components/NowPlayingView';
import utils, {ConfigApi} from '../utils/Config';

const config = utils();

// eslint-disable-next-line @typescript-eslint/no-var-requires
const IconMusicPicture = require('../assets/IconMusic.png') as string;


class MainWindow extends QMainWindow {
  constructor() {
    super();
    this.setWindowTitle('Alspotify');

    const systemIcon = new QIcon(IconMusicPicture);
    this.setWindowIcon(systemIcon);

    const tray = new QSystemTrayIcon(this);
    tray.setIcon(systemIcon);
    tray.setContextMenu(this.#getTrayMenu(this));
    tray.show();

    this.setWindowFlag(WindowType.FramelessWindowHint, true);
    this.setWindowFlag(WindowType.WindowStaysOnTopHint, true);
    this.setWindowFlag(WindowType.WindowTransparentForInput, true);
    this.setWindowFlag(WindowType.SubWindow, true);
    this.setAttribute(WidgetAttribute.WA_NoSystemBackground, true);
    this.setAttribute(WidgetAttribute.WA_TranslucentBackground, true);

    const layout = new FlexLayout();
    const widget = new QWidget();
    widget.setObjectName('Root');
    widget.setLayout(layout);

    const lyricsView = new LyricsView();
    layout.addWidget(lyricsView);
    const nowPlayingView = new NowPlayingView();
    layout.addWidget(nowPlayingView);

    this.setCentralWidget(widget);
    this.setMinimumSize(Math.max(config.style.nowPlaying.width, config.style.lyric.width), this.size().height());

    config.$observe(() => {
      this.setGeometry(
        config.windowPosition.x, config.windowPosition.y,
        config.windowPosition.w, config.windowPosition.h
      );
    });

    config.$observe(() => {
      widget.setStyleSheet(`
        #Root {
          width: ${config.windowPosition.w}px;
          align-items: flex-end;
          flex-direction: column;
          }
        `);
    });
  }

  #getTrayMenu(parent: QWidget) {
    const menu = new QMenu(parent);

    const exitAction = menu.addAction('Exit');
    exitAction.addEventListener('triggered', () => {
      const qApp = QApplication.instance();
      qApp.quit();
    });

    menu.addSeparator();
    const experimentalLyricParser = menu.addAction('Use Experimental Title Parser');
    experimentalLyricParser.setCheckable(true);
    experimentalLyricParser.setChecked(config.experimental.titleParser);
    experimentalLyricParser.addEventListener('triggered', () => {
      config.experimental.titleParser = experimentalLyricParser.isChecked();
      ConfigApi.save();
    });

    return menu;
  }
}

export default MainWindow;
