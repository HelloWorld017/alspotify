import {Direction, QBoxLayout, QWidget} from '@nodegui/nodegui';
import utils from '../../utils/Config';
import LyricItem from './LyricItem';

const config = utils();

class LyricsView extends QWidget {

  constructor() {
    super();

    this.setObjectName('LyricView');

    config.$observe(() => {

      const layout = new QBoxLayout(Direction.TopToBottom);
      this.setLayout(layout);

      for (let i = 0; i < config.lyric.count; i++) {
        const lyric = new LyricItem(i);
        const labelLayout = new QBoxLayout(Direction.RightToLeft);
        layout.addLayout(labelLayout);

        switch (config.style.lyric.align) {
          case 'left':
            labelLayout.addStretch(1);
            labelLayout.addWidget(lyric);
            break;

          case 'right':
            labelLayout.addWidget(lyric);
            labelLayout.addStretch(1);
            break;

          case 'center':
            labelLayout.addWidget(lyric);
        }
      }
    });

    config.$observe(() => {
      this.setInlineStyle(`
        width: ${config.style.lyric.width}px;
        height: ${config.style.lyric.height}px;
        margin-bottom: 20px;
      `);
    });
  }
}

export default LyricsView;
