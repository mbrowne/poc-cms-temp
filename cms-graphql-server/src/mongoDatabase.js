import { MongoClient } from 'mongodb'

const mongoUrl = process.env.MONGO_HOST || 'mongodb://localhost:27017'
const mongoDbName = process.env.MONGO_DATABASE || 'poc_artnet_cms_v1'

let db

export default function getDb() {
    return db
}

export async function initMongo() {
    if (!db) {
        console.log('Connecting to MongoDB...')
        const mongoClient = new MongoClient(mongoUrl)
        try {
            await mongoClient.connect()
            console.log('Successfully connected to Mongo')
        } catch (e) {
            throw e
        }
        db = mongoClient.db(mongoDbName)
    }
}
