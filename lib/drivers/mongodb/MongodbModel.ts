import { DriverProvider, Model, NajsEloquent as NajsEloquentLib } from 'najs-eloquent'
import { MongodbQueryBuilder } from './MongodbQueryBuilder'
import { MongodbQueryBuilderHandler } from './MongodbQueryBuilderHandler'
import { MongodbDriver } from './MongodbDriver'
import { Collection } from 'mongodb'

export class MongodbModel extends Model {
  public id?: string

  protected makeDriver<T>(): Najs.Contracts.Eloquent.Driver<T> {
    if (!DriverProvider.has(MongodbDriver)) {
      DriverProvider.register(MongodbDriver, MongodbDriver.name)
      DriverProvider.bind(this.getModelName(), MongodbDriver.name)
    }

    return super.makeDriver()
  }

  newQuery(): MongodbQueryBuilder<this, MongodbQueryBuilderHandler> {
    return super.newQuery() as MongodbQueryBuilder<this, MongodbQueryBuilderHandler>
  }

  getNativeCollection<T>(): Collection<T> {
    return this.newQuery().collection()
  }
}

NajsEloquentLib.Util.PrototypeManager.stopFindingRelationsIn(MongodbModel.prototype)
