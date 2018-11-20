/// <reference types="najs-eloquent" />

export class MongodbConvention implements NajsEloquent.QueryBuilder.IConvention {
  formatFieldName(name: any) {
    if (name === 'id') {
      return '_id'
    }
    return name
  }

  getNullValueFor(name: any) {
    // tslint:disable-next-line
    return null
  }
}
