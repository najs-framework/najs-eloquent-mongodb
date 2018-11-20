"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("jest");
const Sinon = require("sinon");
const najs_eloquent_1 = require("najs-eloquent");
const MongodbQueryBuilder_1 = require("../../../lib/drivers/mongodb/MongodbQueryBuilder");
const MongodbQueryBuilderHandler_1 = require("../../../lib/drivers/mongodb/MongodbQueryBuilderHandler");
describe('MongodbQueryBuilder', function () {
    it('extends QueryBuilder', function () {
        const model = {};
        const instance = new MongodbQueryBuilder_1.MongodbQueryBuilder(new MongodbQueryBuilderHandler_1.MongodbQueryBuilderHandler(model));
        expect(instance).toBeInstanceOf(najs_eloquent_1.NajsEloquent.QueryBuilder.QueryBuilder);
    });
    describe('.native()', function () {
        it('simply calls and returns QueryExecutor.native()', function () {
            const fakeExecutor = {
                native() {
                    return 'anything';
                }
            };
            const fakeHandler = {
                getQueryExecutor() {
                    return fakeExecutor;
                }
            };
            const queryBuilder = new MongodbQueryBuilder_1.MongodbQueryBuilder(fakeHandler);
            const spy = Sinon.spy(fakeExecutor, 'native');
            const handler = {};
            expect(queryBuilder.native(handler)).toEqual('anything');
            expect(spy.calledWith(handler)).toBe(true);
        });
    });
    describe('.collection()', function () {
        it('simply calls and returns QueryExecutor.getCollection()', function () {
            const fakeExecutor = {
                getCollection() {
                    return 'anything';
                }
            };
            const fakeHandler = {
                getQueryExecutor() {
                    return fakeExecutor;
                }
            };
            const queryBuilder = new MongodbQueryBuilder_1.MongodbQueryBuilder(fakeHandler);
            const spy = Sinon.spy(fakeExecutor, 'getCollection');
            expect(queryBuilder.collection()).toEqual('anything');
            expect(spy.calledWith()).toBe(true);
        });
    });
});
