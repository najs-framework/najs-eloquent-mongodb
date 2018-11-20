import 'jest'
import * as Sinon from 'sinon'
import { NajsEloquent as NajsEloquentLib } from 'najs-eloquent'
import { MongodbQueryBuilder } from '../../../lib/drivers/mongodb/MongodbQueryBuilder'
import { MongodbQueryBuilderHandler } from '../../../lib/drivers/mongodb/MongodbQueryBuilderHandler'

describe('MongodbQueryBuilder', function() {
  it('extends QueryBuilder', function() {
    const model: any = {}
    const instance = new MongodbQueryBuilder(new MongodbQueryBuilderHandler(model))
    expect(instance).toBeInstanceOf(NajsEloquentLib.QueryBuilder.QueryBuilder)
  })

  describe('.native()', function() {
    it('simply calls and returns QueryExecutor.native()', function() {
      const fakeExecutor = {
        native() {
          return 'anything'
        }
      }
      const fakeHandler: any = {
        getQueryExecutor() {
          return fakeExecutor
        }
      }

      const queryBuilder = new MongodbQueryBuilder(fakeHandler)
      const spy = Sinon.spy(fakeExecutor, 'native')

      const handler: any = {}
      expect(queryBuilder.native(handler)).toEqual('anything')
      expect(spy.calledWith(handler)).toBe(true)
    })
  })

  describe('.collection()', function() {
    it('simply calls and returns QueryExecutor.getCollection()', function() {
      const fakeExecutor = {
        getCollection() {
          return 'anything'
        }
      }
      const fakeHandler: any = {
        getQueryExecutor() {
          return fakeExecutor
        }
      }

      const queryBuilder = new MongodbQueryBuilder(fakeHandler)
      const spy = Sinon.spy(fakeExecutor, 'getCollection')

      expect(queryBuilder.collection()).toEqual('anything')
      expect(spy.calledWith()).toBe(true)
    })
  })
})
