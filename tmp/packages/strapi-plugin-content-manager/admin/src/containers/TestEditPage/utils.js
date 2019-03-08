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
            return 'text'
        default:
            return 'text'
    }
}
