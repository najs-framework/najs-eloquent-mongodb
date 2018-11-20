import IModel = NajsEloquent.Model.IModel;
import IConvention = NajsEloquent.QueryBuilder.IConvention;
import IConditionQuery = NajsEloquent.QueryGrammar.IConditionQuery;
import { NajsEloquent as NajsEloquentLib } from 'najs-eloquent';
export declare class MongodbQueryBuilderHandler extends NajsEloquentLib.QueryBuilder.QueryBuilderHandlerBase {
    protected basicQuery: NajsEloquentLib.QueryBuilder.Shared.BasicQuery;
    protected conditionQuery: NajsEloquentLib.QueryBuilder.Shared.ConditionQueryHandler;
    protected convention: NajsEloquent.QueryBuilder.IConvention;
    constructor(model: IModel);
    getBasicQuery(): NajsEloquentLib.QueryBuilder.Shared.BasicQuery;
    getConditionQuery(): IConditionQuery;
    getQueryConvention(): IConvention;
}
