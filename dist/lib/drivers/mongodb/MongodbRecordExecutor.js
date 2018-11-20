"use strict";
/// <reference types="najs-eloquent" />
Object.defineProperty(exports, "__esModule", { value: true });
const najs_eloquent_1 = require("najs-eloquent");
const MongodbConvention_1 = require("./MongodbConvention");
class MongodbRecordExecutor extends najs_eloquent_1.NajsEloquent.Driver.RecordExecutorBase {
    constructor(model, record, collection, logger) {
        super(model, record, new MongodbConvention_1.MongodbConvention());
        this.collection = collection;
        this.logger = logger;
    }
    async createRecord(action) {
        const data = this.record.toObject();
        this.logRaw('insertOne', data).action(`${this.model.getModelName()}.${action}()`);
        return this.shouldExecute()
            ? this.collection.insertOne(data).then(response => {
                return this.logger.end({
                    result: response.result,
                    insertedId: response.insertedId,
                    insertedCount: response.insertedCount
                });
            })
            : this.logger.end({});
    }
    async updateRecord(action) {
        const filter = this.getFilter();
        const modifiedData = this.getModifiedData();
        const data = { $set: modifiedData };
        this.logRaw('updateOne', filter, data).action(`${this.model.getModelName()}.${action}()`);
        return this.shouldExecute()
            ? this.collection.updateOne(filter, data).then(response => {
                return this.logger.end({
                    result: response.result,
                    upsertedId: response.upsertedId,
                    upsertedCount: response.upsertedCount
                });
            })
            : this.logger.end({});
    }
    async hardDeleteRecord() {
        const filter = this.getFilter();
        this.logRaw('deleteOne', filter).action(`${this.model.getModelName()}.hardDelete()`);
        return this.shouldExecute()
            ? this.collection.deleteOne(filter).then(response => {
                return this.logger.end({
                    result: response.result,
                    deletedCount: response.deletedCount
                });
            })
            : this.logger.end({});
    }
    getModifiedData() {
        return this.record.getModified().reduce((data, name) => {
            data[this.convention.formatFieldName(name)] = this.record.getAttribute(name);
            return data;
        }, {});
    }
    getFilter() {
        const primaryKeyValue = this.model.getPrimaryKey();
        if (!primaryKeyValue) {
            return {};
        }
        return { [this.convention.formatFieldName(this.model.getPrimaryKeyName())]: primaryKeyValue };
    }
    logRaw(func, ...args) {
        const passed = [];
        for (let i = 0, l = args.length; i < l; i++) {
            passed.push(args[i]);
            if (i !== l - 1) {
                passed.push(',');
            }
        }
        return this.logger.raw('db.', this.collection.collectionName, `.${func}(`, ...passed, ')');
    }
}
exports.MongodbRecordExecutor = MongodbRecordExecutor;
