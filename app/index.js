const config = require('./config')();
const store = require('./store');

const AlspotifyApi = require('./api');
const {
	FlexLayout,
	QMainWindow,
	QWidget,
	WidgetAttribute,
	WindowType
} = require("@nodegui/nodegui");
const LyricView = require('./components/LyricView');
const NowPlayingView = require('./components/NowPlayingView');

const win = new QMainWindow();
win.setWindowTitle("Alspotify");
win.setWindowFlag(WindowType.FramelessWindowHint, true);
win.setWindowFlag(WindowType.WindowStaysOnTopHint, true);
win.setWindowFlag(WindowType.WindowTransparentForInput, true);
win.setWindowFlag(WindowType.SubWindow, true);
win.setAttribute(WidgetAttribute.WA_NoSystemBackground, true);
win.setAttribute(WidgetAttribute.WA_TranslucentBackground, true);
win.setGeometry(
	config.windowPosition.x, config.windowPosition.y,
	config.windowPosition.w, config.windowPosition.h
);

const layout = new FlexLayout();
const widget = new QWidget();
widget.setObjectName("Root");
widget.setLayout(layout);
widget.setStyleSheet(`
	#Root {
		width: ${config.windowPosition.w}px;
		align-items: flex-end;
		flex-direction: column;
	}
`);

win.setCentralWidget(widget);

const lyricView = new LyricView();
layout.addWidget(lyricView.getWidget());

const nowPlayingView = new NowPlayingView();
layout.addWidget(nowPlayingView.getWidget());

win.show();
global.win = win;

const api = new AlspotifyApi();
api.init();
api.on('update', (newInfo) => {
	store.set(newInfo);
});
api.on('update-partial', key => {
	store.store[key] = api.info[key];
	store.propagate(key);
});
