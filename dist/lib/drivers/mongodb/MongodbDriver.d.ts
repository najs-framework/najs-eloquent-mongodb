import { NajsEloquent as NajsEloquentLib } from 'najs-eloquent';
import { MongodbQueryBuilderFactory } from './MongodbQueryBuilderFactory';
export declare class MongodbDriver<T extends NajsEloquentLib.Driver.Record = NajsEloquentLib.Driver.Record> extends NajsEloquentLib.Driver.DriverBase<T> {
    protected recordManager: NajsEloquent.Feature.IRecordManager<T>;
    static Name: string;
    constructor();
    getClassName(): string;
    getRecordManager(): NajsEloquent.Feature.IRecordManager<T>;
    makeQueryBuilderFactory(): MongodbQueryBuilderFactory;
}
