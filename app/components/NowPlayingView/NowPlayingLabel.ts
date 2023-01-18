import {QFont, QFontMetrics, QLabel, TextElideMode} from '@nodegui/nodegui';
import Alspotify from '../../Alspotify';
import utils from '../../utils/Config';

const api = Alspotify();
const config = utils();

class NowPlayingLabel extends QLabel {
  private fontMetrics: QFontMetrics;

  constructor() {
    super();

    this.setObjectName('NowPlayingLabel');
    this.setText('Not Playing');

    config.$observe(() => {
      this.setInlineStyle(`
        margin-left: 5px;
        color: ${config.style.nowPlaying.color};
        max-width: ${config.style.nowPlaying.width}px;
      `);
    });

    config.$observe(() => {
      const font = new QFont(config.style.font, config.style.nowPlaying.fontSize);
      this.setFont(font);
      this.fontMetrics = new QFontMetrics(font);
    });

    api.info.$observe(() => {
      if (typeof api.info.title !== 'string')
        {return;}

      const text = `${api.info.artist} - ${api.info.title}`;
      const elideWidth = config.style.nowPlaying.width - 50;
      const elidedText = this.fontMetrics.elidedText(
        text, TextElideMode.ElideRight, elideWidth, 0
      );
      this.setText(elidedText);
    });
  }
}

export default NowPlayingLabel;
