export const EntityDefinition = {
    // TEMP, until UI is updated to require label
    label(entityDef) {
        return entityDef.label || entityDef.id
    },

    async properties(entityDef, { excludeInherited }) {
        // businessId is always the first property...we could store it too but that seems redundant, so we just add it here...
        const businessIdProp = {
            __typename: 'LiteralPropertyDefinition',
            id: 'businessId',
            label: 'ID',
            dataType: 'string',
            readOnly: false,
        }
        const ownProperties = entityDef.properties
        if (!entityDef.templateEntityDefinition) {
            ownProperties.unshift(businessIdProp)
        }
        if (excludeInherited) {
            return ownProperties
        }
        // TODO multiple levels of inheritance
        const inheritedProperties = entityDef.templateEntityDefinition
            ? entityDef.templateEntityDefinition.properties.map(prop => ({
                  ...prop,
                  inheritedFrom: entityDef.templateEntityDefinition,
              }))
            : []
        return [
            {
                ...businessIdProp,
                inheritedFrom: entityDef.templateEntityDefinition,
            },
            ...inheritedProperties,
            ...ownProperties,
        ]
    },

    propertiesCount(entityDef) {
        return entityDef.properties.length
    },

    adminUiSettings(entityDef) {
        return {
            // just show the first 5 properties for now
            propertiesToShowOnListScreen: entityDef.properties.slice(0, 5),
            // just show all properties for now
            propertiesToShowOnEditForm: EntityDefinition.properties(
                entityDef,
                {}
            ),
        }
    },
}
