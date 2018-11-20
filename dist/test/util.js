"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const MongodbProviderFacade_1 = require("../lib/facades/global/MongodbProviderFacade");
function init_mongodb(name) {
    return MongodbProviderFacade_1.MongodbProviderFacade.connect('mongodb://localhost:27017/najs_eloquent_test_' + name);
}
exports.init_mongodb = init_mongodb;
function delete_collection_use_mongodb(name) {
    return MongodbProviderFacade_1.MongodbProviderFacade.getDatabase()
        .collection(name)
        .drop();
}
exports.delete_collection_use_mongodb = delete_collection_use_mongodb;
