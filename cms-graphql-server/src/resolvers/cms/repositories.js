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

    async getMultipleById(ids) {
        const conditions = {
            _id: { $in: ids.map(id => new ObjectID(id)) },
        }
        // console.log('conditions: ', JSON.stringify(conditions))
        const results = await entitiesColl()
            .find(conditions)
            .toArray()
        return results.map(renameIdField)
    },

    async getById(id) {
        const results = await entitiesColl()
            .find({ _id: new ObjectID(id) })
            .toArray()
        return renameIdField(results[0]) || null
    },

    async delete(idOrIds) {
        const ids = Array.isArray(idOrIds) ? idOrIds : [idOrIds]
        const entities = await this.getMultipleById(ids)
        if (entities.length !== ids.length) {
            const missingEntityIds = ids.filter(
                id => !entities.find(e => e.id === id)
            )
            throw Error(
                `The following entity IDs were not found: ${missingEntityIds.join(
                    ', '
                )}`
            )
        }
        await entitiesColl().deleteMany({
            _id: { $in: ids.map(id => new ObjectID(id)) },
        })
        return entities
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

    async findAllAssociatedWithSource(sourceEntityId) {
        const results = await associationsColl()
            .find({
                sourceEntityId,
            })
            .toArray()
        return results.map(renameIdField)
    },

    // // This returns all the Associations for a particular property ID.
    // // For a one-to-one relationship, it will only be one Association.
    // // For a one-to-many or many-to-many relationship, it could be multiple Associations.
    // async findAssocDestinations(sourceEntityId, propertyId) {
    //     const results = await associationsColl().find({
    //         sourceEntityId,
    //         associationDef: {
    //             name: propertyId,
    //         },
    //     })
    //     return results.map(renameIdField)
    // },
}

function renameIdField({ _id, ...fields }) {
    return {
        id: _id,
        ...fields,
    }
}
