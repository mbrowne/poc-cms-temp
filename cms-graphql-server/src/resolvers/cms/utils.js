// Transform input to the createEntityRequest or updateEntityRequest mutation
// to a representation of the entity matching our domain model for the backend
export function graphqlInputToBackendModel(
    entityInput,
    existingBackendEntity = null
) {
    // If the entityInStorage argument was passed, then we we're updating an existing entity
    if (existingBackendEntity) {
        const { initialState, updatedState, entityId } = entityInput
        // TODO
        const entity = { ...existingBackendEntity }
        return entity
    }

    const entity = {
        id: null,
        state: {},
    }
    const associations = []
    const { initialState } = entityInput
    buildBackendEntityState(entity, initialState)
    return { entity, associations }
}

function buildBackendEntityState(entity, state) {
    for (const propState of state) {
        switch (true) {
            case propState.hasOwnProperty('literalValue'):
                entity.state[propState.propertyId] = propState.literalValue
                break
            // TODO associations
        }
    }
}

export function backendEntityToGraphqlEntity(backendEntity) {
    const state = Object.entries(backendEntity.state).map(
        ([propertyId, value]) => ({
            propertyId,
            value: {
                __typename: 'LiteralPropertyValue',
                value,
            },
        })
    )
    // TODO associations
    return {
        ...backendEntity,
        state,
    }
}
