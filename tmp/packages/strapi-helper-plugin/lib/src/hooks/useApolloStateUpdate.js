import { useApolloClient } from 'react-apollo-hooks'
const shallowEqual = require('fbjs/lib/shallowEqual')

export const config = {
    // If true, @client state will be stored in localStorage and restored on app startup
    persistClientState: true,
    persistDebounceInterval: 1000,
    // Adding '-custom' suffix since we're not using the official apollo-cache-persist package,
    // but hopefully the official package will support our use case (https://github.com/apollographql/apollo-client/issues/4469)
    // in the future.
    storageKey: 'apollo-cache-persist-custom',
}

const { storageKey } = config
let timeout

/**
 * Hook for using Apollo local state
 *
 * @param {string} statePath  The path to a slice of state relative to the root.
 *  Nested paths should be dot-separated.
 */
export function useApolloStateUpdate(statePath) {
    const client = useApolloClient()
    const { cache } = client
    return updates => {
        const rawCacheData = cache.extract()
        // console.log('rawCacheData: ', rawCacheData)

        // Convert dot-separated path to an empty object / nested empty objects,
        // since the client.writeData() method expects an object.
        const stateUpdates = {}
        let nestedObj = stateUpdates
        const parts = statePath.split('.')
        const rootLevelKey = parts.shift()

        for (const key of parts) {
            nestedObj[key] = {}
            nestedObj = nestedObj[key]
        }
        // This is the object we actually want to update
        // @TODO might need to generate a __typename here in the case of objects that don't exist yet
        const currentStateToUpdate =
            rawCacheData['$ROOT_QUERY.' + statePath] || {}
        nestedObj.__typename = currentStateToUpdate.__typename

        Object.assign(nestedObj, updates)

        // Apollo requires a __typename on the top-level object as well (even though we're not changing it)
        stateUpdates.__typename =
            rawCacheData['$ROOT_QUERY.' + rootLevelKey].__typename

        const oldRawCacheData = rawCacheData
        client.writeData({
            data: {
                [rootLevelKey]: stateUpdates,
            },
        })

        if (config.persistClientState) {
            const oldCacheData = JSON.parse(JSON.stringify(oldRawCacheData))
            if (timeout != null) {
                clearTimeout(timeout)
            }
            timeout = setTimeout(() => {
                storeClientState(cache, oldCacheData)
            }, config.persistDebounceInterval)
        }
    }
}

export function restoreApolloClientState(client, defaultState) {
    const { cache } = client
    const json = localStorage.getItem(storageKey)
    if (json) {
        // console.log('savedState: ', JSON.parse(json))
        cache.restore(JSON.parse(json))
    } else {
        cache.writeData({
            data: defaultState,
        })
    }
}

function storeClientState(cache, prevCacheData) {
    const json = localStorage.getItem(storageKey)
    const currentStorageState = json ? JSON.parse(json) : {}

    // This is hacky but it works...apollo-client doesn't currently give us any way to differentiate between
    // @client state and server-derived state in the cache (nor a way to check for a custom directive when
    // using @client state) — see https://github.com/apollographql/apollo-client/issues/4469
    // and https://github.com/apollographql/apollo-client/issues/4476.
    //
    // So as a workaround, we compare the state of the cache before and after updating it to determine
    // which parts were affected by our client.writeData() call. The changed parts are the client state
    // and we assume that anything else doesn't need to be persisted to localStorage.
    const newCacheData = cache.extract()
    const objsToPersist = {}
    const changedKeys = []
    for (const key in newCacheData) {
        if (key === 'ROOT_QUERY') {
            continue
        }
        if (
            !shallowEqual(newCacheData[key], prevCacheData[key]) ||
            // Also persist unchanged nested objects belonging to objects we already
            // know we need to persist (otherwise we'd lose any unchanged the nested objects)
            changedKeys.some(k => key.startsWith(k))
        ) {
            objsToPersist[key] = newCacheData[key]
            changedKeys.push(key)
        }
    }
    const prefixLen = '$ROOT_QUERY.'.length
    const unprefixedChangedKeys = new Set(
        changedKeys.map(key => key.substring(prefixLen))
    )
    const rootQueryDataToPersist = {}
    const { ROOT_QUERY } = newCacheData
    for (const key in ROOT_QUERY) {
        if (unprefixedChangedKeys.has(key)) {
            rootQueryDataToPersist[key] = ROOT_QUERY[key]
        }
    }

    const updatedStorageState = {
        ...currentStorageState,
        ...objsToPersist,
        ROOT_QUERY: rootQueryDataToPersist,
    }
    localStorage.setItem(storageKey, JSON.stringify(updatedStorageState))
}
