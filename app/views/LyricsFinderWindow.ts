import { QWidget, QLineEdit, QBoxLayout, QPushButton, QMainWindow, FlexLayout, QLabel, QTimeEdit, QTime,  QApplication, QWidgetSignals, QIcon } from '@nodegui/nodegui';
import LyricsView from '../components/LyricsView';
import NowPlayingView from '../components/NowPlayingView';
import utils, { ConfigApi } from '../utils/Config';
import Alspotify from '../Alspotify';
import LyricsMapper from '../LyricsMapper';
import alsong from 'alsong';
import path from 'path';

const IconMusicPicture = path.resolve(process.env.NODE_ENV === 'production' ? __dirname : `${__dirname}/../../`, './assets/IconMusic.png');

const config = utils();
const api = Alspotify();
const lyricsMapper = LyricsMapper();

class LyricsFinderWindow extends QMainWindow {
  private artist: QLineEdit;
  private title: QLineEdit;
  private duration: QTimeEdit;
  private searchResultContainer: QWidget;
  private searchResultItems: {
    container: QWidget;
    title: QLabel;
    artist: QLabel;
    duration: QLabel;
    apply: QPushButton;
    onClick: () => void;
  }[] = [];

  constructor() {
    super();
    this.setWindowTitle('Lyrics Finder');
    const systemIcon = new QIcon(IconMusicPicture);
    super.setWindowIcon(systemIcon);

    const screens = QApplication.screens();
    const maxRight = Math.max(...screens.map(screen => screen.geometry().left() + (screen.geometry().width() * screen.devicePixelRatio())));
    const maxBottom = Math.max(...screens.map(screen => screen.geometry().top() + (screen.geometry().height() * screen.devicePixelRatio())));

    const width = Math.min(400, maxRight * 0.8);
    const height = Math.min(800, maxBottom * 0.8);

    this.resize(width, height);
    this.setMinimumSize(width, height);
    this.setMaximumSize(width, height);
    this.setFixedSize(width, height);


    this.artist = new QLineEdit();
    this.title = new QLineEdit();
    this.duration = new QTimeEdit();
    this.duration.setDisplayFormat('hh:mm:ss');

    const layout = new FlexLayout();
    const root = new QWidget();
    root.setObjectName('root');
    root.setLayout(layout);

    const nowPlayingView = new NowPlayingView();
    layout.addWidget(nowPlayingView);

    const formData = [
      ['작곡가', this.artist],
      ['제목', this.title],
      ['재생시간', this.duration],
    ] as const;

    for (const [label, widget] of formData) {
      const row = new QWidget();
      const rowLayout = new FlexLayout();
      rowLayout.setObjectName('')
      row.setLayout(rowLayout);
      row.setInlineStyle(`
        width: ${this.width()}px;

        flex-direction: row;
        padding: 4px;
      `);

      const qLabel = new QLabel();
      qLabel.setText(label);
      qLabel.setInlineStyle(`
        width: 60px;
      `);
      rowLayout.addWidget(qLabel);

      widget.setInlineStyle(`
        flex: 1;
      `);
      rowLayout.addWidget(widget);

      layout.addWidget(row);
    }

    const pushButton = new QPushButton();
    pushButton.setText('Search');
    pushButton.addEventListener('clicked', async () => {
      const durationQtime = this.duration.time()
      this.search(this.artist.text(), this.title.text(), (durationQtime.hour() * 3600 + durationQtime.minute() * 60 + durationQtime.second()) * 1000);
    });

    layout.addWidget(pushButton);

    this.searchResultContainer = new QWidget();
    const searchResultLayout = new FlexLayout();
    this.searchResultContainer.setObjectName('search-container');
    this.searchResultContainer.setLayout(searchResultLayout);

    for (let i = 0; i < 10; i += 1) {
      const itemContainer = new QWidget();
      const itemContainerLayout = new FlexLayout();
      itemContainer.setObjectName('item-container');
      itemContainer.setLayout(itemContainerLayout);

      const text = new QWidget();
      const textLayout = new FlexLayout();
      text.setLayout(textLayout);
      text.setObjectName('text');

      const title = new QLabel();
      title.setObjectName('title');
      const artist = new QLabel();
      artist.setObjectName('artist');
      const duration = new QLabel();
      duration.setObjectName('duration');
      const apply = new QPushButton();
      apply.setText('적용');
      apply.setObjectName('apply');

      textLayout.addWidget(title);
      textLayout.addWidget(artist);

      itemContainerLayout.addWidget(text);
      itemContainerLayout.addWidget(duration);
      itemContainerLayout.addWidget(apply);

      this.searchResultItems[i] = {
        container: itemContainer,
        title,
        artist,
        duration,
        apply,
        onClick: () => {},
      };
      searchResultLayout.addWidget(itemContainer);
    }

    layout.addWidget(this.searchResultContainer);

    root.setStyleSheet(`
      #root {
        background-color: #f8fafc;   
      }

      #item-container {
        height: 60px;
        flex-direction: row;
        padding: 10px 16px;
        margin: 2px 4px;

        border-radius: 12px;
        background-color: #f1f5f9;
      }
      #item-container:hover {
        background-color: #e2e8f0;
      }

      #text {
        flex: 1;
        flex-direction: column;
      }

      #title {
        font-size: 16px;
        font-weight: bold;
      }

      #artist {
        font-size: 14px;
      }

      #duration {
        width: 60px;
        text-align: center;
      }

      #apply {
        width: 80px;

        background-color: #ccfbf1;
        outline: none;
        border: none;

        padding: 8px 4px;
        border-radius: 12px;

        font-weight: bold;
        color: #14b8a6;
      }
      #apply:hover {
        background-color: #99f6e4;
      }
      #apply-disabled {
        background-color: #94a3b8;
        outline: none;
        border: none;

        padding: 8px 4px;
        border-radius: 12px;

        font-weight: bold;
        color: #f8fafc;
      }
    `);

    this.setCentralWidget(root);
  }

