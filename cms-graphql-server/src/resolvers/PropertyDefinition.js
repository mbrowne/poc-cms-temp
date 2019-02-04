import { resolveTypeFromTypename } from '~/utils'

export const PropertyDefinition = {
    __resolveType(obj, context, info) {
        return resolveTypeFromTypename('PropertyDefinition', obj, context, info)
    },
}
