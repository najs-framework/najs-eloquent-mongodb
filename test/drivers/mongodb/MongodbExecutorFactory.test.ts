import 'jest'
import { make } from 'najs-binding'
import { MongodbQueryLog } from '../../../lib/drivers/mongodb/MongodbQueryLog'
import { MongodbExecutorFactory } from '../../../lib/drivers/mongodb/MongodbExecutorFactory'
import { MongodbProviderFacade } from '../../../lib/facades/global/MongodbProviderFacade'
import { MongodbRecordExecutor } from '../../../lib/drivers/mongodb/MongodbRecordExecutor'
import { MongodbQueryExecutor } from '../../../lib/drivers/mongodb/MongodbQueryExecutor'

describe('MongodbExecutorFactory', function() {
  it('implements IAutoload and register with singleton option = true', function() {
    const a = make<MongodbExecutorFactory>(MongodbExecutorFactory.className)
    const b = make<MongodbExecutorFactory>(MongodbExecutorFactory.className)
    expect(a.getClassName()).toEqual('NajsEloquent.Driver.Mongodb.MongodbExecutorFactory')
    expect(a === b).toBe(true)
  })

  describe('.makeRecordExecutor()', function() {
    it('creates new instance of MongodbRecordExecutor with model, record, collection and logger', function() {
      const model: any = {
        getRecordName() {
          return 'any'
        }
      }
      const record: any = {}
      const mongodbDatabase = {
        collection(name: any) {
          return 'collection-' + name
        }
      }
      const stub = MongodbProviderFacade.getFacade().createStub('getDatabase')
      stub.returns(mongodbDatabase)

      const factory = make<MongodbExecutorFactory>(MongodbExecutorFactory.className)
      const recordExecutor = factory.makeRecordExecutor(model, record)

      expect(recordExecutor).toBeInstanceOf(MongodbRecordExecutor)
      expect(recordExecutor['model'] === model).toBe(true)
      expect(recordExecutor['record'] === record).toBe(true)
      expect(recordExecutor['collection']).toEqual('collection-any')
      stub.restore()
    })
  })

  describe('.makeQueryExecutor()', function() {
    it('creates new instance of MongodbQueryExecutor with model, record, collection and logger', function() {
      const basicQuery: any = {}
      const model: any = {
        getRecordName() {
          return 'any'
        }
      }
      const handler: any = {
        getQueryName() {
          return 'test'
        },
        getBasicQuery() {
          return basicQuery
        },
        getModel() {
          return model
        }
      }
      const mongodbDatabase = {
        collection(name: any) {
          return { collectionName: name }
        }
      }
      const stub = MongodbProviderFacade.getFacade().createStub('getDatabase')
      stub.returns(mongodbDatabase)

      const factory = make<MongodbExecutorFactory>(MongodbExecutorFactory.className)
      const queryExecutor = factory.makeQueryExecutor(handler)

      expect(queryExecutor).toBeInstanceOf(MongodbQueryExecutor)
      expect(queryExecutor['queryHandler'] === handler).toBe(true)

      stub.restore()
    })
  })

  describe('.getCollection()', function() {
    it('returns collection by calling MongodbProviderFacade.getDatabase().collection()', function() {
      const model: any = {
        getRecordName() {
          return 'any'
        }
      }
      const mongodbDatabase = {
        collection(name: any) {
          return 'collection-' + name
        }
      }
      const stub = MongodbProviderFacade.getFacade().createStub('getDatabase')
      stub.returns(mongodbDatabase)
      const factory = make<MongodbExecutorFactory>(MongodbExecutorFactory.className)
      expect(factory.getCollection(model)).toEqual('collection-any')
      stub.restore()
    })
  })

  describe('.makeLogger()', function() {
    it('simply create new MongodbQueryLog', function() {
      const factory = make<MongodbExecutorFactory>(MongodbExecutorFactory.className)
      expect(factory.makeLogger()).toBeInstanceOf(MongodbQueryLog)
    })
  })
})
