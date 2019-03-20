import { keyBy } from 'lodash'
import { backendEntityToGraphqlEntity } from './cms/utils'

export const Entity = {
    // TODO make this configurable.
    // For now we just return something that seems like a name/title property
    async displayName(entity) {
        // depending on when this resolver is called, `entity.state` may or may not have already been
        // converted to an array, so ensure we're starting with an array...
        const stateArr = Array.isArray(entity.state)
            ? entity.state
            : (await backendEntityToGraphqlEntity(entity)).state
        const state = keyBy(stateArr, 'propertyId')

        const propState =
            state.displayName || state.name || state.title || state.businessId
        return propState.value.value
    },

    async state(entity) {
        if (Array.isArray(entity.state)) {
            return entity.state
        }
        // If state isn't an array, then the state of an associated entity was requested,
        // so resolve it since it was requested. (We don't resolve this by default, because
        // there could potentially be infinite nesting.)
        const resolvedEntity = await backendEntityToGraphqlEntity(entity)
        return resolvedEntity.state
    },
}
