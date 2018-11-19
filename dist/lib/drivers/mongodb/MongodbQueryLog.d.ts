import { NajsEloquent as NajsEloquentLib } from 'najs-eloquent';
export interface IMongodbQueryLogData extends NajsEloquentLib.Driver.IQueryLogData {
    query?: object;
    options?: object;
}
export declare class MongodbQueryLog extends NajsEloquentLib.Driver.QueryLogBase<IMongodbQueryLogData> {
    getDefaultData(): IMongodbQueryLogData;
    query(data: object): object;
    options(data: object | undefined): object | undefined;
}
