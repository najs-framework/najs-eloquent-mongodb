import 'jest'
import { make } from 'najs-binding'
import { MongodbConditionMatcher } from '../../../lib/drivers/mongodb/MongodbConditionMatcher'
import { MongodbConditionMatcherFactory } from '../../../lib/drivers/mongodb/MongodbConditionMatcherFactory'

describe('MongodbConditionMatcherFactory', function() {
  it('implements NajsEloquent.QueryBuilder.IConditionMatcherFactory, Autoload under name "NajsEloquent.Driver.Mongodb.MongodbConditionMatcherFactory" with singleton option', function() {
    const factory = make<MongodbConditionMatcherFactory>(MongodbConditionMatcherFactory.className)
    const instance = make<MongodbConditionMatcherFactory>(MongodbConditionMatcherFactory.className)
    expect(factory === instance).toBe(true)
    expect(factory.getClassName()).toEqual('NajsEloquent.Driver.Mongodb.MongodbConditionMatcherFactory')
  })

  describe('.make()', function() {
    it('returns an instance of MongodbConditionMatcher', function() {
      const factory = make<MongodbConditionMatcherFactory>(MongodbConditionMatcherFactory.className)
      const data: any = {
        field: 'a',
        operator: '=',
        value: 'anything'
      }
      const matcher = factory.make(data)
      expect(matcher).toBeInstanceOf(MongodbConditionMatcher)
      expect(matcher.toMongodbQuery()).toEqual({ a: 'anything' })
    })
  })

  describe('.transform()', function() {
    it('does nothing, just return the given object', function() {
      const factory = make<MongodbConditionMatcherFactory>(MongodbConditionMatcherFactory.className)
      const given: any = {}
      expect(factory.transform(given) === given).toBe(true)
    })
  })
})
