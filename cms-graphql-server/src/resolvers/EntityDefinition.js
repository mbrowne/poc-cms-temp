export const EntityDefinition = {
    // TEMP, until UI is updated to require label
    label(entityDef) {
        return entityDef.label || entityDef.id
    },

    propertiesCount(entityDef) {
        return entityDef.properties.length
    },

    adminUiSettings(entityDef) {
        return {
            // just show the first 5 properties for now
            propertiesToShowOnListScreen: entityDef.properties.slice(0, 5),
            // just show all properties for now
            propertiesToShowOnEditForm: entityDef.properties,
        }
    },
}
