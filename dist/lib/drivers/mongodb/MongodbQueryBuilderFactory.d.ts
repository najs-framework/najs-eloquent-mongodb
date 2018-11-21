import { MongodbQueryBuilder } from './MongodbQueryBuilder';
export declare class MongodbQueryBuilderFactory implements NajsEloquent.QueryBuilder.IQueryBuilderFactory {
    static className: string;
    getClassName(): string;
    make(model: NajsEloquent.Model.IModel): MongodbQueryBuilder<any>;
}
