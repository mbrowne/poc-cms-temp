export function getLayout(properties /*: PropertyDefinition[] */) {
    const layoutProps = {}
    for (const prop of properties) {
        layoutProps[prop.id] = {
            label: prop.label,
            appearance: getAppearance(prop.dataType),
        }
    }
    return {
        properties: layoutProps,
    }
}

function getAppearance(dataType) {
    switch (dataType.toLowerCase()) {
        case 'string':
            // TODO: read flag to determine if we should return 'textarea' instead
            return 'text'
        case 'boolean':
            return 'toggle'
        case 'int':
        case 'float':
            return 'number'
        case 'date':
        case 'datetime':
            return 'date'
        case 'email':
            return 'email'
        case 'enumeration':
            return 'select'
        case 'password':
            return 'password'
        case 'file':
        case 'files':
            return 'file'
        case 'json':
            return 'json'
        default:
            return 'text'
    }
}
