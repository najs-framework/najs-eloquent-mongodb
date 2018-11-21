import { Model } from 'najs-eloquent';
import { MongodbQueryBuilder } from './MongodbQueryBuilder';
import { MongodbQueryBuilderHandler } from './MongodbQueryBuilderHandler';
import { Collection } from 'mongodb';
export declare class MongodbModel extends Model {
    id?: string;
    protected makeDriver<T>(): Najs.Contracts.Eloquent.Driver<T>;
    newQuery(): MongodbQueryBuilder<this, MongodbQueryBuilderHandler>;
    getNativeCollection<T>(): Collection<T>;
}
