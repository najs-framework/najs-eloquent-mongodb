"use strict";
/// <reference types="najs-eloquent" />
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = require("lodash");
const najs_eloquent_1 = require("najs-eloquent");
const MongodbQueryConverter_1 = require("./MongodbQueryConverter");
class MongodbQueryExecutor extends najs_eloquent_1.NajsEloquent.Driver.ExecutorBase {
    constructor(queryHandler, collection, logger) {
        super();
        this.queryHandler = queryHandler;
        this.basicQuery = queryHandler.getBasicQuery();
        this.collection = collection;
        this.collectionName = collection.collectionName;
        this.logger = logger;
        this.logger.name(this.queryHandler.getQueryName());
    }
    async get() {
        const query = this.makeQuery();
        const options = this.makeQueryOptions();
        const result = this.shouldExecute() ? await this.collection.find(query, options).toArray() : [];
        return this.logRaw(query, options, 'find')
            .raw('.toArray()')
            .action('get')
            .end(result);
    }
    async first() {
        const query = this.makeQuery();
        const options = this.makeQueryOptions();
        const result = this.shouldExecute() ? await this.collection.findOne(query, options) : undefined;
        return this.logRaw(query, options, 'findOne')
            .action('first')
            .end(result);
    }
    async count() {
        if (this.basicQuery.getSelect()) {
            this.basicQuery.clearSelect();
        }
        if (!lodash_1.isEmpty(this.basicQuery.getOrdering())) {
            this.basicQuery.clearOrdering();
        }
        const query = this.makeQuery();
        const options = this.makeQueryOptions();
        const result = this.shouldExecute() ? await this.collection.countDocuments(query, options) : 0;
        return this.logRaw(query, options, 'countDocuments')
            .action('count')
            .end(result);
    }
    async update(data) {
        const query = this.makeQuery();
        if (this.queryHandler.hasTimestamps()) {
            if (typeof data['$set'] === 'undefined') {
                data['$set'] = {};
            }
            data['$set'][this.queryHandler.getTimestampsSetting().updatedAt] = najs_eloquent_1.MomentProvider.make().toDate();
        }
        const result = this.shouldExecute()
            ? await this.collection.updateMany(query, data).then(function (response) {
                return response.result;
            })
            : {};
        return this.logger
            .raw('db.', this.collectionName, '.updateMany(', query, ', ', data, ')')
            .action('update')
            .end(result);
    }
    async delete() {
        if (!this.queryHandler.isUsed()) {
            return { n: 0, ok: 1 };
        }
        const query = this.makeQuery();
        if (lodash_1.isEmpty(query)) {
            return { n: 0, ok: 1 };
        }
        const result = this.shouldExecute()
            ? await this.collection.deleteMany(query).then(function (response) {
                return response.result;
            })
            : {};
        return this.logger
            .raw('db.', this.collectionName, '.deleteMany(', query, ')')
            .action('delete')
            .end(result);
    }
    async restore() {
        if (!this.queryHandler.hasSoftDeletes()) {
            return { n: 0, nModified: 0, ok: 1 };
        }
        const query = this.makeQuery();
        if (lodash_1.isEmpty(query)) {
            return { n: 0, nModified: 0, ok: 1 };
        }
        const fieldName = this.queryHandler.getSoftDeletesSetting().deletedAt;
        const data = {
            $set: { [fieldName]: this.queryHandler.getQueryConvention().getNullValueFor(fieldName) }
        };
        const result = this.shouldExecute()
            ? await this.collection.updateMany(query, data).then(function (response) {
                return response.result;
            })
            : {};
        return this.logger
            .raw('db.', this.collectionName, '.updateMany(', query, ', ', data, ')')
            .action('restore')
            .end(result);
    }
    native(handler) {
        const query = this.makeQuery();
        const options = this.makeQueryOptions();
        this.nativeHandlePromise = handler(this.collection, query, options);
        return this;
    }
    async execute() {
        if (this.nativeHandlePromise) {
            return this.shouldExecute()
                ? this.nativeHandlePromise.then((response) => {
                    this.nativeHandlePromise = undefined;
                    return response.result || response;
                })
                : Promise.resolve({});
        }
        return this.get();
    }
    getCollection() {
        return this.collection;
    }
    makeQuery() {
        najs_eloquent_1.NajsEloquent.QueryBuilder.Shared.ExecutorUtils.addSoftDeleteConditionIfNeeded(this.queryHandler);
        const conditions = new MongodbQueryConverter_1.MongodbQueryConverter(this.basicQuery).getConvertedQuery();
        return this.logger.queryBuilderData('conditions', conditions).query(conditions);
    }
    makeQueryOptions() {
        const options = {};
        const limit = this.basicQuery.getLimit();
        if (limit) {
            options['limit'] = limit;
            this.logger.queryBuilderData('limit', limit);
        }
        const ordering = Array.from(this.basicQuery.getOrdering().entries());
        if (ordering && ordering.length > 0) {
            this.logger.queryBuilderData('ordering', ordering);
            options['sort'] = ordering.reduce((memo, entry) => {
                memo.push([entry[0], entry[1] === 'asc' ? 1 : -1]);
                return memo;
            }, []);
        }
        const selected = this.basicQuery.getSelect();
        if (!lodash_1.isEmpty(selected)) {
            this.logger.queryBuilderData('select', selected);
            options['projection'] = selected.reduce((memo, key) => {
                memo[key] = 1;
                return memo;
            }, {});
        }
        return this.logger.options(lodash_1.isEmpty(options) ? undefined : options);
    }
    logRaw(query, options, func) {
        return this.logger.raw('db.', this.collectionName, `.${func}(`, query).raw(options ? ', ' : '', options, ')');
    }
}
exports.MongodbQueryExecutor = MongodbQueryExecutor;
