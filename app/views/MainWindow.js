const config = require('../utils/Config')();

const {
	FlexLayout,
	QMainWindow,
	QWidget,
	WidgetAttribute,
	WindowType,
	QIcon
} = require('@nodegui/nodegui');

const LyricsView = require('../components/LyricsView');
const NowPlayingView = require('../components/NowPlayingView');


class MainWindow extends QMainWindow {
	constructor() {
		super();
		this.setWindowTitle('Alspotify');
		this.setWindowIcon(new QIcon('../assets/IconMusic.png'));
		this.setWindowFlag(WindowType.FramelessWindowHint, true);
		this.setWindowFlag(WindowType.WindowStaysOnTopHint, true);
		this.setWindowFlag(WindowType.WindowTransparentForInput, true);
		this.setWindowFlag(WindowType.SubWindow, true); // TODO: System Tray
		this.setAttribute(WidgetAttribute.WA_NoSystemBackground, true);
		this.setAttribute(WidgetAttribute.WA_TranslucentBackground, true);

		const layout = new FlexLayout();
		const widget = new QWidget();
		widget.setObjectName('Root');
		widget.setLayout(layout);

		layout.addWidget(new LyricsView());
		layout.addWidget(new NowPlayingView());
		
		this.setCentralWidget(widget);

		config.$observe(() => {
			this.setGeometry(
				config.windowPosition.x, config.windowPosition.y,
				config.windowPosition.w, config.windowPosition.h
			);
		});

		config.$observe(() => {
			widget.setStyleSheet(`
				#Root {
					width: ${config.windowPosition.w}px;
					align-items: flex-end;
					flex-direction: column;
				}
			`);
		});
	}
}

module.exports = MainWindow;
