
import MainWindow from './views/MainWindow';
import Alspotify from './Alspotify';
import { QApplication } from '@nodegui/nodegui';

const api = Alspotify();

(async () => {
  await api.until();

  const app = QApplication.instance();
  app.setQuitOnLastWindowClosed(false);

  const win = new MainWindow();
  win.show();
})();
