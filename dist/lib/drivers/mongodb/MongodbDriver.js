"use strict";
/// <reference types="najs-eloquent" />
Object.defineProperty(exports, "__esModule", { value: true });
const najs_binding_1 = require("najs-binding");
const najs_eloquent_1 = require("najs-eloquent");
const constants_1 = require("../../constants");
const MongodbQueryBuilderFactory_1 = require("./MongodbQueryBuilderFactory");
const MongodbExecutorFactory_1 = require("./MongodbExecutorFactory");
class MongodbDriver extends najs_eloquent_1.NajsEloquent.Driver.DriverBase {
    constructor() {
        super();
        this.recordManager = najs_binding_1.make(najs_eloquent_1.NajsEloquent.Driver.RecordManager, [najs_binding_1.make(MongodbExecutorFactory_1.MongodbExecutorFactory.className)]);
    }
    getClassName() {
        return constants_1.ClassNames.Driver.MongodbDriver;
    }
    getRecordManager() {
        return this.recordManager;
    }
    makeQueryBuilderFactory() {
        return najs_binding_1.make(MongodbQueryBuilderFactory_1.MongodbQueryBuilderFactory.className);
    }
}
MongodbDriver.Name = 'mongodb';
exports.MongodbDriver = MongodbDriver;
najs_binding_1.register(MongodbDriver, constants_1.ClassNames.Driver.MongodbDriver);
