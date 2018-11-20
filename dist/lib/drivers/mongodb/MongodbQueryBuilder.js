"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const najs_eloquent_1 = require("najs-eloquent");
class MongodbQueryBuilder extends najs_eloquent_1.NajsEloquent.QueryBuilder.QueryBuilder {
    native(handler) {
        const queryExecutor = this.handler.getQueryExecutor();
        return queryExecutor.native(handler);
    }
    collection() {
        const queryExecutor = this.handler.getQueryExecutor();
        return queryExecutor.getCollection();
    }
}
exports.MongodbQueryBuilder = MongodbQueryBuilder;
