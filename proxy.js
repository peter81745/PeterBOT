'use strict'

const ProxyAgent = require('proxy-agent')
const HTTP = require('http');

class Proxy {
    type;
    host;
    port;

    constructor(type, host, port) {
        this.type = type;
        this.host = host;
        this.port = port;
    }

    getType() {
        return this.type;
    }

    getHost() {
        return this.host;
    }

    getPort() {
        return this.port;
    }

    async check() {
        await HTTP.get({
            method: 'GET',
            host: 'ifconfig.me',
            path: '/',
            agent: new ProxyAgent({ protocol: 'socks'+this.getType()+':', host: this.getHost(), port: this.getPort() })
          }, (res) => {
            if (res.statusCode === 200) {
              return true;
            }
            return false;
          });
    }
}

module.exports = Proxy;