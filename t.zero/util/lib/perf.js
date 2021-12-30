const path = require('path');

const xdg = require("@folder/xdg")();

const fsSync = require("fs");

const fs = require("fs/promises");

const JSONbigString = require('json-bigint')({
  storeAsString: true
});

class Perf {
  constructor(appName, fileName, options) {
    if (!appName || !fileName) {
      throw new Error("requires appName and fileName");
    }

    this.appName = appName;
    this.fileName = fileName;
    this.autoSaveID = null;
    this.saving = false;
    this.dir = path.join(xdg.config, appName);
    this.fullPath = path.join(this.dir, fileName);
    this._config = {};
    this._rawConfigContent = null;
    const {
      saveInterval
    } = options || {}; // exit does not accept async processor

    process.on("exit", () => {
      this.stopAutoSave();
      this.saveSync();
    });

    if (saveInterval > 0) {
      this.refresh(true).then(() => this.startAutoSave(saveInterval));
    } else {
      this.refresh(true);
    }
  }

  async refresh(allowMissing) {
    let content;

    try {
      content = await fs.readFile(this.fullPath);
    } catch (e) {
      if (allowMissing !== true) {
        throw e;
      }

      return;
    }

    if (content) {
      this._config = JSONbigString.parse(content);
      this._rawConfigContent = content;
    }
  }

  async save() {
    if (this.saving) {
      return;
    }

    const cfgJSON = JSONbigString.stringify(this._config);
    this.saving = true;

    try {
      await fs.mkdir(this.dir, {
        recursive: true
      }); // must create dir first

      await fs.writeFile(this.fullPath, cfgJSON);
      this._rawConfigContent = cfgJSON;
    } finally {
      this.saving = false;
    }
  }

  saveSync() {
    if (this.saving) {
      return;
    }

    const cfgJSON = JSONbigString.stringify(this._config);
    this.saving = true;

    try {
      // must create dir first
      fsSync.mkdirSync(this.dir, {
        recursive: true
      });
      fsSync.writeFileSync(this.fullPath, cfgJSON);
      this._rawConfigContent = cfgJSON;
    } finally {
      this.saving = false;
    }
  }

  startAutoSave(interval) {
    if (!(interval > 0)) {
      throw new Error("bad interval");
    }

    if (this.autoSaveID) {
      clearInterval(this.autoSaveID);
    }

    this.autoSaveID = setInterval(async () => await this.save(), interval);
  }

  stopAutoSave() {
    if (this.autoSaveID) {
      clearInterval(this.autoSaveID);
      this.autoSaveID = null;
    }

    this.saving = false;
  }

  get config() {
    return this._config;
  }

  get rawConfigContent() {
    return this._rawConfigContent;
  }

  get configJSON() {
    return JSONbigString.stringify(this._config);
  }

  get(k) {
    return this._config[k];
  }

  set(k, v) {
    this._config[k] = v;
  }
  remove(k) {
    delete this._config[k]
  }
}
function getConfDir(appName) {
  return path.join(xdg.config, appName);
}

// implements the localStorage interface
// not synchronized
class StorageFS {
  constructor(dir) {
    this.dir = dir
  }

  async getItem(k) {
    try {
      return await fs.readFile(path.join(this.dir, k), { encoding: "utf-8" })
    } catch (e) {
      // ignore
      return undefined
    }
  }
  async setItem(k, v) {
    const f = path.join(this.dir, k)
    try {
      // must create dir first
      await fs.mkdir(this.dir, {
        recursive: true
      });
      await fs.writeFile(f, String(v))
    } catch (e) {
      // ignore
      return undefined
    }
  }
  async removeItem(k) {
    if (!k) {
      return
    }
    await fs.rm(path.join(this.dir, k), {
      force: true,
    })
  }
}

module.exports = {
  StorageFS,
  getConfDir,
};