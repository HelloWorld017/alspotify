import {QFont, QFontMetrics, QLabel, TextElideMode} from '@nodegui/nodegui';
import Alspotify from '../../Alspotify';

import utils from '../../utils/Config';


const api = Alspotify();
const config = utils();

class LyricItem extends QLabel {
  private lyricId: number;
  private fontMetrics: QFontMetrics;

  constructor(lyricId: number) {
    super();

    this.lyricId = lyricId;
    this.setObjectName('LyricItem');
    this.hide();

    config.$observe(() => {
      this.setInlineStyle(`
        color: ${config.style.lyric.color};
        background: ${config.style.lyric.background};
        padding: 2px 5px;
        margin: 1px 0;
      `);
    });

    config.$observe(() => {
      const font = new QFont(config.style.font, config.style.lyric.fontSize);
      this.setFont(font);
      this.fontMetrics = new QFontMetrics(font);
    });

    config.$observe(() => {
      if (config.lyric.overflow === 'wrap') {
        this.setWordWrap(true);
      }
    });

    api.info.$observe(() => {
      if (!api.info.lyric || !api.info.lyric.current) return;

      let currentLyric = api.info.lyric.current[lyricId];
      if (currentLyric) currentLyric = currentLyric.trim();

      if (currentLyric) {
        if (!this.isVisible()) this.show();

        const boundingRect = this.fontMetrics.boundingRect(currentLyric);
        const elideWidth = config.style.lyric.width - 20;

        if (boundingRect.width() > elideWidth) {
          if (config.lyric.overflow === 'elide') {
            currentLyric = this.fontMetrics.elidedText(currentLyric, TextElideMode.ElideRight, elideWidth);
          }
        }

        this.setText(currentLyric);
        this.setFixedSize(boundingRect.width() + 20, boundingRect.height() + 10);
      } else {
        if (this.isVisible()) {
          this.setText('');
          this.hide();
        }
      }
    });
  }
}

export default LyricItem;
