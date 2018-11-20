import { MongodbProviderFacade } from '../lib/facades/global/MongodbProviderFacade'

export function init_mongodb(name: string): any {
  return MongodbProviderFacade.connect('mongodb://localhost:27017/najs_eloquent_test_' + name)
}

export function delete_collection_use_mongodb(name: string): any {
  return MongodbProviderFacade.getDatabase()
    .collection(name)
    .drop()
}
