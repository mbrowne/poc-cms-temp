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

export const LiteralPropertyDefinition = {
    label: PropertyDefinition.label,
}

export const AssociationDefinition = {
    label: PropertyDefinition.label,
    sourceItemDef({ sourceItemDef }) {
        return {
            ...sourceItemDef,
            // NB: Not including the entityDef here since we'll probably never need to query for it.
            // The entityDef of the sourceItemDef is always the same as the entity definition that owns
            // the property, so it's probably redundant.
            entityDef: new Error('TODO'),
        }
    },
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
