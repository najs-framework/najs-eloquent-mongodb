import IConditionMatcherFactory = NajsEloquent.QueryBuilder.IConditionMatcherFactory;
import SingleQueryConditionData = NajsEloquent.QueryBuilder.SingleQueryConditionData;
import { MongodbConditionMatcher } from './MongodbConditionMatcher';
export declare class MongodbConditionMatcherFactory implements IConditionMatcherFactory {
    static className: string;
    getClassName(): string;
    make(data: SingleQueryConditionData): MongodbConditionMatcher;
    transform(matcher: MongodbConditionMatcher): MongodbConditionMatcher;
}
