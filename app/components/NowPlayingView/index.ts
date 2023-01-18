import {FlexLayout, QWidget} from '@nodegui/nodegui';
import utils from '../../utils/Config';
import IconMusic from './IconMusic';
import NowPlayingLabel from './NowPlayingLabel';
import NowPlayingProgress from './NowPlayingProgress';

const config = utils();

class NowPlayingView extends QWidget {
  constructor() {
    super();

    this.setObjectName('NowPlayingView');

    const layout = new FlexLayout();
    this.setLayout(layout);

    layout.addWidget(new NowPlayingProgress(this));
    layout.addWidget(new IconMusic());
    layout.addWidget(new NowPlayingLabel());

    config.$observe(() => {
      this.setInlineStyle(`
        flex-direction: row;
        background: ${config.style.nowPlaying.background};
        border-radius: 5px;
        padding: 10px;
      `);
    });
  }
}

export default NowPlayingView;
