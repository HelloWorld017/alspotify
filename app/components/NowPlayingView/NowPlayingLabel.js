const api = require('../../Alspotify')();
const config = require('../../utils/Config')();

const {
	QFont,
	QLabel
} = require('@nodegui/nodegui');

const {
	QFontMetrics,
	TextElideMode
} = require('nodegui-plugin-metrics');


class NowPlayingLabel extends QLabel {
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

		api.$observe(() => {
			if(typeof api.title !== 'string')
				return;

			const text = `${api.artist} - ${api.title}`;
			const elideWidth = config.style.nowPlaying.width - 50;
			const elidedText = this.fontMetrics.elidedText(
				text, TextElideMode.ElideRight, elideWidth, 0
			);
			this.setText(elidedText);
		});
	}
}

module.exports = NowPlayingLabel;
