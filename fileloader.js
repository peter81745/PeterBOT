'use strict'

const fs = require('fs');

class FileLoader {
    constructor($filepath) {
        this.filepath = $filepath;
        this.file = fs.readFileSync(this.filepath).toString();
    }

    toArray() {
        return this.file.split("\r\n");
    }

    toJSON() {
        return JSON.parse(this.file);
    }
}

module.exports = FileLoader;