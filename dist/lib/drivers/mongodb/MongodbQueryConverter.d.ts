import { NajsEloquent as NajsEloquentLib } from 'najs-eloquent';
import { MongodbConditionMatcher } from './MongodbConditionMatcher';
export declare type RawConditions = Array<MongodbConditionMatcher | RawConvertedQuery>;
export declare type RawConvertedQuery = {
    $and: RawConditions[];
} | {
    $or: RawConditions[];
} | {};
export declare class MongodbQueryConverter {
    protected basicQuery: NajsEloquentLib.QueryBuilder.Shared.BasicQuery;
    constructor(basicQuery: NajsEloquentLib.QueryBuilder.Shared.BasicQuery);
    getConvertedQuery(): object;
    getRawConvertedQueryFromBasicQueryConverter(): RawConvertedQuery;
    convert(rawQuery: RawConvertedQuery): object;
    toMongodbQuery(conditions: RawConditions): object[];
    simplify(conditions: MongodbConditionMatcher[]): {};
    shouldSimplify(conditions: RawConditions): boolean;
}
