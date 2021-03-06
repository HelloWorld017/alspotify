const config = require('../../utils/Config')();

const {
	AspectRatioMode,
	TransformationMode,
	QLabel,
	QPixmap
} = require('@nodegui/nodegui');

const IconMusicPicture = require('../../assets/IconMusic.png');


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

module.exports = IconMusic;
