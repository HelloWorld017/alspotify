import { QApplication } from '@nodegui/nodegui';
import MainWindow from './views/MainWindow';

const app = QApplication.instance();
app.setQuitOnLastWindowClosed(false);

const win = new MainWindow();
win.show();
