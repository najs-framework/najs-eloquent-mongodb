"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const najs_binding_1 = require("najs-binding");
const MongodbConditionMatcherFactory_1 = require("./MongodbConditionMatcherFactory");
const najs_eloquent_1 = require("najs-eloquent");
const MongodbConditionMatcher_1 = require("./MongodbConditionMatcher");
class MongodbQueryConverter {
    constructor(basicQuery) {
        this.basicQuery = basicQuery;
    }
    getConvertedQuery() {
        return this.convert(this.getRawConvertedQueryFromBasicQueryConverter());
    }
    getRawConvertedQueryFromBasicQueryConverter() {
        const converter = new najs_eloquent_1.NajsEloquent.QueryBuilder.Shared.BasicQueryConverter(this.basicQuery, najs_binding_1.make(MongodbConditionMatcherFactory_1.MongodbConditionMatcherFactory.className));
        return converter.getConvertedQuery();
    }
    convert(rawQuery) {
        if (typeof rawQuery['$and'] === 'undefined') {
            if (typeof rawQuery['$or'] === 'undefined') {
                return {};
            }
            return { $or: this.toMongodbQuery(rawQuery['$or']) };
        }
        if (!this.shouldSimplify(rawQuery['$and'])) {
            return { $and: this.toMongodbQuery(rawQuery['$and']) };
        }
        return this.simplify(rawQuery['$and']);
    }
    toMongodbQuery(conditions) {
        const result = [];
        for (const condition of conditions) {
            if (condition instanceof MongodbConditionMatcher_1.MongodbConditionMatcher) {
                result.push(condition.toMongodbQuery());
                continue;
            }
            result.push(this.convert(condition));
        }
        return result;
    }
    simplify(conditions) {
        return conditions.reduce(function (result, condition) {
            result[condition.getField()] = condition.getMongodbQueryValue();
            return result;
        }, {});
    }
    shouldSimplify(conditions) {
        const fields = [];
        for (const condition of conditions) {
            if (!(condition instanceof MongodbConditionMatcher_1.MongodbConditionMatcher)) {
                return false;
            }
            const currentField = condition.getField();
            if (fields.indexOf(currentField) !== -1) {
                return false;
            }
            fields.push(currentField);
        }
        return true;
    }
}
exports.MongodbQueryConverter = MongodbQueryConverter;
