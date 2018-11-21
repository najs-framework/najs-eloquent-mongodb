# najs-eloquent-mongodb

> Mongodb driver for NajsEloquent - an ORM written in Typescript, inspired by Laravel Eloquent.

[![Travis](https://img.shields.io/travis/najs-framework/najs-eloquent-mongodb/master.svg?style=flat-square)](https://travis-ci.org/najs-framework/najs-eloquent-mongodb/builds)
[![Maintainability](https://api.codeclimate.com/v1/badges/d6d0dcf69f8baadbdcb9/maintainability)](https://codeclimate.com/github/najs-framework/najs-eloquent-mongodb/maintainability)
[![Coverage Status](https://img.shields.io/coveralls/najs-framework/najs-eloquent-mongodb/master.svg?style=flat-square)](https://coveralls.io/r/najs-framework/najs-eloquent-mongodb?branch=master)
[![node version](https://img.shields.io/node/v/najs-eloquent-mongodb.svg?style=flat-square)](https://nodejs.org/en/download/)
[![npm version](https://img.shields.io/npm/v/najs-eloquent-mongodb.svg?style=flat-square)](http://badge.fury.io/js/najs-eloquent-mongodb)
[![npm downloads](https://img.shields.io/npm/dm/najs-eloquent-mongodb.svg?style=flat-square)](http://badge.fury.io/js/najs-eloquent-mongodb)
[![npm license](https://img.shields.io/npm/l/najs-eloquent-mongodb.svg?style=flat-square)](http://badge.fury.io/js/najs-eloquent-mongodb)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com)

## Installation

Add `najs-binding`, `najs-eloquent`, `najs-eloquent-mongodb`

```bash
yarn add najs-binding najs-eloquent najs-eloquent-mongodb
```

or

```bash
npm install najs-binding najs-eloquent najs-eloquent-mongodb
```

That's it.

## Define Model runs with MongodbDriver

You can register MongodbDriver as default driver by this way

```typescript
import { DriverProvider } from 'najs-eloquent'
import { MongodbDriver } from 'najs-eloquent-mongodb'

DriverProvider.register(MongodbDriver, 'mongodb', true)
```

Or if you want to use MongodbDriver for some specific models only, you can extends from `MongodbModel` instead of `Model`

```typescript
import { MongodbModel } from 'najs-eloquent-mongodb'

export class User extends MongodbModel {
  // define a property belongs to User model
  email: string

  // define a class name which used for Dependency injection
  // (this feature provided by "najs-binding" package)
  getClassName() {
    return 'YourNamespace.User'
  }
}

// Register the User class
MongodbModel.register(User)
```

## Connect to database and provide custom MongoClient instance

You may want to connect and provide your own `MongoClient` instance, you can do it by using `.bind()` function of the `najs-binding` package. _Note: Please ensure that this file is loaded before using najs-eloquent._

```typescript
import { bind } from 'najs-binding'
import { MongodbProviderFacade } from 'najs-eloquent-mongodb'

// Load your mongodb instance instead of mongodb dependency in "najs-eloquent-mongodb" package
import { Db, MongoClient } from 'mongodb'

export class YourMongodbProvider {
  static className: string = 'YourNamespace.YourMongodbProvider'

  getClassName() {
    return YourMongodbProvider.className
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

bind('NajsEloquent.Provider.MongodbProvider', YourMongodbProvider.className)

// Reload the facade, then najs-eloquent will use your mongodb instance
MongodbProviderFacade.reloadFacadeRoot()
```

## Contribute

PRs are welcomed to this project, and help is needed in order to keep up with the changes of Laravel Eloquent. If you want to improve the library, add functionality or improve the docs please feel free to submit a PR.

## Sponsors

If you want to become a sponsor please [let me know](mailto:nhat@ntworld.net).

You can buy me a beer via [Paypal](https://paypal.me/beerfornhat) or [Patreon](https://patreon.com/nhat).

Thanks in advance!

## License

MIT © Nhat Phan
