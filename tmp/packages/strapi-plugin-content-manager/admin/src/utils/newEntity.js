// Factory function for creating new entity objects
export function newEntity(entityDef) {
    const state = {}
    for (const [propId, prop] of Object.entries(entityDef.properties)) {
        state[propId] = prop.__typename === 'AssociationDefinition' ? [] : null
    }
    return {
        id: null,
        state,
    }
}
