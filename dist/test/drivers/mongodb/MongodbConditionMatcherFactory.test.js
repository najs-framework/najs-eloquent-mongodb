"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("jest");
const najs_binding_1 = require("najs-binding");
const MongodbConditionMatcher_1 = require("../../../lib/drivers/mongodb/MongodbConditionMatcher");
const MongodbConditionMatcherFactory_1 = require("../../../lib/drivers/mongodb/MongodbConditionMatcherFactory");
describe('MongodbConditionMatcherFactory', function () {
    it('implements NajsEloquent.QueryBuilder.IConditionMatcherFactory, Autoload under name "NajsEloquent.Driver.Mongodb.MongodbConditionMatcherFactory" with singleton option', function () {
        const factory = najs_binding_1.make(MongodbConditionMatcherFactory_1.MongodbConditionMatcherFactory.className);
        const instance = najs_binding_1.make(MongodbConditionMatcherFactory_1.MongodbConditionMatcherFactory.className);
        expect(factory === instance).toBe(true);
        expect(factory.getClassName()).toEqual('NajsEloquent.Driver.Mongodb.MongodbConditionMatcherFactory');
    });
    describe('.make()', function () {
        it('returns an instance of MongodbConditionMatcher', function () {
            const factory = najs_binding_1.make(MongodbConditionMatcherFactory_1.MongodbConditionMatcherFactory.className);
            const data = {
                field: 'a',
                operator: '=',
                value: 'anything'
            };
            const matcher = factory.make(data);
            expect(matcher).toBeInstanceOf(MongodbConditionMatcher_1.MongodbConditionMatcher);
            expect(matcher.toMongodbQuery()).toEqual({ a: 'anything' });
        });
    });
    describe('.transform()', function () {
        it('does nothing, just return the given object', function () {
            const factory = najs_binding_1.make(MongodbConditionMatcherFactory_1.MongodbConditionMatcherFactory.className);
            const given = {};
            expect(factory.transform(given) === given).toBe(true);
        });
    });
});
