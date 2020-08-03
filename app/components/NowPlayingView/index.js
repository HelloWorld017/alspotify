const config = require('../../utils/Config')();

const {
	FlexLayout,
	QWidget
} = require('@nodegui/nodegui');

const IconMusic = require('./IconMusic');
const NowPlayingLabel = require('./NowPlayingLabel');
const NowPlayingProgress = require('./NowPlayingProgress');


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

module.exports = NowPlayingView;
