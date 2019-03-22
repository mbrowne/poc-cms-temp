export const EntityDefinition = {
    // TEMP, until UI is updated to require label
    label(entityDef) {
        return entityDef.label || entityDef.id
    },

    properties(entityDef, filters) {
        // This resolver can get run multiple times...if the full array of properties was
        // already populated, we don't want to populate it again.
        if (entityDef.__propertiesIncludingInherited) {
            return filterProperties(
                entityDef.__propertiesIncludingInherited,
                filters
            )
        }

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
        // TODO multiple levels of inheritance
        const inheritedProperties = entityDef.templateEntityDefinition
            ? entityDef.templateEntityDefinition.properties.map(prop => ({
                  ...prop,
                  inheritedFrom: entityDef.templateEntityDefinition,
              }))
            : []

        let allProperties
        if (inheritedProperties.length) {
            allProperties = [
                {
                    ...businessIdProp,
                    inheritedFrom: entityDef.templateEntityDefinition,
                },
                ...inheritedProperties,
                ...ownProperties,
            ]
        } else {
            allProperties = ownProperties
        }
        entityDef.__propertiesIncludingInherited = allProperties
        return filterProperties(allProperties, filters)
    },

    propertiesCount(entityDef) {
        return entityDef.properties.length
    },

    adminUiSettings(entityDef) {
        const allProps = EntityDefinition.properties(entityDef, {})
        return {
            // just show the first 5 properties for now
            propertiesToShowOnListScreen: allProps.slice(0, 5),
            // just show all properties for now
            propertiesToShowOnEditForm: allProps,
        }
    },
}

function filterProperties(props, { excludeInherited }) {
    const tmp = excludeInherited
        ? props.filter(p => p.id === 'businessId' || !p.inheritedFrom)
        : props
    return tmp
}
