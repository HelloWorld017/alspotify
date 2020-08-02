const config = require('../config')();
const store = require('../store');

const {
	AspectRatioMode,
	FlexLayout,
	TransformationMode,
	QFont,
	QLabel,
	QPixmap,
	QWidget
} = require("@nodegui/nodegui");

const {
	QFontMetrics,
	TextElideMode
} = require("nodegui-plugin-metrics");


class NowPlayingView {
	constructor() {
		const layout = new FlexLayout();

		const nowPlaying = new QWidget();
		nowPlaying.setObjectName("NowPlaying");
		nowPlaying.setLayout(layout);
		nowPlaying.setStyleSheet(`
			#NowPlaying {
				flex-direction: row;
				background: ${config.style.nowPlaying.background};
				border-radius: 5px;
				padding: 10px;
			}

			#MusicIcon {
				padding: 0 5px;
			}

			#MusicText {
				margin-left: 5px;
				font-family: ${config.style.font};
				font-size: ${config.style.nowPlaying.fontSize};
				color: ${config.style.nowPlaying.color};
				max-width: ${config.style.nowPlaying.width}px;
			}

			#Progress {
				background: ${config.style.nowPlaying.backgroundProgress};
				border-radius: 5px;
			}
		`);

		const progress = new QWidget();
		progress.setObjectName("Progress");
		layout.addWidget(progress);
		this.progress = progress;

		const musicIconImage = new QPixmap("assets/IconMusic.png")
			.scaled(20, 20, AspectRatioMode.KeepAspectRatio, TransformationMode.SmoothTransformation);

		const musicIcon = new QLabel();
		musicIcon.setPixmap(musicIconImage);
		musicIcon.setObjectName("MusicIcon");
		layout.addWidget(musicIcon);

		const musicFont = new QFont(config.style.font, config.style.nowPlaying.fontSize);
		this.musicMetrics = new QFontMetrics(musicFont);

		const musicText = new QLabel();
		musicText.setFont(musicFont);
		musicText.setObjectName("MusicText");
		musicText.setText("Not Playing");
		layout.addWidget(musicText);
		this.musicText = musicText;

		this.widget = nowPlaying;
		store.watch(this);
	}

	getWidget() {
		return this.widget;
	}

	update(key, item) {
		if(key.includes('title') || key.includes('artist')) {
			const text = `${item.artist} - ${item.title}`;
			const elideWidth = config.style.nowPlaying.width - 50;
			const elidedText = this.musicMetrics.elidedText(
				text, TextElideMode.ElideRight, elideWidth, 0
			);
			this.musicText.setText(elidedText);
		}

		if(key.includes('progress') || key.includes('duration')) {
			const percentage = Math.min(Math.max(item.progress / item.duration, 0), 1);
			if(isFinite(percentage)) {
				const size = this.widget.size();
				this.progress.setGeometry(
					0,
					0,
					size.width() * percentage,
					size.height()
				);
			}
		}
	}
}

module.exports = NowPlayingView;
