"use strict";
/// <reference types="najs-eloquent" />
Object.defineProperty(exports, "__esModule", { value: true });
const najs_binding_1 = require("najs-binding");
const constants_1 = require("../../constants");
const MongodbRecordExecutor_1 = require("./MongodbRecordExecutor");
const MongodbQueryExecutor_1 = require("./MongodbQueryExecutor");
const MongodbProviderFacade_1 = require("../../facades/global/MongodbProviderFacade");
const MongodbQueryLog_1 = require("./MongodbQueryLog");
class MongodbExecutorFactory {
    makeRecordExecutor(model, record) {
        return new MongodbRecordExecutor_1.MongodbRecordExecutor(model, record, this.getCollection(model), this.makeLogger());
    }
    makeQueryExecutor(handler) {
        return new MongodbQueryExecutor_1.MongodbQueryExecutor(handler, this.getCollection(handler.getModel()), this.makeLogger());
    }
    getClassName() {
        return constants_1.ClassNames.Driver.Mongodb.MongodbExecutorFactory;
    }
    getCollection(model) {
        return MongodbProviderFacade_1.MongodbProviderFacade.getDatabase().collection(model.getRecordName());
    }
    makeLogger() {
        return new MongodbQueryLog_1.MongodbQueryLog();
    }
}
MongodbExecutorFactory.className = constants_1.ClassNames.Driver.Mongodb.MongodbExecutorFactory;
exports.MongodbExecutorFactory = MongodbExecutorFactory;
najs_binding_1.register(MongodbExecutorFactory, constants_1.ClassNames.Driver.Mongodb.MongodbExecutorFactory, true, true);
