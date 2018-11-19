/// <reference types="najs-eloquent" />

import IConditionMatcherFactory = NajsEloquent.QueryBuilder.IConditionMatcherFactory
import SingleQueryConditionData = NajsEloquent.QueryBuilder.SingleQueryConditionData

import { register } from 'najs-binding'
import { ClassNames } from '../../constants'
import { MongodbConditionMatcher } from './MongodbConditionMatcher'

export class MongodbConditionMatcherFactory implements IConditionMatcherFactory {
  static className: string = ClassNames.Driver.Mongodb.MongodbConditionMatcherFactory

  getClassName() {
    return ClassNames.Driver.Mongodb.MongodbConditionMatcherFactory
  }

  make(data: SingleQueryConditionData): MongodbConditionMatcher {
    return new MongodbConditionMatcher(data.field, data.operator, data.value)
  }

  transform(matcher: MongodbConditionMatcher): MongodbConditionMatcher {
    return matcher
  }
}
register(MongodbConditionMatcherFactory, ClassNames.Driver.Mongodb.MongodbConditionMatcherFactory, true, true)
