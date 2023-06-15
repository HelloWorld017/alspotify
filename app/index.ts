
import MainWindow from './views/MainWindow';
import Alspotify from './Alspotify';

const api = Alspotify();

(async () => {
  await api.until();

  const win = new MainWindow();
  win.show();
})();
