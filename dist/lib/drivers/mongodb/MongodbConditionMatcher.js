"use strict";
/// <reference types="najs-eloquent" />
Object.defineProperty(exports, "__esModule", { value: true });
class MongodbConditionMatcher {
    constructor(field, operator, value) {
        this.field = field;
        this.operator = operator;
        this.value = value;
    }
    getField() {
        return this.field;
    }
    isMatch(record) {
        // It always returns false, mongodb will not use conditions matcher, it
        // just implements this interface then transform condition matchers to object
        return false;
    }
    toMongodbQuery() {
        return {
            [this.field]: this.getMongodbQueryValue()
        };
    }
    getMongodbQueryValue() {
        switch (this.operator) {
            case '!=':
            case '<>':
                return { $ne: this.value };
            case '<':
                return { $lt: this.value };
            case '<=':
            case '=<':
                return { $lte: this.value };
            case '>':
                return { $gt: this.value };
            case '>=':
            case '=>':
                return { $gte: this.value };
            case 'in':
                return { $in: this.value };
            case 'not-in':
                return { $nin: this.value };
            default:
                return this.value;
        }
    }
}
exports.MongodbConditionMatcher = MongodbConditionMatcher;
