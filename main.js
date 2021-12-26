const root = '/Volumes/Sup G/Nick/Music/iTunes/iTunes Media/Music';
const target = './MP3s/';

// https://nodejs.org/api/fs.html
const fs = require('fs'); 
const fsp = require('fs').promises;
const url = require('urlencode');
// https://www.npmjs.com/package/music-metadata
const mm = require('music-metadata');

const mp3copy = async function (path) {
  let items = await fsp.readdir(path);
  for (let i=0; i<items.length; i++) {
    let item = path + '/' + items[i];
    let stats = await fsp.stat(item);
    if (stats.isDirectory()) {
      await mp3copy(item);
    }
    else if (items[i].toLowerCase().endsWith('.mp3')) {
      try {
        let metadata = await mm.parseFile(item);
        let mp3 = {
          file : items[i],
          genre : metadata.common.genre &&
                  metadata.common.genre.length > 0 ?
                  metadata.common.genre[0] : 'Other',
          bpm : metadata.common.bpm,
          bitrate : metadata.format.bitrate
        }
        let dir = target + (mp3.bitrate != 320000 ? 'LowBit' : url(mp3.genre));

        if (!fs.existsSync(dir)){
          fs.mkdirSync(dir);
        }

        if (mp3.genre != 'Mix') {
          let options = fs.constants.COPYFILE_EXCL; // don't overwrite
          await fsp.copyFile(item, dir + '/' + mp3.file, options);
        }

      } catch (error) {
        console.log('Error copying ' + item);
        console.error(error.message);
      }
    }

    //if (i > 50)  return; // debug
  }

  return;
}

const run = async function() {
  console.log('Running mp3copy on ' + root);
  await mp3copy(root);
  console.log('Work complete!');
}

run();
