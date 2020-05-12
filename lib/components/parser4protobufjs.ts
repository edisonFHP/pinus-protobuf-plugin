
/**
 * [parse the original protos, give the paresed result can be used by protobuf encode/decode.]
 * @param   {[Object]} protos Original protos, in a js map.
 * @return {[Object]} The presed result, a js object represent all the meta data of the given protos.
 */
export class Parser4protobufjs {
    static parse(protos: { [key: string]: any }) {
        let maps: { [key: string]: any } = {};
        for (let key in protos) {
            const params = key.split(' ');
            let msgKey;
            if (params[0] === 'message') {
                msgKey = params[1];
            } else {
                msgKey = key;
            }
            maps.nested = maps.nested || {};
            msgKey = this.normalizeRoute(msgKey);
            maps.nested[msgKey] = this.parseObject(protos[key]);
        }

        return maps;
    }

    /**
     * [parse a single protos, return a object represent the result. The method can be invocked recursively.]
     * @param  {[Object]} obj The origin proto need to parse.
     * @return {[Object]} The parsed result, a js object.
     */
    private static parseObject(obj: { [key: string]: any }) {
        let proto: { [key: string]: any } = {};

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
                    // params length should be 3 and tag can't be duplicated
                    if (params.length !== 3) {
                        continue;
                    }
                    const field: any = {
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

    static normalizeRoute(route: string) {
        return route.split('.').join('');
    }

    private static normalizeTypeName(type: string) {
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