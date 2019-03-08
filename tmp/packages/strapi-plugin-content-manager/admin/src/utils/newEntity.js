// Factory function for creating new entity objects
export function newEntity(entityDef) {
    const state = {}
    for (const propId in entityDef.properties) {
        state[propId] = null
    }
    return {
        id: null,
        state,
    }
}
