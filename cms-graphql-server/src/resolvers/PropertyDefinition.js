import { resolveTypeFromTypename } from '~/utils'
import { Query } from './Query'

export const PropertyDefinition = {
    __resolveType(obj, context, info) {
        return resolveTypeFromTypename('PropertyDefinition', obj, context, info)
    },

    // TEMP, until UI is updated to require label
    label(prop) {
        return prop.label || prop.id[0].toUpperCase() + prop.id.substring(1)
    },
}

export const LiteralProperty = {
    label: PropertyDefinition.label,
}

export const AssociationDefinition = {
    label: PropertyDefinition.label,
    // NB: Not including a resolver for sourceItemDef here because it's always the same as the entity
    // that owns the association "property"
    async destinationItemDef({ destinationItemDef }) {
        const destinationEntityDef = await Query.entityDefinition(
            {},
            { id: destinationItemDef.entityDefId }
        )
        return {
            ...destinationItemDef,
            entityDef: destinationEntityDef,
        }
    },
}
