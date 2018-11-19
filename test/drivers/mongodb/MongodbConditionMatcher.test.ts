import 'jest'
import * as Sinon from 'sinon'
import { MongodbConditionMatcher } from '../../../lib/drivers/mongodb/MongodbConditionMatcher'

describe('MongodbConditionMatcher', function() {
  describe('.getField()', function() {
    it('simply returns the field', function() {
      const matcher = new MongodbConditionMatcher('field', '=', 'any')
      expect(matcher.getField() === 'field').toBe(true)
    })
  })

  describe('.isMatch()', function() {
    it('always returns false', function() {
      const matcher = new MongodbConditionMatcher('field', '=', 'any')
      expect(matcher.isMatch({})).toBe(false)
    })
  })

  describe('.toMongodbQuery()', function() {
    it('returns an object with field is a key and value from .getMongodbQueryValue()', function() {
      const matcher = new MongodbConditionMatcher('field', '=', 'any')
      const stub = Sinon.stub(matcher, 'getMongodbQueryValue')
      stub.returns('anything')

      expect(matcher.toMongodbQuery()).toEqual({ field: 'anything' })
    })
  })

  describe('.getMongodbQueryValue()', function() {
    const dataset = [
      { desc: 'returns a value if for operator [operator]', operator: '=', value: 'value', output: 'value' },
      { desc: 'returns a value if for operator [operator]', operator: '==', value: 'value', output: 'value' },
      {
        desc: 'returns a {$ne: value} if for operator [operator]',
        operator: '!=',
        value: 'value',
        output: { $ne: 'value' }
      },
      {
        desc: 'returns a {$ne: value} if for operator [operator]',
        operator: '<>',
        value: 'value',
        output: { $ne: 'value' }
      },
      {
        desc: 'returns a {$lt: value} if for operator [operator]',
        operator: '<',
        value: 'value',
        output: { $lt: 'value' }
      },
      {
        desc: 'returns a {$lte: value} if for operator [operator]',
        operator: '<=',
        value: 'value',
        output: { $lte: 'value' }
      },
      {
        desc: 'returns a {$lte: value} if for operator [operator]',
        operator: '=<',
        value: 'value',
        output: { $lte: 'value' }
      },
      {
        desc: 'returns a {$gt: value} if for operator [operator]',
        operator: '>',
        value: 'value',
        output: { $gt: 'value' }
      },
      {
        desc: 'returns a {$gte: value} if for operator [operator]',
        operator: '>=',
        value: 'value',
        output: { $gte: 'value' }
      },
      {
        desc: 'returns a {$gte: value} if for operator [operator]',
        operator: '=>',
        value: 'value',
        output: { $gte: 'value' }
      },
      {
        desc: 'returns a {$in: value} if for operator [operator]',
        operator: 'in',
        value: 'value',
        output: { $in: 'value' }
      },
      {
        desc: 'returns a {$nin: value} if for operator [operator]',
        operator: 'not-in',
        value: 'value',
        output: { $nin: 'value' }
      }
    ]

    for (const data of dataset) {
      it(data.desc.replace('[operator]', data.operator), function() {
        const matcher = new MongodbConditionMatcher('field', data.operator, data.value)
        expect(matcher.getMongodbQueryValue()).toEqual(data.output)
      })
    }
  })
})
