import 'jest'
import { MongodbConvention } from '../../../lib/drivers/mongodb/MongodbConvention'

describe('MongodbConvention', function() {
  const convention = new MongodbConvention()

  describe('.formatFieldName()', function() {
    it('simply returns name from parameter, convert id into _id', function() {
      const dataList = {
        test: 'test',
        id: '_id',
        _id: '_id'
      }

      for (const name in dataList) {
        expect(convention.formatFieldName(name)).toEqual(dataList[name])
      }
    })
  })

  describe('.getNullValueFor()', function() {
    it('simply returns null', function() {
      const dataList = {
        // tslint:disable-next-line
        test: null,
        // tslint:disable-next-line
        id: null
      }

      for (const name in dataList) {
        expect(convention.getNullValueFor(name)).toBeNull()
      }
    })
  })
})
