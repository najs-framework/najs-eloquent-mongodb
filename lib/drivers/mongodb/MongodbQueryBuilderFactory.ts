/// <reference types="najs-eloquent" />

import { register } from 'najs-binding'
import { ClassNames } from '../../constants'
import { MongodbQueryBuilder } from './MongodbQueryBuilder'
import { MongodbQueryBuilderHandler } from './MongodbQueryBuilderHandler'

export class MongodbQueryBuilderFactory implements NajsEloquent.QueryBuilder.IQueryBuilderFactory {
  static className: string = ClassNames.Driver.Mongodb.MongodbQueryBuilderFactory

  getClassName() {
    return ClassNames.Driver.Mongodb.MongodbQueryBuilderFactory
  }

  make(model: NajsEloquent.Model.IModel): MongodbQueryBuilder<any> {
    return new MongodbQueryBuilder(new MongodbQueryBuilderHandler(model))
  }
}
register(MongodbQueryBuilderFactory, ClassNames.Driver.Mongodb.MongodbQueryBuilderFactory, true, true)
