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


class LyricItem extends QLabel {
	constructor(lyricId) {
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
			if(config.lyric.overflow === 'wrap') {
				this.setWordWrap(true);
			}
		});

		api.$observe(() => {
			if(!api.lyric || !api.lyric.current)
				return;

			let currentLyric = api.lyric.current[lyricId];
			if(currentLyric)
				currentLyric = currentLyric.trim();

			if(currentLyric) {
				if(!this.isVisible())
					this.show();

				const boundingRect = this.fontMetrics.boundingRect(currentLyric);
				const elideWidth = config.style.lyric.width - 20;

				if(boundingRect.width() > elideWidth) {
					if(config.lyric.overflow === 'elide') {
						currentLyric = this.fontMetrics.elidedText(currentLyric, TextElideMode.ElideRight, elideWidth);
					}
				}

				this.setText(currentLyric);
				this.setFixedSize(boundingRect.width() + 20, boundingRect.height() + 10);
			} else {
				if(this.isVisible()) {
					this.setText('');
					this.hide();
				}
			}
		});
	}
}

module.exports = LyricItem;
