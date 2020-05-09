"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Parser4client {
    static parse(protos) {
        let maps = {};
        for (let key in protos) {
            maps[key] = this.parseObject(protos[key]);
        }
        return maps;
    }
    static parseObject(obj) {
        let proto = {};
        let nestProtos = {};
        let tags = {};
        for (let name in obj) {
            let tag = obj[name];
            let params = name.split(' ');
            switch (params[0]) {
                case 'message':
                    if (params.length !== 2) {
                        continue;
                    }
                    nestProtos[params[1]] = this.parseObject(tag);
                    continue;
                case 'required':
                case 'optional':
                case 'repeated': {
                    if (params.length !== 3 || !!tags[tag]) {
                        continue;
                    }
                    proto[params[2]] = {
                        option: params[0],
                        type: params[1],
                        tag: tag
                    };
                    tags[tag] = params[2];
                }
            }
        }
        proto.__messages = nestProtos;
        proto.__tags = tags;
        return proto;
    }
}
exports.Parser4client = Parser4client;
