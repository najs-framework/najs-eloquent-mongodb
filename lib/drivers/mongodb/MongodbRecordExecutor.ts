/// <reference types="najs-eloquent" />

import Model = NajsEloquent.Model.IModel
import { Collection } from 'mongodb'
import { NajsEloquent as NajsEloquentLib } from 'najs-eloquent'
import { MongodbQueryLog } from './MongodbQueryLog'
import { MongodbConvention } from './MongodbConvention'

export class MongodbRecordExecutor extends NajsEloquentLib.Driver.RecordExecutorBase {
  protected logger: MongodbQueryLog
  protected collection: Collection

  constructor(model: Model, record: NajsEloquentLib.Driver.Record, collection: Collection, logger: MongodbQueryLog) {
    super(model, record, new MongodbConvention())
    this.collection = collection
    this.logger = logger
  }

  async createRecord<R = any>(action: string): Promise<R> {
    const data = this.record.toObject()
    this.logRaw('insertOne', data).action(`${this.model.getModelName()}.${action}()`)

    return this.shouldExecute()
      ? this.collection.insertOne(data).then(response => {
          return this.logger.end({
            result: response.result,
            insertedId: response.insertedId,
            insertedCount: response.insertedCount
          })
        })
      : this.logger.end({})
  }

  async updateRecord<R = any>(action: string): Promise<R> {
    const filter = this.getFilter()
    const modifiedData = this.getModifiedData()

    const data = { $set: modifiedData }
    this.logRaw('updateOne', filter, data).action(`${this.model.getModelName()}.${action}()`)

    return this.shouldExecute()
      ? this.collection.updateOne(filter, data).then(response => {
          return this.logger.end({
            result: response.result,
            upsertedId: response.upsertedId,
            upsertedCount: response.upsertedCount
          })
        })
      : this.logger.end({})
  }

  async hardDeleteRecord<R = any>(): Promise<R> {
    const filter = this.getFilter()

    this.logRaw('deleteOne', filter).action(`${this.model.getModelName()}.hardDelete()`)
    return this.shouldExecute()
      ? this.collection.deleteOne(filter).then(response => {
          return this.logger.end({
            result: response.result,
            deletedCount: response.deletedCount
          })
        })
      : this.logger.end({})
  }

  getModifiedData() {
    return this.record.getModified().reduce((data, name) => {
      data[this.convention.formatFieldName(name)] = this.record.getAttribute(name)
      return data
    }, {})
  }

  getFilter() {
    const primaryKeyValue = this.model.getPrimaryKey()
    if (!primaryKeyValue) {
      return {}
    }

    return { [this.convention.formatFieldName(this.model.getPrimaryKeyName())]: primaryKeyValue }
  }

  logRaw(func: string, ...args: any[]): MongodbQueryLog {
    const passed = []
    for (let i = 0, l = args.length; i < l; i++) {
      passed.push(args[i])
      if (i !== l - 1) {
        passed.push(',')
      }
    }
    return this.logger.raw('db.', this.collection.collectionName, `.${func}(`, ...passed, ')')
  }
}
