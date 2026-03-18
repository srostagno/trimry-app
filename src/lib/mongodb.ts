import { MongoClient } from 'mongodb'

type GlobalMongo = typeof globalThis & {
  _trimryMongoClientPromise?: Promise<MongoClient>
}

const globalMongo = globalThis as GlobalMongo

function getClientPromise() {
  const uri = process.env.MONGODB_URI

  if (!uri) {
    throw new Error('Missing MONGODB_URI environment variable.')
  }

  const clientPromise =
    globalMongo._trimryMongoClientPromise ??
    new MongoClient(uri, {
      maxPoolSize: 10,
      minPoolSize: 1,
    }).connect()

  if (process.env.NODE_ENV !== 'production') {
    globalMongo._trimryMongoClientPromise = clientPromise
  }

  return clientPromise
}

export async function getDb() {
  const client = await getClientPromise()
  return client.db(process.env.MONGODB_DB ?? 'trimry')
}
