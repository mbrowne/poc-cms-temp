import { ObjectID } from 'mongodb'
import { db } from '~/mongoDatabase'

const entitiesColl = () => db.collection('entities')

export const entityRepository = {
    async save(entity) {
        const { id, ...rest } = entity
        if (!id) {
            return entitiesColl().insertOne(rest)
        }
        return entitiesColl().replaceOne({ _id: new ObjectID(id) }, rest)
    },

    async find(conditions) {
        const results = await entitiesColl()
            .find(conditions)
            .toArray()
        // console.log('results: ', results);
        return results.map(renameIdField)
    },

    async getById(id) {
        const results = await entitiesColl()
            .find({ _id: new ObjectID(id) })
            .toArray()
        return renameIdField(results[0]) || null
    },
}

function renameIdField({ _id, ...fields }) {
    return {
        id: _id,
        ...fields,
    }
}
