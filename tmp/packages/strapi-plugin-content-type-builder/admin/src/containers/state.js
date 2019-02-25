const pluginName = 'entityDefinitionBuilder'

export function getPluginState(globalState) {
    return globalState[pluginName]
}

export const defaultState = {
    [pluginName]: {
        __typename: 'entityDefinitionBuilder',
        unsavedEntityDef: {
            __typename: 'unsavedEntityDef',
            properties: [],
        },
        entityDefUI: {
            __typename: 'entityDefUI',
            showButtonLoader: false,
        },
    },
}
