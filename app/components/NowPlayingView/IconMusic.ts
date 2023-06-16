import {AspectRatioMode, QLabel, QPixmap, TransformationMode} from '@nodegui/nodegui';
import utils from '../../utils/Config';
import path from 'path';

const config = utils();

// eslint-disable-next-line @typescript-eslint/no-var-requires
const IconMusicPicture = path.resolve(process.env.NODE_ENV === 'production' ? __dirname : `${__dirname}/../../`, './assets/IconMusic.png');

class IconMusic extends QLabel {
  constructor() {
    super();

    this.setObjectName('IconMusic');
    this.setInlineStyle(`
      padding: 0 5px;
    `);

    const iconImage = new QPixmap(IconMusicPicture);

    config.$observe(() => {
      const iconScaled = iconImage.scaled(
        config.style.nowPlaying.fontSize * 2,
        config.style.nowPlaying.fontSize * 2,
        AspectRatioMode.KeepAspectRatio,
        TransformationMode.SmoothTransformation
      );

      this.setPixmap(iconScaled);
    });
  }
}

export default IconMusic;
