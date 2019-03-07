import { resolveTypeFromTypename } from '~/utils'

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
}
