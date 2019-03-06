const pluginName = 'entityDefinitionBuilder'

export function getPluginState(globalState) {
    return globalState[pluginName]
}

export const defaultState = {
    [pluginName]: {
        __typename: 'entityDefinitionBuilder',
        unsavedEntityDef: {
            __typename: 'unsavedEntityDef',
            // workaround for Apollo's special treatment of 'id' property: rename to 'business_id'
            business_id: null,
            properties: [],
        },
        entityDefUI: {
            __typename: 'entityDefUI',
            // Not currently used; should be deleted later if we don't end up using it
            showButtonLoader: false,
        },
    },
}
