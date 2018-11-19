export declare class MongodbConditionMatcher implements NajsEloquent.QueryBuilder.IConditionMatcher<any> {
    protected field: string;
    protected operator: string;
    protected value: any;
    constructor(field: string, operator: string, value: any);
    getField(): string;
    isMatch(record: any): boolean;
    toMongodbQuery(): object;
    getMongodbQueryValue(): any;
}
