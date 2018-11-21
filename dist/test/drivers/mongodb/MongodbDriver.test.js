"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("jest");
const Sinon = require("sinon");
const NajsBinding = require("najs-binding");
const najs_eloquent_1 = require("najs-eloquent");
const MongodbDriver_1 = require("../../../lib/drivers/mongodb/MongodbDriver");
const MongodbQueryBuilderFactory_1 = require("../../../lib/drivers/mongodb/MongodbQueryBuilderFactory");
describe('MongodbDriver', function () {
    it('extends DriverBase, implements Autoload under name "NajsEloquent.Driver.MongodbDriver"', function () {
        const driver = new MongodbDriver_1.MongodbDriver();
        expect(driver).toBeInstanceOf(najs_eloquent_1.NajsEloquent.Driver.DriverBase);
        expect(driver.getClassName()).toEqual('NajsEloquent.Driver.MongodbDriver');
    });
    describe('constructor()', function () {
        it('makes RecordManager from "NajsEloquent.Feature.RecordManager" class', function () {
            const makeSpy = Sinon.spy(NajsBinding, 'make');
            const driver = new MongodbDriver_1.MongodbDriver();
            expect(makeSpy.lastCall.calledWith(najs_eloquent_1.NajsEloquent.Driver.RecordManager)).toBe(true);
            expect(driver['recordManager']).toBeInstanceOf(najs_eloquent_1.NajsEloquent.Driver.RecordManager);
            makeSpy.restore();
        });
    });
    describe('.getClassName()', function () {
        it('implements Autoload under name "NajsEloquent.Driver.MongodbDriver"', function () {
            const driver = new MongodbDriver_1.MongodbDriver();
            expect(driver.getClassName()).toEqual('NajsEloquent.Driver.MongodbDriver');
        });
    });
    describe('.getRecordManager()', function () {
        it('simply returns property "recordManager"', function () {
            const driver = new MongodbDriver_1.MongodbDriver();
            expect(driver.getRecordManager() === driver['recordManager']).toBe(true);
        });
    });
    describe('.makeQueryBuilderFactory()', function () {
        it('creates and returns an instance of MongodbQueryBuilderFactory', function () {
            const driver = new MongodbDriver_1.MongodbDriver();
            const factory1 = driver.makeQueryBuilderFactory();
            const factory2 = driver.makeQueryBuilderFactory();
            expect(factory1 === factory2).toBe(true);
            expect(factory1).toBeInstanceOf(MongodbQueryBuilderFactory_1.MongodbQueryBuilderFactory);
        });
    });
});
