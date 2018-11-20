/// <reference types="najs-eloquent" />

import IModel = NajsEloquent.Model.IModel
import IQueryBuilderHandler = NajsEloquent.QueryBuilder.IQueryBuilderHandler

import { register } from 'najs-binding'
import { Collection } from 'mongodb'
import { NajsEloquent as NajsEloquentLib } from 'najs-eloquent'
import { ClassNames } from '../../constants'
import { MongodbRecordExecutor } from './MongodbRecordExecutor'
import { MongodbQueryExecutor } from './MongodbQueryExecutor'
import { MongodbProviderFacade } from '../../facades/global/MongodbProviderFacade'
import { MongodbQueryBuilderHandler } from './MongodbQueryBuilderHandler'
import { MongodbQueryLog } from './MongodbQueryLog'

export class MongodbExecutorFactory implements NajsEloquent.Driver.IExecutorFactory {
  static className: string = ClassNames.Driver.Mongodb.MongodbExecutorFactory

  makeRecordExecutor<T extends NajsEloquentLib.Driver.Record>(model: IModel, record: T): MongodbRecordExecutor {
    return new MongodbRecordExecutor(model, record, this.getCollection(model), this.makeLogger())
  }

  makeQueryExecutor(handler: IQueryBuilderHandler): MongodbQueryExecutor {
    return new MongodbQueryExecutor(
      handler as MongodbQueryBuilderHandler,
      this.getCollection(handler.getModel()),
      this.makeLogger()
    )
  }

  getClassName() {
    return ClassNames.Driver.Mongodb.MongodbExecutorFactory
  }

  getCollection(model: IModel): Collection {
    return MongodbProviderFacade.getDatabase().collection(model.getRecordName())
  }

  makeLogger(): MongodbQueryLog {
    return new MongodbQueryLog()
  }
}
register(MongodbExecutorFactory, ClassNames.Driver.Mongodb.MongodbExecutorFactory, true, true)
