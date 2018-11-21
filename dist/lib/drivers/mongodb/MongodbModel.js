"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const najs_eloquent_1 = require("najs-eloquent");
const MongodbDriver_1 = require("./MongodbDriver");
class MongodbModel extends najs_eloquent_1.Model {
    makeDriver() {
        if (!najs_eloquent_1.DriverProvider.has(MongodbDriver_1.MongodbDriver)) {
            najs_eloquent_1.DriverProvider.register(MongodbDriver_1.MongodbDriver, MongodbDriver_1.MongodbDriver.name);
            najs_eloquent_1.DriverProvider.bind(this.getModelName(), MongodbDriver_1.MongodbDriver.name);
        }
        return super.makeDriver();
    }
    newQuery() {
        return super.newQuery();
    }
    getNativeCollection() {
        return this.newQuery().collection();
    }
}
exports.MongodbModel = MongodbModel;
najs_eloquent_1.NajsEloquent.Util.PrototypeManager.stopFindingRelationsIn(MongodbModel.prototype);
