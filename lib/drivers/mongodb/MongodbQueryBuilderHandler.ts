/// <reference types="najs-eloquent" />

import IModel = NajsEloquent.Model.IModel
import IConvention = NajsEloquent.QueryBuilder.IConvention
import IConditionQuery = NajsEloquent.QueryGrammar.IConditionQuery
import { make } from 'najs-binding'
import { NajsEloquent as NajsEloquentLib } from 'najs-eloquent'
import { MongodbConvention } from './MongodbConvention'
import { MongodbExecutorFactory } from './MongodbExecutorFactory'

export class MongodbQueryBuilderHandler extends NajsEloquentLib.QueryBuilder.QueryBuilderHandlerBase {
  protected basicQuery: NajsEloquentLib.QueryBuilder.Shared.BasicQuery
  protected conditionQuery: NajsEloquentLib.QueryBuilder.Shared.ConditionQueryHandler
  protected convention: NajsEloquent.QueryBuilder.IConvention

  constructor(model: IModel) {
    super(model, make<MongodbExecutorFactory>(MongodbExecutorFactory.className))
    this.convention = new MongodbConvention()
    this.basicQuery = new NajsEloquentLib.QueryBuilder.Shared.BasicQuery(this.convention)
    this.conditionQuery = new NajsEloquentLib.QueryBuilder.Shared.ConditionQueryHandler(
      this.basicQuery,
      this.convention
    )
  }

  getBasicQuery(): NajsEloquentLib.QueryBuilder.Shared.BasicQuery {
    return this.basicQuery
  }

  getConditionQuery(): IConditionQuery {
    return this.conditionQuery
  }

  getQueryConvention(): IConvention {
    return this.convention
  }
}
