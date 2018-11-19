"use strict";
/// <reference types="najs-eloquent" />
Object.defineProperty(exports, "__esModule", { value: true });
const najs_binding_1 = require("najs-binding");
const constants_1 = require("../../constants");
const MongodbConditionMatcher_1 = require("./MongodbConditionMatcher");
class MongodbConditionMatcherFactory {
    getClassName() {
        return constants_1.ClassNames.Driver.Mongodb.MongodbConditionMatcherFactory;
    }
    make(data) {
        return new MongodbConditionMatcher_1.MongodbConditionMatcher(data.field, data.operator, data.value);
    }
    transform(matcher) {
        return matcher;
    }
}
MongodbConditionMatcherFactory.className = constants_1.ClassNames.Driver.Mongodb.MongodbConditionMatcherFactory;
exports.MongodbConditionMatcherFactory = MongodbConditionMatcherFactory;
najs_binding_1.register(MongodbConditionMatcherFactory, constants_1.ClassNames.Driver.Mongodb.MongodbConditionMatcherFactory, true, true);
