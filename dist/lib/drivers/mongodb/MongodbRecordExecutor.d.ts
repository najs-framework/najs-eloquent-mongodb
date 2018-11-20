import Model = NajsEloquent.Model.IModel;
import { Collection } from 'mongodb';
import { NajsEloquent as NajsEloquentLib } from 'najs-eloquent';
import { MongodbQueryLog } from './MongodbQueryLog';
export declare class MongodbRecordExecutor extends NajsEloquentLib.Driver.RecordExecutorBase {
    protected logger: MongodbQueryLog;
    protected collection: Collection;
    constructor(model: Model, record: NajsEloquentLib.Driver.Record, collection: Collection, logger: MongodbQueryLog);
    createRecord<R = any>(action: string): Promise<R>;
    updateRecord<R = any>(action: string): Promise<R>;
    hardDeleteRecord<R = any>(): Promise<R>;
    getModifiedData(): {};
    getFilter(): {};
    logRaw(func: string, ...args: any[]): MongodbQueryLog;
}
