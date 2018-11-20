"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("jest");
const najs_binding_1 = require("najs-binding");
const MongodbQueryLog_1 = require("../../../lib/drivers/mongodb/MongodbQueryLog");
const MongodbExecutorFactory_1 = require("../../../lib/drivers/mongodb/MongodbExecutorFactory");
const MongodbProviderFacade_1 = require("../../../lib/facades/global/MongodbProviderFacade");
const MongodbRecordExecutor_1 = require("../../../lib/drivers/mongodb/MongodbRecordExecutor");
const MongodbQueryExecutor_1 = require("../../../lib/drivers/mongodb/MongodbQueryExecutor");
describe('MongodbExecutorFactory', function () {
    it('implements IAutoload and register with singleton option = true', function () {
        const a = najs_binding_1.make(MongodbExecutorFactory_1.MongodbExecutorFactory.className);
        const b = najs_binding_1.make(MongodbExecutorFactory_1.MongodbExecutorFactory.className);
        expect(a.getClassName()).toEqual('NajsEloquent.Driver.Mongodb.MongodbExecutorFactory');
        expect(a === b).toBe(true);
    });
    describe('.makeRecordExecutor()', function () {
        it('creates new instance of MongodbRecordExecutor with model, record, collection and logger', function () {
            const model = {
                getRecordName() {
                    return 'any';
                }
            };
            const record = {};
            const mongodbDatabase = {
                collection(name) {
                    return 'collection-' + name;
                }
            };
            const stub = MongodbProviderFacade_1.MongodbProviderFacade.getFacade().createStub('getDatabase');
            stub.returns(mongodbDatabase);
            const factory = najs_binding_1.make(MongodbExecutorFactory_1.MongodbExecutorFactory.className);
            const recordExecutor = factory.makeRecordExecutor(model, record);
            expect(recordExecutor).toBeInstanceOf(MongodbRecordExecutor_1.MongodbRecordExecutor);
            expect(recordExecutor['model'] === model).toBe(true);
            expect(recordExecutor['record'] === record).toBe(true);
            expect(recordExecutor['collection']).toEqual('collection-any');
            stub.restore();
        });
    });
    describe('.makeQueryExecutor()', function () {
        it('creates new instance of MongodbQueryExecutor with model, record, collection and logger', function () {
            const basicQuery = {};
            const model = {
                getRecordName() {
                    return 'any';
                }
            };
            const handler = {
                getQueryName() {
                    return 'test';
                },
                getBasicQuery() {
                    return basicQuery;
                },
                getModel() {
                    return model;
                }
            };
            const mongodbDatabase = {
                collection(name) {
                    return { collectionName: name };
                }
            };
            const stub = MongodbProviderFacade_1.MongodbProviderFacade.getFacade().createStub('getDatabase');
            stub.returns(mongodbDatabase);
            const factory = najs_binding_1.make(MongodbExecutorFactory_1.MongodbExecutorFactory.className);
            const queryExecutor = factory.makeQueryExecutor(handler);
            expect(queryExecutor).toBeInstanceOf(MongodbQueryExecutor_1.MongodbQueryExecutor);
            expect(queryExecutor['queryHandler'] === handler).toBe(true);
            stub.restore();
        });
    });
    describe('.getCollection()', function () {
        it('returns collection by calling MongodbProviderFacade.getDatabase().collection()', function () {
            const model = {
                getRecordName() {
                    return 'any';
                }
            };
            const mongodbDatabase = {
                collection(name) {
                    return 'collection-' + name;
                }
            };
            const stub = MongodbProviderFacade_1.MongodbProviderFacade.getFacade().createStub('getDatabase');
            stub.returns(mongodbDatabase);
            const factory = najs_binding_1.make(MongodbExecutorFactory_1.MongodbExecutorFactory.className);
            expect(factory.getCollection(model)).toEqual('collection-any');
            stub.restore();
        });
    });
    describe('.makeLogger()', function () {
        it('simply create new MongodbQueryLog', function () {
            const factory = najs_binding_1.make(MongodbExecutorFactory_1.MongodbExecutorFactory.className);
            expect(factory.makeLogger()).toBeInstanceOf(MongodbQueryLog_1.MongodbQueryLog);
        });
    });
});
