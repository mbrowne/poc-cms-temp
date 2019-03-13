import { ObjectID } from 'mongodb'
import { db } from '~/mongoDatabase'

const entitiesColl = () => db.collection('entities')
const associationsColl = () => db.collection('associations')

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

    async getMultipleById(ids /*: Array<string | ObjectID> */) {
        const conditions = {
            _id: { $in: ids.map(id => new ObjectID(id)) },
        }
        // console.log('conditions: ', JSON.stringify(conditions))
        const results = await entitiesColl()
            .find(conditions)
            .toArray()
        return results.map(renameIdField)
    },

    async getById(id /*: string | ObjectID */) {
        const results = await entitiesColl()
            .find({ _id: new ObjectID(id) })
            .toArray()
        if (!results.length) {
            return null
        }
        return renameIdField(results[0])
    },

    async delete(idOrIds) {
        const ids = Array.isArray(idOrIds) ? idOrIds : [idOrIds]
        const results = await this.getMultipleById(ids)
        if (results.length !== ids.length) {
            const missingIds = ids.filter(
                id => !results.find(obj => obj.id === id)
            )
            const msg = `The following entity IDs were not found: ${missingIds.join(
                ', '
            )}`
            if (results.length) {
                // partial success
                console.warn(msg)
            } else {
                throw Error(msg)
            }
        }
        await entitiesColl().deleteMany({
            _id: { $in: ids.map(id => new ObjectID(id)) },
        })
        return results // entities that were deleted
    },
}

export const associationRepository = {
    async saveMultiple(associations) {
        // Note: This is not efficient at all, but works for the POC
        for (const assoc of associations) {
            await this.save(assoc)
        }
    },

    async save(assoc) {
        const { id, ...rest } = assoc
        if (!id) {
            const result = await associationsColl().insertOne(rest)
            return result.insertedId
        }
        return associationsColl().replaceOne({ _id: new ObjectID(id) }, rest)
    },

    // Returns all associations for the given sourceEntityId
    async findBySourceEntityId(sourceEntityId /*: string | ObjectID */) {
        if (typeof sourceEntityId !== 'string') {
            sourceEntityId = sourceEntityId.toString()
        }
        const results = await associationsColl()
            .find({
                items: {
                    $elemMatch: {
                        direction: 'source',
                        entityId: sourceEntityId,
                    },
                },
            })
            .toArray()
        return results.map(renameIdField)
    },

    async getMultipleById(ids /*: Array<string | ObjectID> */) {
        const conditions = {
            _id: {
                $in: ids.map(id => new ObjectID(id)),
            },
        }
        // console.log('conditions: ', JSON.stringify(conditions))
        const results = await associationsColl()
            .find(conditions)
            .toArray()
        return results.map(renameIdField)
    },

    async delete(idOrIds) {
        const ids = Array.isArray(idOrIds) ? idOrIds : [idOrIds]
        const results = await this.getMultipleById(ids)
        if (results.length !== ids.length) {
            const missingIds = ids.filter(
                id => !results.find(obj => obj.id === id)
            )
            const msg = `The following association IDs were not found: ${missingIds.join(
                ', '
            )}`
            if (results.length) {
                // partial success
                console.warn(msg)
            } else {
                throw Error(msg)
            }
        }
        await associationsColl().deleteMany({
            _id: { $in: ids.map(id => new ObjectID(id)) },
        })
        return results // associations that were deleted
    },
}

function renameIdField({ _id, ...fields }) {
    return {
        id: _id,
        ...fields,
    }
}
