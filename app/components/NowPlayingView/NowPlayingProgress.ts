import {QWidget} from '@nodegui/nodegui';
import Alspotify from '../../Alspotify';
import utils from '../../utils/Config';

const api = Alspotify();
const config = utils();

class NowPlayingProgress extends QWidget {
  private parentView: QWidget;

  constructor(parent: QWidget) {
    super();

    this.parentView = parent;
    this.setObjectName('NowPlayingProgress');

    config.$observe(() => {
      this.setInlineStyle(`
        background: ${config.style.nowPlaying.backgroundProgress};
        border-radius: 5px;
      `);
    });

    api.info.$observe(() => {
      const percentage = Math.min(Math.max(api.info.progress / api.info.duration, 0), 1);

      if (isFinite(percentage)) {
        const size = this.parentView.size();
        this.setGeometry(
          0,
          0,
          size.width() * percentage,
          size.height()
        );
      }
    });
  }
}

export default NowPlayingProgress;
