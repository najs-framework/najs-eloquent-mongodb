"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("jest");
const najs_eloquent_1 = require("najs-eloquent");
const najs_eloquent_2 = require("najs-eloquent");
const MongodbQueryLog_1 = require("../../../lib/drivers/mongodb/MongodbQueryLog");
describe('MongodbQueryLog', function () {
    beforeEach(function () {
        najs_eloquent_1.QueryLog.clear().enable();
    });
    it('extends QueryLogBase', function () {
        const logger = new MongodbQueryLog_1.MongodbQueryLog();
        expect(logger).toBeInstanceOf(najs_eloquent_2.NajsEloquent.Driver.QueryLogBase);
    });
    describe('.getDefaultData()', function () {
        it('return empty "raw" and "queryBuilderData"', function () {
            const logger = new MongodbQueryLog_1.MongodbQueryLog();
            expect(logger.getDefaultData()).toEqual({ raw: '', queryBuilderData: {} });
        });
    });
    describe('.name()', function () {
        it('is chainable, sets the name to data', function () {
            const logger = new MongodbQueryLog_1.MongodbQueryLog();
            expect(logger.name('test') === logger).toBe(true);
            expect(logger['data']).toEqual({ raw: '', queryBuilderData: {}, name: 'test' });
        });
    });
    describe('.queryBuilderData()', function () {
        it('is chainable, sets the value to "queryBuilderData" with given key', function () {
            const logger = new MongodbQueryLog_1.MongodbQueryLog();
            expect(logger.queryBuilderData('test', 'value') === logger).toBe(true);
            expect(logger['data']).toEqual({ raw: '', queryBuilderData: { test: 'value' } });
            expect(logger.queryBuilderData('test', 'changed') === logger).toBe(true);
            expect(logger['data']).toEqual({ raw: '', queryBuilderData: { test: 'changed' } });
        });
    });
    describe('.query()', function () {
        it('is not chainable, set given data to "query" and returns given data', function () {
            const data = {};
            const logger = new MongodbQueryLog_1.MongodbQueryLog();
            expect(logger.query(data) === data).toBe(true);
            expect(logger['data']).toEqual({ query: data, raw: '', queryBuilderData: {} });
        });
    });
    describe('.options()', function () {
        it('is not chainable, set given data to "options" and returns given data', function () {
            const data = {};
            const logger = new MongodbQueryLog_1.MongodbQueryLog();
            expect(logger.options(data) === data).toBe(true);
            expect(logger['data']).toEqual({ options: data, raw: '', queryBuilderData: {} });
        });
    });
    describe('.action()', function () {
        it('is chainable, sets the action to data', function () {
            const logger = new MongodbQueryLog_1.MongodbQueryLog();
            expect(logger.action('test') === logger).toBe(true);
            expect(logger['data']).toEqual({ raw: '', queryBuilderData: {}, action: 'test' });
        });
    });
    describe('.raw()', function () {
        it('is chainable, appends all params to raw, if param is object it stringify param first', function () {
            const logger = new MongodbQueryLog_1.MongodbQueryLog();
            expect(logger.raw('1') === logger).toBe(true);
            expect(logger['data']).toEqual({ raw: '1', queryBuilderData: {} });
            logger.raw('2', { a: 1 }, '3');
            expect(logger['data']).toEqual({ raw: '12{"a":1}3', queryBuilderData: {} });
        });
    });
    describe('.end()', function () {
        it('assigns param to data under key "result", and push to QueryLog, then returns the result', function () {
            const result = {};
            const logger = new MongodbQueryLog_1.MongodbQueryLog();
            expect(logger.end(result) === result).toBe(true);
            expect(najs_eloquent_1.QueryLog.pull()[0].data).toEqual({ raw: '', queryBuilderData: {}, result: result });
        });
    });
});
