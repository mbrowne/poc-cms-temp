import { resolveTypeFromTypename } from '~/utils'

export const PropertyValue = {
    __resolveType(obj, context, info) {
        return resolveTypeFromTypename('PropertyValue', obj, context, info)
    },
}
