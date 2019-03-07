import { useState } from 'react'
import invariant from 'invariant'

const RAW_VALUES = Symbol('RAW_VALUES')

export function useConvenientState(initialState) {
    invariant(
        typeof initialState === 'object',
        'useConvenientState() only works with objects'
    )
    const [rawValues, setRawValues] = useState(initialState)
    const [accessors] = useState({})

    if (!accessors[RAW_VALUES]) {
        for (const key of Object.keys(initialState)) {
            Object.defineProperties(accessors, {
                [key]: {
                    enumerable: true,
                    get: () => accessors[RAW_VALUES][key],
                    set: newVal => {
                        // console.log('updating to ', newVal)
                        setRawValues({
                            ...accessors,
                            [key]: newVal,
                        })
                    },
                },
                // Make explicit set methods as well so React's callback API
                // (e.g. `setFoo(oldState => { ... return newState })`)
                // is also available
                ['set' + camelCase(key)]: {
                    value: callback => {
                        setRawValues(currentValues => ({
                            ...accessors,
                            [key]: callback(currentValues[key]),
                        }))
                    },
                },
            })
        }
    }

    accessors[RAW_VALUES] = rawValues
    return accessors
}

function camelCase(str) {
    return str[0].toUpperCase() + str.substring(1)
}
