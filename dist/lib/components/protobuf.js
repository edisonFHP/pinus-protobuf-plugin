"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const path = require("path");
const protobufjs_1 = require("protobufjs");
const SERVER = 'server';
const CLIENT = 'client';
class ProtobufComponent {
    constructor(app, opts) {
        this.name = '__decodeIO__protobuf__';
        this.app = app;
        this.version = 0;
        this.watchers = {};
        opts = opts || {};
        this.serverProtosPath = opts.serverProtos || '/config/serverProtos.json';
        this.clientProtosPath = opts.clientProtos || '/config/clientProtos.json';
    }
    start(cb) {
        this.setProtos(SERVER, path.join(this.app.getBase(), this.serverProtosPath));
        this.setProtos(CLIENT, path.join(this.app.getBase(), this.clientProtosPath));
        this.serverProtoRoot = protobufjs_1.default.loadSync(path.join(this.app.getBase(), this.serverProtosPath));
        this.clientProtoRoot = protobufjs_1.default.loadSync(path.join(this.app.getBase(), this.clientProtosPath));
        process.nextTick(cb);
    }
    check(type, route) {
        switch (type) {
            case SERVER:
                if (!this.serverProtoRoot) {
                    return null;
                }
                return this.serverProtoRoot.lookup(route);
                break;
            case CLIENT:
                if (!this.clientProtoRoot) {
                    return null;
                }
                return this.clientProtoRoot.lookup(route);
                break;
            default:
                throw new Error('decodeIO meet with error type of protos, type: ' + type + ' route: ' + route);
                break;
        }
    }
    encode(route, message) {
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
        const ProtoMessage = this.clientProtoRoot.lookupType(route);
        if (!ProtoMessage) {
            throw Error('not such route ' + route);
        }
        const msg = ProtoMessage.decode(message);
        return ProtoMessage.toObject(msg);
    }
    getProtos() {
        return {
            server: this.serverProtos,
            client: this.clientProtos,
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
            this.serverProtos = require(path);
        }
        if (type === CLIENT) {
            this.clientProtos = require(path);
        }
        var time = fs.statSync(path).mtime.getTime();
        if (this.version < time) {
            this.version = time;
        }
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
                    this.serverProtos = JSON.parse(data);
                }
                else {
                    this.clientProtos = JSON.parse(data);
                }
                this.version = fs.statSync(path).mtime.getTime();
            }
            catch (e) {
                console.debug(e.stack);
            }
        });
    }
    stop(force, cb) {
        for (var type in this.watchers) {
            this.watchers[type].close();
        }
        this.watchers = {};
        process.nextTick(cb);
    }
}
exports.ProtobufComponent = ProtobufComponent;
