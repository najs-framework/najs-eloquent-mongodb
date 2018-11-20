import IModel = NajsEloquent.Model.IModel;
import IQueryBuilderHandler = NajsEloquent.QueryBuilder.IQueryBuilderHandler;
import { Collection } from 'mongodb';
import { NajsEloquent as NajsEloquentLib } from 'najs-eloquent';
import { MongodbRecordExecutor } from './MongodbRecordExecutor';
import { MongodbQueryExecutor } from './MongodbQueryExecutor';
import { MongodbQueryLog } from './MongodbQueryLog';
export declare class MongodbExecutorFactory implements NajsEloquent.Driver.IExecutorFactory {
    static className: string;
    makeRecordExecutor<T extends NajsEloquentLib.Driver.Record>(model: IModel, record: T): MongodbRecordExecutor;
    makeQueryExecutor(handler: IQueryBuilderHandler): MongodbQueryExecutor;
    getClassName(): string;
    getCollection(model: IModel): Collection;
    makeLogger(): MongodbQueryLog;
}
