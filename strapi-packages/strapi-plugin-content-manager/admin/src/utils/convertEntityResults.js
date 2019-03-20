export function convertEntityResults(entities) {
    return entities.map(convertEntityResult)
}

// Convert entity result from GraphQL to a format that's more easily usable in the client
export function convertEntityResult(entity) {
    const state = {}
    for (const { propertyId, value: propValue } of entity.state) {
        if (propValue === null) {
            state[propertyId] = null
            continue
        }
        let value
        const valueType = propValue.__typename
        if (valueType === 'LiteralPropertyValue') {
            value = JSON.parse(propValue.value)
        } else if (valueType === 'Associations') {
            // convert to an array of the associated entities
            value = propValue.associations.map(assoc => assoc.destinationEntity)
        } else {
            throw Error(`Unrecognized property value type '${valueType}'`)
        }
        state[propertyId] = value
    }
    return {
        ...entity,
        state,
    }
}
