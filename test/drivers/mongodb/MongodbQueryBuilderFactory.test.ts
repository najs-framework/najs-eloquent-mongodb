import 'jest'
import { make } from 'najs-binding'
import { MongodbQueryBuilder } from '../../../lib/drivers/mongodb/MongodbQueryBuilder'
import { MongodbQueryBuilderFactory } from '../../../lib/drivers/mongodb/MongodbQueryBuilderFactory'

describe('MongodbQueryBuilderFactory', function() {
  it('implements IAutoload and register with singleton option = true', function() {
    const a = make<MongodbQueryBuilderFactory>(MongodbQueryBuilderFactory.className)
    const b = make<MongodbQueryBuilderFactory>(MongodbQueryBuilderFactory.className)
    expect(a.getClassName()).toEqual('NajsEloquent.Driver.Mongodb.MongodbQueryBuilderFactory')
    expect(a === b).toBe(true)
  })

  describe('.make()', function() {
    it('creates new instance of MongodbQueryBuilder', function() {
      const model: any = {
        getRecordName() {
          return 'model'
        }
      }
      const factory = make<MongodbQueryBuilderFactory>(MongodbQueryBuilderFactory.className)
      const qb1 = factory.make(model)
      const qb2 = factory.make(model)
      expect(qb1).toBeInstanceOf(MongodbQueryBuilder)
      expect(qb1 === qb2).toBe(false)
    })
  })
})
