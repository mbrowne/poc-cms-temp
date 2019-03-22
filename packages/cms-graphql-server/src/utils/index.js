export function resolveTypeFromTypename(parentType, obj, context, info) {
    const { __typename: typename } = obj
    if (!typename) {
        console.warn(
            `Could not determine type of ${parentType} object:`,
            JSON.stringify(obj)
        )
        return null
    }
    if (!info.schema.getType(typename)) {
        console.warn(
            `Invalid typename specified for ${parentType} object:`,
            typename
        )
        return null
    }
    return typename
}
