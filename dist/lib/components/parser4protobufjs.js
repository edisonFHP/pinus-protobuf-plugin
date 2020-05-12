"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Parser4protobufjs {
    static parse(protos) {
        let maps = {};
        for (let key in protos) {
            const params = key.split(' ');
            let msgKey;
            if (params[0] === 'message') {
                msgKey = params[1];
            }
            else {
                msgKey = key;
            }
            maps.nested = maps.nested || {};
            msgKey = this.normalizeRoute(msgKey);
            maps.nested[msgKey] = this.parseObject(protos[key]);
        }
        return maps;
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
                        type: this.normalizeTypeName(params[1]),
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
    static normalizeRoute(route) {
        return route.split('.').join('');
    }
    static normalizeTypeName(type) {
        const low = type.toLowerCase();
        switch (low) {
            case 'int32':
            case 'sint32':
            case 'uint32':
            case 'int64':
            case 'sint64':
            case 'uint64':
            case 'fixed32':
            case 'sfixed32':
            case 'fixed64':
            case 'sfixed64':
            case 'float':
            case 'double':
            case 'bool':
            case 'string':
            case 'bytes':
                return low;
            default:
                return type;
                break;
        }
    }
}
exports.Parser4protobufjs = Parser4protobufjs;