  override show() {
    super.show();

    this.artist.setText(api.info.artist);
    this.title.setText(api.info.title);

    const durationSecs = ~~(api.info.duration / 1000);
    const duration = new QTime(~~(durationSecs / 3600), ~~(durationSecs / 60), api.info.duration % 60);
    this.duration.setTime(duration);

    this.search(api.info.artist, api.info.title, api.info.duration);
  }

  async search(artist: string, title: string, duration: number) {
    const result = await alsong(artist, title, {
      playtime: duration,
    }).catch(() => []) as Awaited<ReturnType<typeof alsong.getLyricListByArtistName>>;

    this.searchResultItems.forEach((item, index) => {
      if (result[index]) {
        item.title.setText(result[index].title);
        item.artist.setText(result[index].artist);
        const playTimeSecs = result[index].playtime / 1000;
        const playTime = new QTime(~~(playTimeSecs / 3600), ~~(playTimeSecs / 60), result[index].playtime % 60);
        item.duration.setText(playTime.toString('hh:mm:ss'));
        if (lyricsMapper.hasLyricId(result[index].lyricId)) {
          item.apply.setObjectName('apply-disabled');
          item.apply.setText('적용됨');
        } else {
          item.apply.setObjectName('apply');
          item.apply.setText('적용');
        }

        if (item.onClick) item.apply.removeEventListener('clicked', item.onClick);
        item.onClick = () => {
          lyricsMapper.set(api.info.coverUrl, result[index].lyricId);

          this.search(artist, title, duration);
        };

        item.apply.addEventListener('clicked', item.onClick);
      } else {
        item.title.setText('N/A');
        item.artist.setText('');
        item.duration.setText('');
      }
    });
  }
}

export default LyricsFinderWindow;
