import { QApplication } from '@nodegui/nodegui';
import Alspotify from './Alspotify';
import MainWindow from './views/MainWindow';

const api = Alspotify();

void (async () => {
  await api.until();

  const app = QApplication.instance();
  app.setQuitOnLastWindowClosed(false);

  const win = new MainWindow();
  win.show();
})();
