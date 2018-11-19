/// <reference types="najs-eloquent" />

export class MongodbConditionMatcher implements NajsEloquent.QueryBuilder.IConditionMatcher<any> {
  protected field: string
  protected operator: string
  protected value: any

  constructor(field: string, operator: string, value: any) {
    this.field = field
    this.operator = operator
    this.value = value
  }

  getField() {
    return this.field
  }

  isMatch(record: any): boolean {
    // It always returns false, mongodb will not use conditions matcher, it
    // just implements this interface then transform condition matchers to object
    return false
  }

  toMongodbQuery(): object {
    return {
      [this.field]: this.getMongodbQueryValue()
    }
  }

  getMongodbQueryValue() {
    switch (this.operator) {
      case '!=':
      case '<>':
        return { $ne: this.value }

      case '<':
        return { $lt: this.value }

      case '<=':
      case '=<':
        return { $lte: this.value }

      case '>':
        return { $gt: this.value }

      case '>=':
      case '=>':
        return { $gte: this.value }

      case 'in':
        return { $in: this.value }

      case 'not-in':
        return { $nin: this.value }

      default:
        return this.value
    }
  }
}
