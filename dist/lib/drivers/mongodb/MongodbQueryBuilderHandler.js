"use strict";
/// <reference types="najs-eloquent" />
Object.defineProperty(exports, "__esModule", { value: true });
const najs_binding_1 = require("najs-binding");
const najs_eloquent_1 = require("najs-eloquent");
const MongodbConvention_1 = require("./MongodbConvention");
const MongodbExecutorFactory_1 = require("./MongodbExecutorFactory");
class MongodbQueryBuilderHandler extends najs_eloquent_1.NajsEloquent.QueryBuilder.QueryBuilderHandlerBase {
    constructor(model) {
        super(model, najs_binding_1.make(MongodbExecutorFactory_1.MongodbExecutorFactory.className));
        this.convention = new MongodbConvention_1.MongodbConvention();
        this.basicQuery = new najs_eloquent_1.NajsEloquent.QueryBuilder.Shared.BasicQuery(this.convention);
        this.conditionQuery = new najs_eloquent_1.NajsEloquent.QueryBuilder.Shared.ConditionQueryHandler(this.basicQuery, this.convention);
    }
    getBasicQuery() {
        return this.basicQuery;
    }
    getConditionQuery() {
        return this.conditionQuery;
    }
    getQueryConvention() {
        return this.convention;
    }
}
exports.MongodbQueryBuilderHandler = MongodbQueryBuilderHandler;
