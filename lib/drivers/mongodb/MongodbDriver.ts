/// <reference types="najs-eloquent" />

import { register, make } from 'najs-binding'
import { NajsEloquent as NajsEloquentLib } from 'najs-eloquent'
import { ClassNames } from '../../constants'
import { MongodbQueryBuilderFactory } from './MongodbQueryBuilderFactory'
import { MongodbExecutorFactory } from './MongodbExecutorFactory'

export class MongodbDriver<
  T extends NajsEloquentLib.Driver.Record = NajsEloquentLib.Driver.Record
> extends NajsEloquentLib.Driver.DriverBase<T> {
  protected recordManager: NajsEloquent.Feature.IRecordManager<T>
  static Name = 'mongodb'

  constructor() {
    super()

    this.recordManager = make(NajsEloquentLib.Driver.RecordManager, [make(MongodbExecutorFactory.className)])
  }

  getClassName() {
    return ClassNames.Driver.MongodbDriver
  }

  getRecordManager() {
    return this.recordManager
  }

  makeQueryBuilderFactory() {
    return make<MongodbQueryBuilderFactory>(MongodbQueryBuilderFactory.className)
  }
}
register(MongodbDriver, ClassNames.Driver.MongodbDriver)
