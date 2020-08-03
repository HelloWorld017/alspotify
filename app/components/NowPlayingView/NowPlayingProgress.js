const api = require('../../Alspotify')();
const config = require('../../utils/Config')();

const {
	QWidget
} = require('@nodegui/nodegui');


class NowPlayingProgress extends QWidget {
	constructor(parent) {
		super();

		this.parentView = parent;
		this.setObjectName('NowPlayingProgress');

		config.$observe(() => {
			this.setInlineStyle(`
				background: ${config.style.nowPlaying.backgroundProgress};
				border-radius: 5px;
			`);
		});

		api.$observe(() => {
			const percentage = Math.min(Math.max(api.progress / api.duration, 0), 1);

			if(isFinite(percentage)) {
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

module.exports = NowPlayingProgress;
