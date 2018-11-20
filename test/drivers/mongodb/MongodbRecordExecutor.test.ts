import 'jest'
import * as Sinon from 'sinon'
import { QueryLog, MomentProvider, NajsEloquent as NajsEloquentLib } from 'najs-eloquent'
import { init_mongodb, delete_collection_use_mongodb } from '../../util'
import { MongodbProviderFacade } from '../../../lib/facades/global/MongodbProviderFacade'
import { MongodbRecordExecutor } from '../../../lib/drivers/mongodb/MongodbRecordExecutor'
import { MongodbQueryLog } from '../../../lib/drivers/mongodb/MongodbQueryLog'
import { ObjectId } from 'bson'

describe('MongodbRecordExecutor', function() {
  beforeAll(async function() {
    await init_mongodb('mongodb_record_executor')
  })

  afterAll(async function() {
    delete_collection_use_mongodb('test')
  })

  beforeEach(function() {
    QueryLog.clear().enable()
  })

  function makeExecutor(model: any, record: NajsEloquentLib.Driver.Record) {
    return new MongodbRecordExecutor(
      model,
      record,
      MongodbProviderFacade.getDatabase().collection('test'),
      new MongodbQueryLog()
    )
  }

  function makeModel(name: string, timestamps: boolean | object, softDeletes: boolean | object) {
    let timestampsFeature = {}
    if (timestamps === false) {
      timestampsFeature = {
        hasTimestamps() {
          return false
        }
      }
    } else {
      timestampsFeature = {
        hasTimestamps() {
          return true
        },
        getTimestampsSetting() {
          return timestamps
        }
      }
    }

    let softDeleteFeature = {}
    if (softDeletes === false) {
      softDeleteFeature = {
        hasSoftDeletes() {
          return false
        }
      }
    } else {
      softDeleteFeature = {
        hasSoftDeletes() {
          return true
        },
        getSoftDeletesSetting() {
          return softDeletes
        }
      }
    }

    const model = {
      getDriver() {
        return {
          getSoftDeletesFeature() {
            return softDeleteFeature
          },
          getTimestampsFeature() {
            return timestampsFeature
          }
        }
      },

      getModelName() {
        return name
      }
    }
    return model
  }

  function expect_query_log(data: object, result: any = undefined, index: number = 0) {
    const logData = QueryLog.pull()[index]['data']
    if (typeof result !== undefined) {
      expect(logData['result'] === result).toBe(true)
    }
    expect(logData).toMatchObject(data)
  }

  it('extends NajsEloquentLib.Driver.RecordExecutorBase / NajsEloquentLib.Driver.ExecutorBase', function() {
    const model = makeModel('Test', false, false)
    const record = new NajsEloquentLib.Driver.Record()
    const executor = makeExecutor(model, record)
    expect(executor).toBeInstanceOf(NajsEloquentLib.Driver.ExecutorBase)
    expect(executor).toBeInstanceOf(NajsEloquentLib.Driver.RecordExecutorBase)
  })

  describe('.fillData()', function() {
    it('simply calls .fillTimestampsData() and .fillSoftDeletesData()', function() {
      const model = makeModel('Test', false, false)
      const record = new NajsEloquentLib.Driver.Record()
      const executor = makeExecutor(model, record)
      const fillTimestampsDataSpy = Sinon.spy(executor, 'fillTimestampsData')
      const fillSoftDeletesDataSpy = Sinon.spy(executor, 'fillSoftDeletesData')
      executor.fillData(true)
      expect(fillTimestampsDataSpy.calledWith(true)).toBe(true)
      expect(fillSoftDeletesDataSpy.called).toBe(true)
    })
  })

  describe('.fillTimestampsData()', function() {
    it('does nothing if there is no timestamps or softDeletes settings', function() {
      const model = makeModel('Test', false, false)
      const record = new NajsEloquentLib.Driver.Record()
      const executor = makeExecutor(model, record)
      executor.fillTimestampsData(true)
      expect(record.toObject()).toEqual({})
    })

    it('fills updatedAt only if isCreate = false if has timestamp settings', function() {
      const now = MomentProvider.make('2018-01-01T00:00:00.000Z')
      MomentProvider.setNow(() => now)

      const model = makeModel('Test', { createdAt: 'created_at', updatedAt: 'updated_at' }, false)
      const record = new NajsEloquentLib.Driver.Record()
      const executor = makeExecutor(model, record)
      executor.fillTimestampsData(false)
      expect(record.toObject()).toEqual({ updated_at: now.toDate() })
    })

    it('fills updatedAt/createdAt if isCreate = true if has timestamp settings', function() {
      const now = MomentProvider.make('2018-01-01T00:00:00.000Z')
      MomentProvider.setNow(() => now)

      const model = makeModel('Test', { createdAt: 'created_at', updatedAt: 'updated_at' }, false)
      const record = new NajsEloquentLib.Driver.Record()
      const executor = makeExecutor(model, record)
      executor.fillTimestampsData(true)
      expect(record.toObject()).toEqual({ updated_at: now.toDate(), created_at: now.toDate() })
    })

    it('skips createdAt if it already exists', function() {
      const now = MomentProvider.make('2018-01-01T00:00:00.000Z')
      MomentProvider.setNow(() => now)

      const model = makeModel('Test', { createdAt: 'created_at', updatedAt: 'updated_at' }, false)
      const record = new NajsEloquentLib.Driver.Record({ created_at: 'anything' })
      const executor = makeExecutor(model, record)
      executor.fillTimestampsData(true)
      expect(record.toObject()).toEqual({ updated_at: now.toDate(), created_at: 'anything' })
    })
  })

  describe('.fillSoftDeletesData()', function() {
    it('does nothing if there is no timestamps or softDeletes settings', function() {
      const model = makeModel('Test', false, false)
      const record = new NajsEloquentLib.Driver.Record()
      const executor = makeExecutor(model, record)
      executor.fillSoftDeletesData()
      expect(record.toObject()).toEqual({})
    })

    it('fills deletedAt = null there is a softDeletes setting', function() {
      const model = makeModel('Test', false, { deletedAt: 'deleted_at' })
      const record = new NajsEloquentLib.Driver.Record()
      const executor = makeExecutor(model, record)
      executor.fillSoftDeletesData()
      // tslint:disable-next-line
      expect(record.toObject()).toEqual({ deleted_at: null })
    })

    it('skips deletedAt if it already exists', function() {
      const model = makeModel('Test', false, { deletedAt: 'deleted_at' })
      const record = new NajsEloquentLib.Driver.Record({ deleted_at: 'anything' })
      const executor = makeExecutor(model, record)
      executor.fillSoftDeletesData()
      expect(record.toObject()).toEqual({ deleted_at: 'anything' })
    })
  })

  describe('.getFilter()', function() {
    it('returns an empty object if there is no primaryKey in model', function() {
      const model: any = {
        getPrimaryKey() {
          return undefined
        }
      }

      const executor = makeExecutor(model, new NajsEloquentLib.Driver.Record())
      expect(executor.getFilter()).toEqual({})
    })

    it('returns an filter object with formated field name and value', function() {
      const model: any = {
        getPrimaryKeyName() {
          return 'id'
        },

        getPrimaryKey() {
          return 123
        }
      }

      const executor = makeExecutor(model, new NajsEloquentLib.Driver.Record())
      expect(executor.getFilter()).toEqual({ _id: 123 })
    })
  })

  describe('.create()', function() {
    it('calls .fillData(true) by default then save the data by collection.insertOne()', async function() {
      const model = makeModel('Test', false, false)
      const executor = makeExecutor(model, new NajsEloquentLib.Driver.Record())
      const fillDataSpy = Sinon.spy(executor, 'fillData')

      await executor.create()
      expect(fillDataSpy.calledWith(true)).toBe(true)
    })

    it('skips .fillData(true) if the option shouldFillData = false', async function() {
      const model = makeModel('Test', false, false)
      const executor = makeExecutor(model, new NajsEloquentLib.Driver.Record())
      const fillDataSpy = Sinon.spy(executor, 'fillData')

      await executor.create(false)
      expect(fillDataSpy.calledWith(true)).toBe(false)
    })

    it('can create without timestamps or softDeletes settings', async function() {
      const model = makeModel('Test', false, false)
      const result = await makeExecutor(model, new NajsEloquentLib.Driver.Record({ test: 'data' })).create()
      expect_query_log(
        {
          raw: 'db.test.insertOne({"test":"data"})',
          action: 'Test.create()'
        },
        result
      )
    })

    it('can create with timestamps', async function() {
      const model = makeModel('Test', { createdAt: 'created_at', updatedAt: 'updated_at' }, false)
      const now = MomentProvider.make('2018-01-01T00:00:00.000Z')
      MomentProvider.setNow(() => now)

      const result = await makeExecutor(model, new NajsEloquentLib.Driver.Record({ test: 'data' })).create()
      expect_query_log(
        {
          raw: `db.test.insertOne(${JSON.stringify({
            test: 'data',
            updated_at: now.toDate(),
            created_at: now.toDate()
          })})`,
          action: 'Test.create()'
        },
        result
      )
    })

    it('can create with softDeletes', async function() {
      const model = makeModel('Test', false, { deletedAt: 'deleted_at' })
      const now = MomentProvider.make('2018-01-01T00:00:00.000Z')
      MomentProvider.setNow(() => now)

      const result = await makeExecutor(model, new NajsEloquentLib.Driver.Record({ test: 'data' })).create()
      expect_query_log(
        {
          raw: `db.test.insertOne(${JSON.stringify({
            test: 'data',
            // tslint:disable-next-line
            deleted_at: null
          })})`,
          action: 'Test.create()'
        },
        result
      )
    })

    it('returns an empty object if executeMode is disabled', async function() {
      const model = makeModel('Test', false, { deletedAt: 'deleted_at' })
      const now = MomentProvider.make('2018-01-01T00:00:00.000Z')
      MomentProvider.setNow(() => now)

      const result = await makeExecutor(model, new NajsEloquentLib.Driver.Record({ test: 'data' }))
        .setExecuteMode('disabled')
        .create()
      expect_query_log(
        {
          raw: `db.test.insertOne(${JSON.stringify({
            test: 'data',
            // tslint:disable-next-line
            deleted_at: null
          })})`,
          action: 'Test.create()'
        },
        result
      )
      expect(result).toEqual({})
    })
  })

  describe('.update()', function() {
    it('does nothing and returns false if a filter is empty', async function() {
      const model = makeModel('Test', false, false)
      model['getPrimaryKey'] = function() {
        return undefined
      }

      const executor = makeExecutor(model, new NajsEloquentLib.Driver.Record())
      const fillDataSpy = Sinon.spy(executor, 'fillData')

      expect(await executor.update()).toBe(false)
      expect(fillDataSpy.calledWith(true)).toBe(false)
    })

    it('calls .fillData(false) by default then save the data by collection.updateOne()', async function() {
      const model = makeModel('Test', false, false)
      const id = new ObjectId()
      model['getPrimaryKey'] = function() {
        return id
      }
      model['getPrimaryKeyName'] = function() {
        return 'id'
      }
      await makeExecutor(model, new NajsEloquentLib.Driver.Record({ _id: id, name: 'any' })).create()

      const record = new NajsEloquentLib.Driver.Record({ _id: id })
      record.setAttribute('name', 'test')

      const executor = makeExecutor(model, record)
      const fillDataSpy = Sinon.spy(executor, 'fillData')

      await executor.update()
      expect(fillDataSpy.calledWith(false)).toBe(true)
    })

    it('skips calling .fillData(false) if shouldFillData = false', async function() {
      const model = makeModel('Test', false, false)
      const id = new ObjectId()
      model['getPrimaryKey'] = function() {
        return id
      }
      model['getPrimaryKeyName'] = function() {
        return 'id'
      }
      await makeExecutor(model, new NajsEloquentLib.Driver.Record({ _id: id, name: 'any' })).create()

      const record = new NajsEloquentLib.Driver.Record({ _id: id })
      record.setAttribute('name', 'test')

      const executor = makeExecutor(model, record)
      const fillDataSpy = Sinon.spy(executor, 'fillData')

      await executor.update(false)
      expect(fillDataSpy.calledWith(false)).toBe(false)
    })

    it('skips calling collection.updateOne() and return false if there is no modified data', async function() {
      const model = makeModel('Test', false, false)
      const id = new ObjectId()
      model['getPrimaryKey'] = function() {
        return id
      }
      model['getPrimaryKeyName'] = function() {
        return 'id'
      }
      await makeExecutor(model, new NajsEloquentLib.Driver.Record({ _id: id, name: 'any' })).create()

      const record = new NajsEloquentLib.Driver.Record({ _id: id })

      const executor = makeExecutor(model, record)

      expect(await executor.update()).toEqual(false)
    })

    it('can create without timestamps or softDeletes settings', async function() {
      const model = makeModel('Test', false, false)
      const id = new ObjectId()
      model['getPrimaryKey'] = function() {
        return id
      }
      model['getPrimaryKeyName'] = function() {
        return 'id'
      }

      await makeExecutor(model, new NajsEloquentLib.Driver.Record({ _id: id, name: 'any' })).create()

      const record = new NajsEloquentLib.Driver.Record({ _id: id })
      record.setAttribute('name', 'test')
      const result = await makeExecutor(model, record).update()
      expect_query_log(
        {
          raw: `db.test.updateOne(${JSON.stringify({ _id: id.toHexString() })},${JSON.stringify({
            $set: { name: 'test' }
          })})`,
          action: 'Test.update()'
        },
        result,
        1
      )
    })

    it('can update with timestamps', async function() {
      const model = makeModel('Test', { createdAt: 'created_at', updatedAt: 'updated_at' }, false)
      const id = new ObjectId()
      model['getPrimaryKey'] = function() {
        return id
      }
      model['getPrimaryKeyName'] = function() {
        return 'id'
      }

      await makeExecutor(model, new NajsEloquentLib.Driver.Record({ _id: id, name: 'any' })).create()
      const now = MomentProvider.make('2018-01-01T00:00:00.000Z')
      MomentProvider.setNow(() => now)

      const record = new NajsEloquentLib.Driver.Record({ _id: id })
      record.setAttribute('name', 'test')
      const result = await makeExecutor(model, record).update()
      expect_query_log(
        {
          raw: `db.test.updateOne(${JSON.stringify({ _id: id.toHexString() })},${JSON.stringify({
            $set: { name: 'test', updated_at: now.toDate() }
          })})`,
          action: 'Test.update()'
        },
        result,
        1
      )
    })

    it('can update with softDeletes', async function() {
      const model = makeModel('Test', false, { deletedAt: 'deleted_at' })
      const id = new ObjectId()
      model['getPrimaryKey'] = function() {
        return id
      }
      model['getPrimaryKeyName'] = function() {
        return 'id'
      }

      await makeExecutor(model, new NajsEloquentLib.Driver.Record({ _id: id, name: 'any' })).create()

      const record = new NajsEloquentLib.Driver.Record({ _id: id })
      record.setAttribute('name', 'test')
      const result = await makeExecutor(model, record).update()
      expect_query_log(
        {
          raw: `db.test.updateOne(${JSON.stringify({ _id: id.toHexString() })},${JSON.stringify({
            // tslint:disable-next-line
            $set: { name: 'test', deleted_at: null }
          })})`,
          action: 'Test.update()'
        },
        result,
        1
      )
    })

    it('returns an empty object if executeMode is disabled', async function() {
      const model = makeModel('Test', false, { deletedAt: 'deleted_at' })
      const id = new ObjectId()
      model['getPrimaryKey'] = function() {
        return id
      }
      model['getPrimaryKeyName'] = function() {
        return 'id'
      }

      await makeExecutor(model, new NajsEloquentLib.Driver.Record({ _id: id, name: 'any' })).create()

      const record = new NajsEloquentLib.Driver.Record({ _id: id })
      record.setAttribute('name', 'test')
      const result = await makeExecutor(model, record)
        .setExecuteMode('disabled')
        .update()
      expect_query_log(
        {
          raw: `db.test.updateOne(${JSON.stringify({ _id: id.toHexString() })},${JSON.stringify({
            // tslint:disable-next-line
            $set: { name: 'test', deleted_at: null }
          })})`,
          action: 'Test.update()'
        },
        result,
        1
      )
      expect(result).toEqual({})
    })
  })

  describe('.softDelete()', function() {
    it('sets deleted_at field then calls and returns .create() if the model is new', async function() {
      const now = MomentProvider.make('2018-01-01T00:00:00.000Z')
      MomentProvider.setNow(() => now)

      const model = makeModel('Test', false, { deletedAt: 'deleted_at' })
      model['isNew'] = function() {
        return true
      }
      const record = new NajsEloquentLib.Driver.Record()
      const executor = makeExecutor(model, record)
      const fillTimestampsDataSpy = Sinon.spy(executor, 'fillTimestampsData')
      const createStub = Sinon.stub(executor, 'create')
      const updateStub = Sinon.stub(executor, 'update')
      createStub.returns('create-result')
      updateStub.returns('update-result')

      expect(await executor.softDelete()).toEqual('create-result')
      expect(fillTimestampsDataSpy.calledWith(true)).toBe(true)
      expect(createStub.calledWith(false, 'softDelete')).toBe(true)
      expect(updateStub.calledWith(false, 'softDelete')).toBe(false)
      expect(record.getAttribute('deleted_at')).toEqual(now.toDate())
    })

    it('sets deleted_at field then calls and returns .update() if the model is not new', async function() {
      const now = MomentProvider.make('2018-01-01T00:00:00.000Z')
      MomentProvider.setNow(() => now)

      const model = makeModel('Test', false, { deletedAt: 'deleted_at' })
      model['isNew'] = function() {
        return false
      }
      const record = new NajsEloquentLib.Driver.Record()
      const executor = makeExecutor(model, record)
      const fillTimestampsDataSpy = Sinon.spy(executor, 'fillTimestampsData')
      const createStub = Sinon.stub(executor, 'create')
      const updateStub = Sinon.stub(executor, 'update')
      createStub.returns('create-result')
      updateStub.returns('update-result')

      expect(await executor.softDelete()).toEqual('update-result')
      expect(fillTimestampsDataSpy.calledWith(false)).toBe(true)
      expect(createStub.calledWith(false, 'softDelete')).toBe(false)
      expect(updateStub.calledWith(false, 'softDelete')).toBe(true)
      expect(record.getAttribute('deleted_at')).toEqual(now.toDate())
    })

    it('should work with expected log', async function() {
      const now = MomentProvider.make('2018-01-01T00:00:00.000Z')
      MomentProvider.setNow(() => now)

      const model = makeModel('Test', { createdAt: 'created_at', updatedAt: 'updated_at' }, { deletedAt: 'deleted_at' })
      model['isNew'] = function() {
        return true
      }
      const result = await makeExecutor(model, new NajsEloquentLib.Driver.Record()).softDelete()

      expect_query_log(
        {
          raw: `db.test.insertOne(${JSON.stringify({
            updated_at: now.toDate(),
            created_at: now.toDate(),
            deleted_at: now.toDate()
          })})`,
          action: 'Test.softDelete()'
        },
        result
      )
    })
  })

  describe('.hardDelete()', function() {
    it('does nothing if there is no filter', async function() {
      const model: any = makeModel('Test', false, false)
      model['getPrimaryKey'] = function() {
        return undefined
      }
      model['getPrimaryKeyName'] = function() {
        return 'id'
      }

      expect(await makeExecutor(model, new NajsEloquentLib.Driver.Record()).hardDelete()).toBe(false)
    })

    it('calls this.collection.deleteOne() with filter then returns data', async function() {
      const id = new ObjectId()
      const model: any = makeModel('Test', false, false)
      model['getPrimaryKey'] = function() {
        return id
      }
      model['getPrimaryKeyName'] = function() {
        return 'id'
      }

      await makeExecutor(model, new NajsEloquentLib.Driver.Record({ id: id, name: 'test' })).create()

      const result = await makeExecutor(model, new NajsEloquentLib.Driver.Record({ id: id })).hardDelete()
      expect_query_log(
        {
          raw: `db.test.deleteOne(${JSON.stringify({
            _id: id
          })})`,
          action: 'Test.hardDelete()'
        },
        result,
        1
      )
    })

    it('returns an empty object if executeMode is disabled', async function() {
      const id = new ObjectId()
      const model: any = makeModel('Test', false, false)
      model['getPrimaryKey'] = function() {
        return id
      }
      model['getPrimaryKeyName'] = function() {
        return 'id'
      }

      await makeExecutor(model, new NajsEloquentLib.Driver.Record({ id: id, name: 'test' })).create()

      const result = await makeExecutor(model, new NajsEloquentLib.Driver.Record({ id: id }))
        .setExecuteMode('disabled')
        .hardDelete()

      expect_query_log(
        {
          raw: `db.test.deleteOne(${JSON.stringify({
            _id: id
          })})`,
          action: 'Test.hardDelete()'
        },
        result,
        1
      )
      expect(result).toEqual({})
    })
  })

  describe('.restore()', function() {
    it('calls .fillTimestampsData() then calls and returns .update()', async function() {
      const now = MomentProvider.make('2018-01-01T00:00:00.000Z')
      MomentProvider.setNow(() => now)

      const model = makeModel('Test', false, { deletedAt: 'deleted_at' })
      model['isNew'] = function() {
        return true
      }
      const record = new NajsEloquentLib.Driver.Record()
      const executor = makeExecutor(model, record)
      const fillTimestampsDataSpy = Sinon.spy(executor, 'fillTimestampsData')
      const updateStub = Sinon.stub(executor, 'update')
      updateStub.returns('update-result')

      expect(await executor.restore()).toEqual('update-result')
      expect(fillTimestampsDataSpy.calledWith(false)).toBe(true)
      expect(updateStub.calledWith(false, 'restore')).toBe(true)
      expect(record.getAttribute('deleted_at')).toBeNull()
    })

    it('should work with expected log', async function() {
      const now = MomentProvider.make('2018-01-01T00:00:00.000Z')
      MomentProvider.setNow(() => now)

      const id = new ObjectId()
      const model = makeModel('Test', false, { deletedAt: 'deleted_at' })
      model['getPrimaryKey'] = function() {
        return id
      }
      model['getPrimaryKeyName'] = function() {
        return 'id'
      }
      model['isNew'] = function() {
        return false
      }

      await makeExecutor(model, new NajsEloquentLib.Driver.Record({ id: id })).create()
      await makeExecutor(model, new NajsEloquentLib.Driver.Record({ id: id })).softDelete()

      const result = await makeExecutor(model, new NajsEloquentLib.Driver.Record({ id: id })).restore()

      expect_query_log(
        {
          // tslint:disable-next-line
          raw: `db.test.updateOne(${JSON.stringify({ _id: id })},${JSON.stringify({ $set: { deleted_at: null } })})`,
          action: 'Test.restore()'
        },
        result,
        2
      )
    })
  })
})
