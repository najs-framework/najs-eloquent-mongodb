/// <reference path="../contracts/MongodbProvider.ts" />

import { Facade } from 'najs-facade'
import { register } from 'najs-binding'
import { ClassNames } from '../constants'
import { Db, MongoClient } from 'mongodb'

export class MongodbProvider extends Facade implements Najs.Contracts.Eloquent.MongodbProvider<MongoClient, Db> {
  mongoClient: MongoClient

  getClassName() {
    return ClassNames.Provider.MongodbProvider
  }

  connect(url: string): Promise<this> {
    return new Promise((resolve, reject) => {
      MongoClient.connect(
        url,
        { useNewUrlParser: true },
        (error: any, client: MongoClient) => {
          if (error) {
            return reject(error)
          }

          this.mongoClient = client
          resolve(this)
        }
      )
    })
  }

  close(): this {
    if (this.mongoClient) {
      this.mongoClient.close()
    }

    return this
  }

  getMongoClient(): MongoClient {
    return this.mongoClient
  }

  getDatabase(dbName?: string): Db {
    return this.mongoClient && this.mongoClient.db(dbName)
  }
}
register(MongodbProvider, ClassNames.Provider.MongodbProvider)
