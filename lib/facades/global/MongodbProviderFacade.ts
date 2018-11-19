/// <reference path="../../contracts/MongodbProvider.ts" />

import '../../providers/MongodbProvider'
import { make } from 'najs-binding'
import { Facade, IFacade, IFacadeBase } from 'najs-facade'
import { NajsEloquentFacadeContainer } from 'najs-eloquent'
import { MongoClient, Db } from 'mongodb'
import { ClassNames } from '../../constants'

export interface IMongodbProviderFacade extends Najs.Contracts.Eloquent.MongodbProvider<MongoClient, Db> {}

const facade = Facade.create<IMongodbProviderFacade>(NajsEloquentFacadeContainer, 'MongodbProvider', function() {
  return make<IMongodbProviderFacade>(ClassNames.Provider.MongodbProvider)
})

export const MongodbProviderFacade: IMongodbProviderFacade & IFacade = facade
export const MongodbProvider: IMongodbProviderFacade & IFacadeBase = facade
