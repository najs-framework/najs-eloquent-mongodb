import { NajsEloquent as NajsEloquentLib } from 'najs-eloquent'

export interface IMongodbQueryLogData extends NajsEloquentLib.Driver.IQueryLogData {
  query?: object
  options?: object
}

export class MongodbQueryLog extends NajsEloquentLib.Driver.QueryLogBase<IMongodbQueryLogData> {
  getDefaultData(): IMongodbQueryLogData {
    return this.getEmptyData()
  }

  query(data: object): object {
    this.data.query = data

    return data
  }

  options(data: object | undefined): object | undefined {
    this.data.options = data

    return data
  }
}
