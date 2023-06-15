import fs from 'fs/promises';
import path from 'path';

import utils from './utils/Config';
import Alspotify from './Alspotify';

const config = utils();

class LyricsMapper {
  private optionsDirectory = path.join(__dirname, 'options', 'lyrics.json'); // options/lyrics.txt
  private data = new Map<string, number>(); // cover_url, lyricId

  private syncThrottle: NodeJS.Timeout | null = null;

  set(coverId: string, lyricId: number) {
    this.data.set(coverId, lyricId);
    Alspotify().updateLyric({});

    this.tryToSync();
  }

  get(id: string): number | undefined {
    return this.data.get(id);
  }

  hasLyricId(lyricId: number) {
    return [...this.data.values()].includes(lyricId);
  }

  public tryToSync() {
    if (this.syncThrottle !== null) clearTimeout(this.syncThrottle);
    
    this.syncThrottle = setTimeout(async () => {
      this.writeToFile();
    }, config.syncThrottle);
  }

  public async readFromFile(force = false) {
    const rawData = await fs.readFile(this.optionsDirectory, 'utf-8');
    const data = JSON.parse(rawData);
    const result = new Map(Object.entries(data));

    if (force || this.data.size === 0) {
      this.data = result;
      Alspotify().updateLyric({});
    }
  }
  
  public async writeToFile() {
    await fs.mkdir(path.dirname(this.optionsDirectory), { recursive: true });

    const jsonData = Object.fromEntries(this.data);
    const rawData = JSON.stringify(jsonData, null, 2);
    await fs.writeFile(this.optionsDirectory, rawData, 'utf-8');
  }
}

export const lyricsMapper = new LyricsMapper();

export default () => lyricsMapper;
