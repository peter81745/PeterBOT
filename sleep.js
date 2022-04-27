'use strict'

class Sleep {
    constructor(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

module.exports = Sleep;