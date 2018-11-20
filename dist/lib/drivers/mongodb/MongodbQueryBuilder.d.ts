import { NajsEloquent as NajsEloquentLib } from 'najs-eloquent';
import { MongodbQueryBuilderHandler } from './MongodbQueryBuilderHandler';
import { Collection } from 'mongodb';
export declare class MongodbQueryBuilder<T, H extends MongodbQueryBuilderHandler = MongodbQueryBuilderHandler> extends NajsEloquentLib.QueryBuilder.QueryBuilder<T, H> {
    native(handler: (collection: Collection, conditions: object, options?: object) => Promise<any>): {
        execute(): Promise<any>;
    };
    collection(): Collection<any>;
}
