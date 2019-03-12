import { ObjectID } from 'mongodb'
import { db } from '~/mongoDatabase'

const entitiesColl = () => db.collection('entities')

export const entityRepository = {
    async save(entity) {
        const { id, ...rest } = entity
        if (!id) {
            const result = await entitiesColl().insertOne(rest)
            return result.insertedId
        }
        return entitiesColl().replaceOne({ _id: new ObjectID(id) }, rest)
    },

    async find(conditions) {
        if (!conditions.entityDefId) {
            throw Error('entityDefId is required')
        }
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

    async delete(id) {
        const entity = await this.getById(id)
        if (!entity) {
            throw Error(`Entity ID '${id}' not found`)
        }
        await entitiesColl().deleteOne({ _id: new ObjectID(id) })
        return entity
    },
}

function renameIdField({ _id, ...fields }) {
    return {
        id: _id,
        ...fields,
    }
}
