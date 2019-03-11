// const propTypes = [
//     'literalProperty',
//     'associationProperty',
//     'staticAssetProperty',
// ]

// Transform the input data into the format we want to save in the JSON file
export function prepareEntityDefForStorage(inputObj) {
    if (!inputObj.properties) {
        return inputObj
    }
    const properties = inputObj.properties
        .filter(propInput => propInput.id !== 'businessId')
        .map(propInput => {
            // New approach: use `typename` field of PropertyInput type
            const { typename, ...propFields } = propInput
            return {
                __typename: typename,
                ...propFields,
            }

            // Old approach:
            // const hasPropTypeInput = propTypes.some(propType =>
            //     propInput.hasOwnProperty(propType)
            // )
            // if (!hasPropTypeInput) {
            //     const propType = 'LiteralProperty'
            //     return {
            //         __typename: propType,
            //         ...propInput,
            //     }
            // } else {
            //     throw Error('TODO')
            // }
        })
    return { ...inputObj, properties }
}

// Transform input to the createEntityRequest or updateEntityRequest mutation
// to a representation of the entity matching our domain model for the backend
export function graphqlInputToBackendModel(
    entityInput,
    existingBackendEntity = null
) {
    // If the entityInStorage argument was passed, then we we're updating an existing entity
    if (existingBackendEntity) {
        const { updatedState } = entityInput
        const entity = { ...existingBackendEntity }
        const associations = []
        buildBackendEntityState(entity, updatedState)
        return { entity, associations }
    }

    const { initialState, entityDefId } = entityInput
    const entity = {
        id: null,
        entityDefId,
        state: {},
    }
    const associations = []
    buildBackendEntityState(entity, initialState)
    return { entity, associations }
}

function buildBackendEntityState(entity, stateInput) {
    for (const propState of stateInput) {
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
