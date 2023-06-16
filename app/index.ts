import { QApplication } from '@nodegui/nodegui';
import Alspotify from './Alspotify';
import MainWindow from './views/MainWindow';

void (async () => {
  const alspotify = Alspotify();
  await alspotify.init();

  const app = QApplication.instance();
  app.setQuitOnLastWindowClosed(false);

  const win = new MainWindow();
  win.show();
})();
