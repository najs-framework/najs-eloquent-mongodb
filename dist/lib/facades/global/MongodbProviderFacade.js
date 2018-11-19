"use strict";
/// <reference path="../../contracts/MongodbProvider.ts" />
Object.defineProperty(exports, "__esModule", { value: true });
require("../../providers/MongodbProvider");
const najs_binding_1 = require("najs-binding");
const najs_facade_1 = require("najs-facade");
const najs_eloquent_1 = require("najs-eloquent");
const constants_1 = require("../../constants");
const facade = najs_facade_1.Facade.create(najs_eloquent_1.NajsEloquentFacadeContainer, 'MongodbProvider', function () {
    return najs_binding_1.make(constants_1.ClassNames.Provider.MongodbProvider);
});
exports.MongodbProviderFacade = facade;
exports.MongodbProvider = facade;
