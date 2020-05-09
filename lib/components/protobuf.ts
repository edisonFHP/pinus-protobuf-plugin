import * as fs from 'fs';
import * as  path from 'path';
import * as Logger from 'pinusmod-logger';
const logger = Logger.getLogger('ragdoll', __filename);
import { Root, loadSync } from 'protobufjs';
import { Application, IComponent } from 'pinusmod';
import { Parser4client } from './parser4client';
import { Parser4protobufjs } from './parser4protobufjs';

const SERVER = 'server';
const CLIENT = 'client';

export class ProtobufComponent implements IComponent {
    app: Application;
    version: number;
    watchers: { [type: string]: any };
    serverProtosPath: string;
    clientProtosPath: string;
    serverProtoRoot: Root;
    clientProtoRoot: Root;
    serverProtosJson: any;
    clientProtosJson: any;
    serverProtos: any;
    clientProtos: any;
    name = '__decodeIO__protobuf__';

    constructor(app: Application, opts) {
        this.app = app;
        this.version = 0;
        this.watchers = {};
        opts = opts || {};
        this.serverProtosPath = opts.serverProtos || '/config/serverProtos.json';
        this.clientProtosPath = opts.clientProtos || '/config/clientProtos.json';
        console.error('new Protobuf');
    }

    start(cb) {
        console.error('Protobuf start');
        this.setProtos(SERVER, path.join(this.app.getBase(), this.serverProtosPath));
        this.setProtos(CLIENT, path.join(this.app.getBase(), this.clientProtosPath));

        console.error('serverProtos', this.serverProtos);
        console.error('clientProtos', this.clientProtos);

        this.serverProtoRoot = Root.fromJSON(this.serverProtos);
        this.clientProtoRoot = Root.fromJSON(this.clientProtos);

        console.error('root server', this.serverProtoRoot.toJSON(), this.serverProtoRoot.toString());
        console.error('root client', this.clientProtoRoot.toJSON(), this.clientProtoRoot.toString());

        process.nextTick(cb);
    }

    check(type, route) {
        console.error('Protobuf check', { type, route });
        switch (type) {
            case SERVER:
                if (!this.serverProtoRoot) {
                    return null;
                }
                console.error('lookup', this.serverProtoRoot.lookup(route));
                console.error('lookupType', this.serverProtoRoot.lookupType(route));
                return this.serverProtoRoot.lookup(route);
                break;
            case CLIENT:
                if (!this.clientProtoRoot) {
                    return null;
                }
                console.error('lookup', this.clientProtoRoot.lookup(route));
                console.error('lookupType', this.clientProtoRoot.lookupType(route));
                return this.clientProtoRoot.lookup(route);
                break;
            default:
                throw new Error('decodeIO meet with error type of protos, type: ' + type + ' route: ' + route);
                break;
        }
    }

    encode(route, message) {
        console.error('protobuf decode', route);
        const ProtoMessage = this.serverProtoRoot.lookupType(route);
        if (!ProtoMessage) {
            throw Error('not such route ' + route);
        }
        const errMsg = ProtoMessage.verify(message);
        if (errMsg) {
            throw Error(errMsg);
        }
        const msg = ProtoMessage.create(message);
        return ProtoMessage.encode(msg).finish();
    }

    decode(route, message) {
        console.error('protobuf decode', route);
        const ProtoMessage = this.clientProtoRoot.lookupType(route);
        if (!ProtoMessage) {
            throw Error('not such route ' + route);
        }
        const msg = ProtoMessage.decode(message);
        const obj = ProtoMessage.toObject(msg);
        console.error('protobuf decode result =', obj);
        return obj;
    }

    getProtos() {
        return {
            server: Parser4client.parse(this.serverProtosJson),
            client: Parser4client.parse(this.clientProtosJson),
            version: this.version
        };
    }

    getVersion() {
        return this.version;
    }

    setProtos(type, path) {
        if (!fs.existsSync(path)) {
            return;
        }

        if (type === SERVER) {
            this.serverProtosJson = require(path);
            this.serverProtos = Parser4protobufjs.parse(this.serverProtosJson);
        }

        if (type === CLIENT) {
            this.clientProtosJson = require(path);
            this.clientProtos = Parser4protobufjs.parse(this.clientProtosJson);
        }

        //Set version to modify time
        var time = fs.statSync(path).mtime.getTime();
        if (this.version < time) {
            this.version = time;
        }

        //Watch file
        var watcher = fs.watch(path, this.onUpdate.bind(this, type, path));
        if (this.watchers[type]) {
            this.watchers[type].close();
        }
        this.watchers[type] = watcher;
    }

    onUpdate(type, path, event) {
        if (event !== 'change') {
            return;
        }

        fs.readFile(path, 'utf8', function (err, data) {
            try {
                if (type === SERVER) {
                    this.serverProtosJson = JSON.parse(data);
                    this.serverProtos = Parser4protobufjs.parse(this.serverProtosJson);
                } else {
                    this.clientProtosJson = JSON.parse(data);
                    this.clientProtos = Parser4protobufjs.parse(this.clientProtosJson);
                }

                this.version = fs.statSync(path).mtime.getTime();
            } catch (e) {
                console.debug(e.stack);
            }
        });
    }

    stop(force, cb) {
        console.error('Protobuf stop');
        for (var type in this.watchers) {
            this.watchers[type].close();
        }
        this.watchers = {};
        process.nextTick(cb);
    }
}