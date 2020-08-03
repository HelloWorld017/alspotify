const config = require('../../utils/Config')();

const {
	Direction,
	QBoxLayout,
	QWidget
} = require('@nodegui/nodegui');

const LyricItem = require('./LyricItem');


class LyricsView extends QWidget {
	constructor() {
		super();

		this.setObjectName('LyricView');

		config.$observe(() => {
			this.lyrics = [];

			const layout = new QBoxLayout(Direction.TopToBottom);

			for(let i = 0; i < config.lyric.count; i++) {
				const lyric = new LyricItem(i);
				const labelLayout = new QBoxLayout(Direction.RightToLeft);
				layout.addLayout(labelLayout);

				switch(config.style.lyric.align) {
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

				this.lyrics.push(lyric);
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

module.exports = LyricsView;
