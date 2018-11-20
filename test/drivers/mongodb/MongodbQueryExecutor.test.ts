import 'jest'
import * as Sinon from 'sinon'
import { init_mongodb, delete_collection_use_mongodb } from '../../util'
import { QueryLog, MomentProvider, NajsEloquent as NajsEloquentLib } from 'najs-eloquent'
import { MongodbProviderFacade } from '../../../lib/facades/global/MongodbProviderFacade'
import { MongodbQueryBuilder } from '../../../lib/drivers/mongodb/MongodbQueryBuilder'
import { MongodbQueryBuilderHandler } from '../../../lib/drivers/mongodb/MongodbQueryBuilderHandler'
import { MongodbQueryExecutor } from '../../../lib/drivers/mongodb/MongodbQueryExecutor'

describe('MongodbQueryExecutor', function() {
  const dataset = [
    { first_name: 'john', last_name: 'doe', age: 30 },
    { first_name: 'jane', last_name: 'doe', age: 25 },
    { first_name: 'tony', last_name: 'stark', age: 40 },
    { first_name: 'thor', last_name: 'god', age: 1000 },
    { first_name: 'captain', last_name: 'american', age: 100 },
    { first_name: 'tony', last_name: 'stewart', age: 40 },
    { first_name: 'peter', last_name: 'parker', age: 15 }
  ]
  let collectionUsers: any, collectionRoles: any

  beforeAll(async function() {
    await init_mongodb('mongodb_query_executor')
    const db = MongodbProviderFacade.getDatabase()
    collectionUsers = db.collection('users')
    collectionRoles = db.collection('roles')
    for (const data of dataset) {
      await collectionUsers.save(data)
    }
    for (let i = 0; i < 10; i++) {
      await collectionRoles.save({
        name: 'role-' + i,
        deleted_at: new Date()
      })
    }
  })

  afterAll(async function() {
    delete_collection_use_mongodb('users')
    delete_collection_use_mongodb('roles')
  })

  beforeEach(function() {
    QueryLog.clear().enable()
  })

  function expect_match_user(result: any, expected: any) {
    for (const name in expected) {
      expect(result[name]).toEqual(expected[name])
    }
  }

  function expect_query_log(data: object, result: any = undefined, index: number = 0) {
    const logData = QueryLog.pull()[index]['data']
    if (typeof result !== undefined) {
      expect(logData['result'] === result).toBe(true)
    }
    expect(logData).toMatchObject(data)
  }

  function makeQueryBuilderHandler(model: any): MongodbQueryBuilderHandler {
    let fakeModel: any
    if (typeof model === 'string') {
      fakeModel = {
        getDriver() {
          return {
            getSoftDeletesFeature() {
              return {
                hasSoftDeletes() {
                  return false
                }
              }
            },
            getTimestampsFeature() {
              return {
                hasTimestamps() {
                  return false
                }
              }
            }
          }
        },

        getRecordName() {
          return model
        }
      }
    } else {
      fakeModel = model
    }

    return new MongodbQueryBuilderHandler(fakeModel)
  }

  function makeQueryBuilder(handler: MongodbQueryBuilderHandler): MongodbQueryBuilder<any> {
    return new MongodbQueryBuilder(handler)
  }

  it('extends NajsEloquent.Driver.ExecutorBase', function() {
    const executor = makeQueryBuilderHandler('users').getQueryExecutor()
    expect(executor).toBeInstanceOf(NajsEloquentLib.Driver.ExecutorBase)
  })

  describe('.get()', function() {
    it('gets all data of collection and return an instance of Collection<Eloquent<T>>', async function() {
      const handler = makeQueryBuilderHandler('users')
      const result = await handler.getQueryExecutor().get()

      expect_query_log(
        {
          raw: 'db.users.find({}).toArray()',
          action: 'get'
        },
        result
      )
      expect(result.length).toEqual(7)
      for (let i = 0; i < 7; i++) {
        expect_match_user(result[i], dataset[i])
      }
    })

    it('returns an empty collection if no result', async function() {
      const handler = makeQueryBuilderHandler('users')
      makeQueryBuilder(handler).where('first_name', 'no-one')
      const result = await handler.getQueryExecutor().get()

      expect_query_log(
        {
          raw: 'db.users.find({"first_name":"no-one"}).toArray()'
        },
        result
      )
      expect(result.length === 0).toBe(true)
    })

    it('can get data by query builder, case 1', async function() {
      const handler = makeQueryBuilderHandler('users')
      makeQueryBuilder(handler).where('age', 1000)
      const result = await handler.getQueryExecutor().get()

      expect_query_log(
        {
          raw: 'db.users.find({"age":1000}).toArray()',
          query: { age: 1000 },
          action: 'get'
        },
        result
      )
      expect(result.length).toEqual(1)
      expect_match_user(result[0], dataset[3])
    })

    it('can get data by query builder, case 2', async function() {
      const handler = makeQueryBuilderHandler('users')
      makeQueryBuilder(handler).where('age', 40)
      const result = await handler.getQueryExecutor().get()

      expect_query_log(
        {
          raw: 'db.users.find({"age":40}).toArray()',
          query: { age: 40 },
          action: 'get'
        },
        result
      )
      expect(result.length).toEqual(2)
      expect_match_user(result[0], dataset[2])
      expect_match_user(result[1], dataset[5])
    })

    it('can get data by query builder, case 3', async function() {
      const handler = makeQueryBuilderHandler('users')
      makeQueryBuilder(handler)
        .where('age', 40)
        .where('last_name', 'stark')
      const result = await handler.getQueryExecutor().get()

      expect_query_log(
        {
          raw: 'db.users.find({"age":40,"last_name":"stark"}).toArray()',
          query: { age: 40, last_name: 'stark' },
          action: 'get'
        },
        result
      )
      expect(result.length).toEqual(1)
      expect_match_user(result[0], dataset[2])
    })

    it('can get data by query builder, case 4', async function() {
      const handler = makeQueryBuilderHandler('users')
      makeQueryBuilder(handler)
        .where('age', 40)
        .orWhere('first_name', 'peter')
      const result = await handler.getQueryExecutor().get()

      expect_query_log(
        {
          raw: 'db.users.find({"$or":[{"age":40},{"first_name":"peter"}]}).toArray()',
          query: {
            $or: [{ age: 40 }, { first_name: 'peter' }]
          },
          action: 'get'
        },
        result
      )
      expect(result.length).toEqual(3)
      expect_match_user(result[0], dataset[2])
      expect_match_user(result[1], dataset[5])
      expect_match_user(result[2], dataset[6])
    })

    it('can get data by query builder, case 5', async function() {
      const handler = makeQueryBuilderHandler('users')
      makeQueryBuilder(handler)
        .where('age', 40)
        .orWhere('first_name', 'peter')
        .orderBy('id', 'desc')
      const result = await handler.getQueryExecutor().get()

      expect_query_log(
        {
          raw: 'db.users.find({"$or":[{"age":40},{"first_name":"peter"}]}, {"sort":[["_id",-1]]}).toArray()',
          options: { sort: [['_id', -1]] },
          action: 'get'
        },
        result
      )
      expect(result.length).toEqual(3)
      expect_match_user(result[0], dataset[6])
      expect_match_user(result[1], dataset[5])
      expect_match_user(result[2], dataset[2])
    })

    it('returns an empty array if executeMode is disabled', async function() {
      const handler = makeQueryBuilderHandler('users')
      makeQueryBuilder(handler)
        .where('age', 40)
        .orWhere('first_name', 'peter')
        .orderBy('id', 'desc')

      const result = await handler
        .getQueryExecutor()
        .setExecuteMode('disabled')
        .get()

      expect_query_log(
        {
          raw: 'db.users.find({"$or":[{"age":40},{"first_name":"peter"}]}, {"sort":[["_id",-1]]}).toArray()',
          options: { sort: [['_id', -1]] },
          action: 'get'
        },
        result
      )
      expect(result).toEqual([])
    })
  })

  describe('.first()', function() {
    it('finds first document of collection and return an instance of Eloquent<T>', async function() {
      const handler = makeQueryBuilderHandler('users')
      const result = await handler.getQueryExecutor().first()

      expect_query_log(
        {
          raw: 'db.users.findOne({})',
          action: 'first'
        },
        result
      )
      expect_match_user(result, dataset[0])
    })

    it('finds first document of collection and return an instance of Eloquent<T>', async function() {
      const handler = makeQueryBuilderHandler('users')
      makeQueryBuilder(handler).orderBy('_id', 'desc')
      const result = await handler.getQueryExecutor().first()

      expect_query_log(
        {
          raw: 'db.users.findOne({}, {"sort":[["_id",-1]]})',
          options: { sort: [['_id', -1]] },
          action: 'first'
        },
        result
      )
      expect_match_user(result, dataset[6])
    })

    it('returns null if no result', async function() {
      const handler = makeQueryBuilderHandler('users')
      makeQueryBuilder(handler).where('first_name', 'no-one')
      const result = await handler.getQueryExecutor().first()

      expect_query_log(
        {
          raw: 'db.users.findOne({"first_name":"no-one"})',
          query: { first_name: 'no-one' },
          action: 'first'
        },
        result
      )
      expect(result).toBeNull()
    })

    it('can find data by query builder, case 1', async function() {
      const handler = makeQueryBuilderHandler('users')
      makeQueryBuilder(handler).where('age', 1000)
      const result = await handler.getQueryExecutor().first()

      expect_query_log(
        {
          raw: 'db.users.findOne({"age":1000})',
          query: { age: 1000 },
          action: 'first'
        },
        result
      )
      expect_match_user(result, dataset[3])
    })

    it('can find data by query builder, case 2', async function() {
      const handler = makeQueryBuilderHandler('users')
      makeQueryBuilder(handler)
        .where('age', 40)
        .orWhere('first_name', 'jane')
      const result = await handler.getQueryExecutor().first()

      expect_query_log(
        {
          raw: 'db.users.findOne({"$or":[{"age":40},{"first_name":"jane"}]})',
          query: { $or: [{ age: 40 }, { first_name: 'jane' }] },
          action: 'first'
        },
        result
      )
      expect_match_user(result, dataset[1])
    })

    it('can find data by query builder, case 3', async function() {
      const handler = makeQueryBuilderHandler('users')
      makeQueryBuilder(handler)
        .where('first_name', 'tony')
        .where('last_name', 'stewart')
      const result = await handler.getQueryExecutor().first()

      expect_query_log(
        {
          raw: 'db.users.findOne({"first_name":"tony","last_name":"stewart"})',
          query: { first_name: 'tony', last_name: 'stewart' },
          action: 'first'
        },
        result
      )
      expect_match_user(result, dataset[5])
    })

    it('can find data by .native() before using query functions of query builder', async function() {
      const handler = makeQueryBuilderHandler('users')
      const result = await makeQueryBuilder(handler)
        .native(function(collection) {
          return collection.findOne({
            first_name: 'tony'
          })
        })
        .execute()

      expect_match_user(result, dataset[2])
    })

    it('can find data by native() after using query functions of query builder', async function() {
      const handler = makeQueryBuilderHandler('users')
      const result = await makeQueryBuilder(handler)
        .where('age', 40)
        .orWhere('age', 1000)
        .native(function(collection, conditions) {
          return collection.findOne(conditions, { sort: [['last_name', -1]] })
        })
        .execute()
      expect_match_user(result, dataset[5])
    })

    it('can find data by native() and modified after using query functions of query builder', async function() {
      const handler = makeQueryBuilderHandler('users')
      const result = await await makeQueryBuilder(handler)
        .where('age', 40)
        .orWhere('age', 1000)
        .native(function(collection) {
          return collection.findOne({
            first_name: 'thor'
          })
        })
        .execute()
      expect_match_user(result, dataset[3])
    })

    it('returns an undefined if executeMode is disabled', async function() {
      const handler = makeQueryBuilderHandler('users')
      makeQueryBuilder(handler)
        .where('age', 40)
        .orWhere('first_name', 'jane')
      const result = await handler
        .getQueryExecutor()
        .setExecuteMode('disabled')
        .first()

      expect_query_log(
        {
          raw: 'db.users.findOne({"$or":[{"age":40},{"first_name":"jane"}]})',
          query: { $or: [{ age: 40 }, { first_name: 'jane' }] },
          action: 'first'
        },
        result
      )
      expect(result).toBeUndefined()
    })
  })

  describe('.count()', function() {
    it('counts all data of collection and returns a Number', async function() {
      const handler = makeQueryBuilderHandler('users')
      const result = await handler.getQueryExecutor().count()

      expect_query_log(
        {
          raw: 'db.users.countDocuments({})',
          action: 'count'
        },
        result
      )
      expect(result).toEqual(7)
    })

    it('returns 0 if no result', async function() {
      const handler = makeQueryBuilderHandler('users')
      makeQueryBuilder(handler).where('first_name', 'no-one')
      const result = await handler.getQueryExecutor().count()

      expect_query_log(
        {
          raw: 'db.users.countDocuments({"first_name":"no-one"})',
          query: { first_name: 'no-one' },
          action: 'count'
        },
        result
      )
      expect(result).toEqual(0)
    })

    it('overrides select even .select was used', async function() {
      const handler = makeQueryBuilderHandler('users')
      makeQueryBuilder(handler).select('abc', 'def')
      const result = await handler.getQueryExecutor().count()

      expect_query_log(
        {
          raw: 'db.users.countDocuments({})',
          options: undefined,
          action: 'count'
        },
        result
      )
      expect(result).toEqual(7)
    })

    it('overrides ordering even .orderBy was used', async function() {
      const handler = makeQueryBuilderHandler('users')
      makeQueryBuilder(handler).orderBy('abc')
      const result = await handler.getQueryExecutor().count()

      expect_query_log(
        {
          raw: 'db.users.countDocuments({})',
          options: undefined,
          action: 'count'
        },
        result
      )
      expect(result).toEqual(7)
    })

    it('can count items by query builder, case 1', async function() {
      const handler = makeQueryBuilderHandler('users')
      makeQueryBuilder(handler)
        .where('age', 18)
        .orWhere('first_name', 'tony')
      const result = await handler.getQueryExecutor().count()

      expect_query_log(
        {
          raw: 'db.users.countDocuments({"$or":[{"age":18},{"first_name":"tony"}]})',
          query: { $or: [{ age: 18 }, { first_name: 'tony' }] },
          action: 'count'
        },
        result
      )
      expect(result).toEqual(2)
    })

    it('can count items by query builder, case 2', async function() {
      const handler = makeQueryBuilderHandler('users')
      makeQueryBuilder(handler)
        .where('age', 1000)
        .orWhere('first_name', 'captain')
        .orderBy('last_name')
        .limit(10)
      const result = await handler.getQueryExecutor().count()

      expect_query_log(
        {
          raw: 'db.users.countDocuments({"$or":[{"age":1000},{"first_name":"captain"}]}, {"limit":10})',
          query: { $or: [{ age: 1000 }, { first_name: 'captain' }] },
          options: { limit: 10 },
          action: 'count'
        },
        result
      )
      expect(result).toEqual(2)
    })

    it('returns 0 if executeMode is disabled', async function() {
      const handler = makeQueryBuilderHandler('users')
      makeQueryBuilder(handler)
        .where('age', 1000)
        .orWhere('first_name', 'captain')
        .orderBy('last_name')
        .limit(10)
      const result = await handler
        .getQueryExecutor()
        .setExecuteMode('disabled')
        .count()

      expect_query_log(
        {
          raw: 'db.users.countDocuments({"$or":[{"age":1000},{"first_name":"captain"}]}, {"limit":10})',
          query: { $or: [{ age: 1000 }, { first_name: 'captain' }] },
          options: { limit: 10 },
          action: 'count'
        },
        result
      )
      expect(result).toEqual(0)
    })
  })

  describe('.update()', function() {
    it('can update data of collection, returns update result of mongodb', async function() {
      let handler = makeQueryBuilderHandler('users')
      makeQueryBuilder(handler).where('first_name', 'peter')
      const result = await handler.getQueryExecutor().update({ $set: { age: 19 } })

      expect_query_log(
        {
          raw: 'db.users.updateMany({"first_name":"peter"}, {"$set":{"age":19}})',
          query: { first_name: 'peter' },
          action: 'update'
        },
        result
      )
      expect(result).toEqual({ n: 1, nModified: 1, ok: 1 })

      handler = makeQueryBuilderHandler('users')
      makeQueryBuilder(handler).where('first_name', 'peter')
      const updatedResult = await handler.getQueryExecutor().first()

      expect_match_user(updatedResult, Object.assign({}, dataset[6], { age: 19 }))
    })

    it('returns empty update result if no row matched', async function() {
      const handler = makeQueryBuilderHandler('users')
      makeQueryBuilder(handler).where('first_name', 'no-one')
      const result = await handler.getQueryExecutor().update({ $set: { age: 19 } })

      expect_query_log(
        {
          raw: 'db.users.updateMany({"first_name":"no-one"}, {"$set":{"age":19}})',
          query: { first_name: 'no-one' },
          action: 'update'
        },
        result
      )
      expect(result).toEqual({ n: 0, nModified: 0, ok: 1 })
    })

    it('can update data by query builder, case 1', async function() {
      let handler = makeQueryBuilderHandler('users')
      makeQueryBuilder(handler).where('age', 1000)
      const result = await handler.getQueryExecutor().update({ $set: { age: 1001 } })

      expect_query_log(
        {
          raw: 'db.users.updateMany({"age":1000}, {"$set":{"age":1001}})',
          query: { age: 1000 },
          action: 'update'
        },
        result
      )
      expect(result).toEqual({ n: 1, nModified: 1, ok: 1 })

      handler = makeQueryBuilderHandler('users')
      makeQueryBuilder(handler).where('first_name', 'thor')
      const updatedResult = await handler.getQueryExecutor().first()

      expect_match_user(updatedResult, Object.assign({}, dataset[3], { age: 1001 }))
    })

    it('can update data by query builder, case 2: multiple documents', async function() {
      let handler = makeQueryBuilderHandler('users')
      makeQueryBuilder(handler)
        .where('first_name', 'tony')
        .orWhere('first_name', 'jane')
      const result = await handler.getQueryExecutor().update({ $inc: { age: 1 } })

      expect_query_log(
        {
          raw: 'db.users.updateMany({"$or":[{"first_name":"tony"},{"first_name":"jane"}]}, {"$inc":{"age":1}})',
          query: { $or: [{ first_name: 'tony' }, { first_name: 'jane' }] },
          action: 'update'
        },
        result
      )
      expect(result).toEqual({ n: 3, nModified: 3, ok: 1 })

      handler = makeQueryBuilderHandler('users')
      makeQueryBuilder(handler)
        .where('first_name', 'tony')
        .orWhere('first_name', 'jane')
      const updatedResults = await handler.getQueryExecutor().get()

      expect_match_user(updatedResults[0], Object.assign({}, dataset[1], { age: 26 }))
      expect_match_user(updatedResults[1], Object.assign({}, dataset[2], { age: 41 }))
      expect_match_user(updatedResults[2], Object.assign({}, dataset[5], { age: 41 }))
    })

    it('can update data by query builder, case 3', async function() {
      let handler = makeQueryBuilderHandler('users')
      makeQueryBuilder(handler)
        .where('first_name', 'tony')
        .where('last_name', 'stewart')
      const result = await handler.getQueryExecutor().update({ $inc: { age: 1 } })

      expect_query_log(
        {
          raw: 'db.users.updateMany({"first_name":"tony","last_name":"stewart"}, {"$inc":{"age":1}})',
          query: { first_name: 'tony', last_name: 'stewart' },
          action: 'update'
        },
        result
      )
      expect(result).toEqual({ n: 1, nModified: 1, ok: 1 })

      handler = makeQueryBuilderHandler('users')
      makeQueryBuilder(handler)
        .where('first_name', 'tony')
        .where('last_name', 'stewart')
      const updatedResult = await handler.getQueryExecutor().first()

      expect_match_user(updatedResult, Object.assign({}, dataset[5], { age: 42 }))
    })

    it('auto add updatedAt field to $set if timestamps options is on', async function() {
      const now = new Date(1988, 4, 16)
      MomentProvider.setNow(() => now)

      function makeHandler() {
        return new MongodbQueryBuilderHandler(<any>{
          getDriver() {
            return {
              getSoftDeletesFeature() {
                return {
                  hasSoftDeletes() {
                    return false
                  }
                }
              },
              getTimestampsFeature() {
                return {
                  hasTimestamps() {
                    return true
                  },
                  getTimestampsSetting() {
                    return { createdAt: 'created_at', updatedAt: 'updated_at' }
                  }
                }
              }
            }
          },

          getRecordName() {
            return 'users'
          }
        })
      }
      let handler = makeHandler()
      makeQueryBuilder(handler)
        .where('first_name', 'tony')
        .where('last_name', 'stewart')

      const result = await handler.getQueryExecutor().update({ $inc: { age: 1 } })
      expect(result).toEqual({ n: 1, nModified: 1, ok: 1 })

      handler = makeHandler()
      makeQueryBuilder(handler)
        .where('first_name', 'tony')
        .where('last_name', 'stewart')
      const updatedResult = await handler.getQueryExecutor().first()
      expect_match_user(updatedResult, Object.assign({}, dataset[5], { age: 43, updated_at: now }))

      handler = makeHandler()
      makeQueryBuilder(handler)
        .where('first_name', 'tony')
        .where('last_name', 'stewart')
      const result2 = await handler.getQueryExecutor().update({ $set: { age: 44 } })
      expect(result2).toEqual({ n: 1, nModified: 1, ok: 1 })

      handler = makeHandler()
      makeQueryBuilder(handler)
        .where('first_name', 'tony')
        .where('last_name', 'stewart')
      const updatedResult2 = await handler.getQueryExecutor().first()
      expect_match_user(updatedResult2, Object.assign({}, dataset[5], { age: 44, updated_at: now }))
    })

    it('returns an empty object if executeMode is disabled', async function() {
      let handler = makeQueryBuilderHandler('users')
      makeQueryBuilder(handler)
        .where('first_name', 'tony')
        .where('last_name', 'stewart')
      const result = await handler
        .getQueryExecutor()
        .setExecuteMode('disabled')
        .update({ $inc: { age: 1 } })

      expect_query_log(
        {
          raw: 'db.users.updateMany({"first_name":"tony","last_name":"stewart"}, {"$inc":{"age":1}})',
          query: { first_name: 'tony', last_name: 'stewart' },
          action: 'update'
        },
        result
      )
      expect(result).toEqual({})

      handler = makeQueryBuilderHandler('users')
      makeQueryBuilder(handler)
        .where('first_name', 'tony')
        .where('last_name', 'stewart')
      const updatedResult = await handler.getQueryExecutor().first()

      expect_match_user(updatedResult, Object.assign({}, dataset[5], { age: 44 }))
    })
  })

  describe('.delete()', function() {
    it('can delete data of collection, returns delete result of mongodb', async function() {
      const handler = makeQueryBuilderHandler('users')
      makeQueryBuilder(handler).where('first_name', 'peter')
      const result = await handler.getQueryExecutor().delete()

      expect_query_log(
        {
          raw: 'db.users.deleteMany({"first_name":"peter"})',
          query: { first_name: 'peter' },
          action: 'delete'
        },
        result
      )
      expect(result).toEqual({ n: 1, ok: 1 })
      const count = await makeQueryBuilderHandler('users')
        .getQueryExecutor()
        .count()
      expect(count).toEqual(6)
    })

    it('returns an empty object if executeMode is disabled', async function() {
      const handler = makeQueryBuilderHandler('users')
      makeQueryBuilder(handler)
        .where('first_name', 'john')
        .where('last_name', 'doe')
      const result = await handler
        .getQueryExecutor()
        .setExecuteMode('disabled')
        .delete()

      expect_query_log({ raw: 'db.users.deleteMany({"first_name":"john","last_name":"doe"})' }, result)
      expect(result).toEqual({})

      const count = await makeQueryBuilderHandler('users')
        .getQueryExecutor()
        .count()
      expect(count).toEqual(6)
    })

    it('can delete data by query builder, case 1', async function() {
      const handler = makeQueryBuilderHandler('users')
      makeQueryBuilder(handler).where('age', 1001)
      const result = await handler.getQueryExecutor().delete()

      expect_query_log(
        {
          raw: 'db.users.deleteMany({"age":1001})',
          query: { age: 1001 },
          action: 'delete'
        },
        result
      )
      expect(result).toEqual({ n: 1, ok: 1 })
      const count = await makeQueryBuilderHandler('users')
        .getQueryExecutor()
        .count()
      expect(count).toEqual(5)
    })

    it('can delete data by query builder, case 2: multiple documents', async function() {
      const handler = makeQueryBuilderHandler('users')
      makeQueryBuilder(handler)
        .where('first_name', 'tony')
        .orWhere('first_name', 'jane')
      const result = await handler.getQueryExecutor().delete()

      expect_query_log(
        {
          raw: 'db.users.deleteMany({"$or":[{"first_name":"tony"},{"first_name":"jane"}]})',
          query: { $or: [{ first_name: 'tony' }, { first_name: 'jane' }] },
          action: 'delete'
        },
        result
      )
      expect(result).toEqual({ n: 3, ok: 1 })

      const count = await makeQueryBuilderHandler('users')
        .getQueryExecutor()
        .count()
      expect(count).toEqual(2)
    })

    it('can delete data by query builder, case 3', async function() {
      const handler = makeQueryBuilderHandler('users')
      makeQueryBuilder(handler)
        .where('first_name', 'john')
        .where('last_name', 'doe')
      const result = await handler.getQueryExecutor().delete()

      expect_query_log({ raw: 'db.users.deleteMany({"first_name":"john","last_name":"doe"})' }, result)
      expect(result).toEqual({ n: 1, ok: 1 })

      const count = await makeQueryBuilderHandler('users')
        .getQueryExecutor()
        .count()
      expect(count).toEqual(1)
    })

    it('can not call delete without using any .where() statement', async function() {
      const handler = makeQueryBuilderHandler('users')
      const result = await handler.getQueryExecutor().delete()
      expect(result).toEqual({ n: 0, ok: 1 })
    })

    it('can not call delete if query is empty', async function() {
      const handler = makeQueryBuilderHandler('users')
      makeQueryBuilder(handler).select('any')

      const result = await handler.getQueryExecutor().delete()
      expect(result).toEqual({ n: 0, ok: 1 })
    })

    it('can delete by native() function', async function() {
      const handler = makeQueryBuilderHandler('users')
      const result = await makeQueryBuilder(handler)
        .native(function(collection) {
          return collection.remove({})
        })
        .execute()

      expect(result).toEqual({ n: 1, ok: 1 })

      const count = await makeQueryBuilderHandler('users')
        .getQueryExecutor()
        .count()
      expect(count).toEqual(0)
    })
  })

  describe('.restore()', function() {
    it('does nothing if Model do not support SoftDeletes', async function() {
      const handler = makeQueryBuilderHandler('users')
      makeQueryBuilder(handler).where('first_name', 'peter')
      const result = await handler.getQueryExecutor().restore()

      expect(QueryLog.pull()).toHaveLength(0)
      expect(result).toEqual({ n: 0, nModified: 0, ok: 1 })
    })

    function makeHandler() {
      return new MongodbQueryBuilderHandler(<any>{
        getDriver() {
          return {
            getSoftDeletesFeature() {
              return {
                hasSoftDeletes() {
                  return true
                },
                getSoftDeletesSetting() {
                  return { deletedAt: 'deleted_at' }
                }
              }
            },
            getTimestampsFeature() {
              return {
                hasTimestamps() {
                  return false
                }
              }
            }
          }
        },

        getRecordName() {
          return 'roles'
        }
      })
    }

    it('can not call restore if query is empty', async function() {
      const handler = makeHandler()
      makeQueryBuilder(handler).withTrashed()

      const result = await handler.getQueryExecutor().restore()
      expect(QueryLog.pull()).toHaveLength(0)
      expect(result).toEqual({ n: 0, nModified: 0, ok: 1 })
    })

    it('can restore data by query builder, case 1', async function() {
      let handler = makeHandler()
      makeQueryBuilder(handler)
        .onlyTrashed()
        .where('name', 'role-0')

      const result = await handler.getQueryExecutor().restore()
      expect_query_log(
        {
          raw: 'db.roles.updateMany({"deleted_at":{"$ne":null},"name":"role-0"}, {"$set":{"deleted_at":null}})',
          // tslint:disable-next-line
          query: { deleted_at: { $ne: null }, name: 'role-0' },
          action: 'restore'
        },
        result
      )
      expect(result).toEqual({ n: 1, nModified: 1, ok: 1 })

      handler = makeHandler()
      const count = await handler.getQueryExecutor().count()
      expect(count).toEqual(1)
    })

    it('can restore data by query builder, case 2: multiple documents', async function() {
      let handler = makeHandler()
      makeQueryBuilder(handler)
        .withTrashed()
        .where('name', 'role-1')
        .orWhere('name', 'role-2')
        .orWhere('name', 'role-3')

      const result = await handler.getQueryExecutor().restore()

      expect_query_log(
        {
          raw:
            'db.roles.updateMany({"$or":[{"name":"role-1"},{"name":"role-2"},{"name":"role-3"}]}, {"$set":{"deleted_at":null}})',
          query: { $or: [{ name: 'role-1' }, { name: 'role-2' }, { name: 'role-3' }] },
          action: 'restore'
        },
        result
      )
      expect(result).toEqual({ n: 3, nModified: 3, ok: 1 })

      handler = makeHandler()
      const count = await handler.getQueryExecutor().count()
      expect(count).toEqual(4)
    })

    it('returns an empty object if executeMode is disabled', async function() {
      let handler = makeHandler()
      makeQueryBuilder(handler)
        .withTrashed()
        .where('name', 'role-1')
        .orWhere('name', 'role-2')
        .orWhere('name', 'role-3')

      const result = await handler
        .getQueryExecutor()
        .setExecuteMode('disabled')
        .restore()

      expect_query_log(
        {
          raw:
            'db.roles.updateMany({"$or":[{"name":"role-1"},{"name":"role-2"},{"name":"role-3"}]}, {"$set":{"deleted_at":null}})',
          query: { $or: [{ name: 'role-1' }, { name: 'role-2' }, { name: 'role-3' }] },
          action: 'restore'
        },
        result
      )
      expect(result).toEqual({})

      handler = makeHandler()
      const count = await handler.getQueryExecutor().count()
      expect(count).toEqual(4)
    })
  })

  describe('.native()', function() {
    it('passes instance of collection, conditions, and options to handler', async function() {
      const handler = makeQueryBuilderHandler('users')
      makeQueryBuilder(handler)
        .where('a', 1)
        .limit(10)

      const executor = handler.getQueryExecutor() as MongodbQueryExecutor

      const result = executor.native(async function(passed, conditions, options) {
        expect(conditions).toEqual({ a: 1 })
        expect(options).toEqual({ limit: 10 })
        expect(passed === executor['collection']).toBe(true)
        return { result: 'anything' }
      })
      expect(result === executor).toBe(true)
    })
  })

  describe('.execute()', function() {
    it('calls .get() if there is no result from .native()', async function() {
      const handler = makeQueryBuilderHandler('users')
      const executor = handler.getQueryExecutor()
      const getStub = Sinon.stub(executor, 'get')
      getStub.returns(Promise.resolve('anything'))

      makeQueryBuilder(handler).where('test', 'true')
      expect(await executor.execute()).toEqual('anything')
      expect(getStub.calledWith()).toBe(true)
    })

    it('resolve promise "nativeHandlePromise" and return response or response.result', async function() {
      const handler = makeQueryBuilderHandler('users')
      const executor = handler.getQueryExecutor()

      executor['nativeHandlePromise'] = Promise.resolve('anything')
      expect(await executor.execute()).toEqual('anything')
      expect(executor['nativeHandlePromise']).toBeUndefined()

      executor['nativeHandlePromise'] = Promise.resolve({ result: 'anything' })
      expect(await executor.execute()).toEqual('anything')
      expect(executor['nativeHandlePromise']).toBeUndefined()
    })

    it('does not resolve promise, just returns an empty object if executeMode is disabled', async function() {
      const handler = makeQueryBuilderHandler('users')
      const executor = handler.getQueryExecutor()

      executor['nativeHandlePromise'] = Promise.resolve({ result: 'anything' })
      expect(await executor.setExecuteMode('disabled').execute()).toEqual({})
    })
  })

  describe('.getCollection()', function() {
    it('simply returns an collection property', function() {
      const handler = makeQueryBuilderHandler('users')
      const executor = handler.getQueryExecutor() as MongodbQueryExecutor
      const collection = {}
      executor['collection'] = collection as any
      expect(executor.getCollection() === collection).toBe(true)
    })
  })

  describe('.makeQueryOptions()', function() {
    it('undefined if there is no option', function() {
      const handler = makeQueryBuilderHandler('users')
      expect((handler.getQueryExecutor() as MongodbQueryExecutor).makeQueryOptions()).toBe(undefined)
    })

    it('adds this.limit to property "limit"', function() {
      const handler = makeQueryBuilderHandler('users')
      makeQueryBuilder(handler).limit(10)
      expect((handler.getQueryExecutor() as MongodbQueryExecutor).makeQueryOptions()).toEqual({ limit: 10 })
    })

    it('builds this.ordering and adds to property "sort"', function() {
      const handler = makeQueryBuilderHandler('users')
      makeQueryBuilder(handler)
        .orderByAsc('a')
        .orderByDesc('b')
        .orderBy('c', 'asc')
        .orderBy('c', 'desc')
      expect((handler.getQueryExecutor() as MongodbQueryExecutor).makeQueryOptions()).toEqual({
        sort: [['a', 1], ['b', -1], ['c', -1]]
      })
    })

    it('builds this.fields.select and adds to property "projection"', function() {
      const handler = makeQueryBuilderHandler('users')
      makeQueryBuilder(handler).select('a', 'b', 'c')
      expect((handler.getQueryExecutor() as MongodbQueryExecutor).makeQueryOptions()).toEqual({
        projection: { a: 1, b: 1, c: 1 }
      })
    })
  })
})
