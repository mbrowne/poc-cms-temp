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
                        // Also update raw values immediately so that this works as expected:
                        //   state.foo = 1
                        //   console.log(state.foo)  // should log 1
                        //
                        // @TODO should we be doing this without mutating accessors[RAW_VALUES]?
                        accessors[RAW_VALUES][key] = newVal
                    },
                },
                // Make explicit set methods as well so React's callback API
                // (e.g. `setFoo(oldState => { ... return newState })`)
                // is also available
                ['set' + camelCase(key)]: {
                    value: newValOrCallback => {
                        setRawValues(currentValues => {
                            // TODO
                            // Question: Should we support both functions and actual values as we're doing here?
                            // We already have the `state.foo = ...` API for using actual values so this might be redundant.
                            // On the other hand, React users might expect it to work both ways.
                            const newVal =
                                typeof newValOrCallback === 'function'
                                    ? newValOrCallback(currentValues[key])
                                    : newValOrCallback
                            return {
                                ...accessors,
                                [key]: newVal,
                            }
                        })
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
