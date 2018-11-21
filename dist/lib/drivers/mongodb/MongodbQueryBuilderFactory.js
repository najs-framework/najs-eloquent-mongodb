"use strict";
/// <reference types="najs-eloquent" />
Object.defineProperty(exports, "__esModule", { value: true });
const najs_binding_1 = require("najs-binding");
const constants_1 = require("../../constants");
const MongodbQueryBuilder_1 = require("./MongodbQueryBuilder");
const MongodbQueryBuilderHandler_1 = require("./MongodbQueryBuilderHandler");
class MongodbQueryBuilderFactory {
    getClassName() {
        return constants_1.ClassNames.Driver.Mongodb.MongodbQueryBuilderFactory;
    }
    make(model) {
        return new MongodbQueryBuilder_1.MongodbQueryBuilder(new MongodbQueryBuilderHandler_1.MongodbQueryBuilderHandler(model));
    }
}
MongodbQueryBuilderFactory.className = constants_1.ClassNames.Driver.Mongodb.MongodbQueryBuilderFactory;
exports.MongodbQueryBuilderFactory = MongodbQueryBuilderFactory;
najs_binding_1.register(MongodbQueryBuilderFactory, constants_1.ClassNames.Driver.Mongodb.MongodbQueryBuilderFactory, true, true);
