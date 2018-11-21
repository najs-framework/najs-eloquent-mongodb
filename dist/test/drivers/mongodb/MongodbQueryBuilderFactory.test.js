"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("jest");
const najs_binding_1 = require("najs-binding");
const MongodbQueryBuilder_1 = require("../../../lib/drivers/mongodb/MongodbQueryBuilder");
const MongodbQueryBuilderFactory_1 = require("../../../lib/drivers/mongodb/MongodbQueryBuilderFactory");
describe('MongodbQueryBuilderFactory', function () {
    it('implements IAutoload and register with singleton option = true', function () {
        const a = najs_binding_1.make(MongodbQueryBuilderFactory_1.MongodbQueryBuilderFactory.className);
        const b = najs_binding_1.make(MongodbQueryBuilderFactory_1.MongodbQueryBuilderFactory.className);
        expect(a.getClassName()).toEqual('NajsEloquent.Driver.Mongodb.MongodbQueryBuilderFactory');
        expect(a === b).toBe(true);
    });
    describe('.make()', function () {
        it('creates new instance of MongodbQueryBuilder', function () {
            const model = {
                getRecordName() {
                    return 'model';
                }
            };
            const factory = najs_binding_1.make(MongodbQueryBuilderFactory_1.MongodbQueryBuilderFactory.className);
            const qb1 = factory.make(model);
            const qb2 = factory.make(model);
            expect(qb1).toBeInstanceOf(MongodbQueryBuilder_1.MongodbQueryBuilder);
            expect(qb1 === qb2).toBe(false);
        });
    });
});
