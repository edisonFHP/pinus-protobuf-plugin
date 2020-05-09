"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Parser4protobufjs {
    static parse(obj) {
        let proto = {};
        for (let name in obj) {
            let tag = obj[name];
            let params = name.split(' ');
            switch (params[0]) {
                case 'message':
                    if (params.length !== 2) {
                        continue;
                    }
                    proto.nested = proto.nested || {};
                    proto.nested[params[1]] = this.parse(tag);
                    continue;
                case 'required':
                case 'optional':
                case 'repeated': {
                    if (params.length !== 3) {
                        continue;
                    }
                    const field = {
                        type: params[1],
                        id: tag
                    };
                    if (params[0] === 'repeated') {
                        field.rule = 'repeated';
                    }
                    proto.fields = proto.fields || {};
                    proto.fields[params[2]] = field;
                }
            }
        }
        return proto;
    }
    static parseObject(obj) {
        let proto = {};
        for (let name in obj) {
            let tag = obj[name];
            let params = name.split(' ');
            switch (params[0]) {
                case 'message':
                    if (params.length !== 2) {
                        continue;
                    }
                    proto.nested = proto.nested || {};
                    proto.nested[params[1]] = this.parseObject(tag);
                    continue;
                case 'required':
                case 'optional':
                case 'repeated': {
                    if (params.length !== 3) {
                        continue;
                    }
                    const field = {
                        type: params[1],
                        id: tag
                    };
                    if (params[0] === 'repeated') {
                        field.rule = 'repeated';
                    }
                    proto.fields = proto.fields || {};
                    proto.fields[params[2]] = field;
                }
            }
        }
        return proto;
    }
}
exports.Parser4protobufjs = Parser4protobufjs;
