import { db } from '~/mongoDatabase'

const entitiesColl = () => db.collection('entities')

export const entityRepository = {
    async save(entity) {
        const { id, ...rest } = entity
        if (!id) {
            return entitiesColl().insertOne(rest)
        }
        return entitiesColl().replaceOne({ _id: id }, rest)
    },

    async find(conditions) {
        const results = await entitiesColl()
            .find(conditions)
            .toArray()
        // console.log('results: ', results);
        return results.map(({ _id, ...rest }) => ({
            ...rest,
            id: _id,
        }))
    },
}
