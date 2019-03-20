import React, { Suspense } from 'react'
import { useQuery } from 'react-apollo-hooks'

export function useQueryLoader(query, options) {
    let result = {}
    let loadingPromise
    try {
        result = useQuery(query, options)
    } catch (promise) {
        loadingPromise = promise
    }
    return renderCallback => (
        <Suspense fallback={<div>Loading...</div>}>
            <QueryLoader
                result={result}
                loadingPromise={loadingPromise}
                renderCallback={renderCallback}
            />
        </Suspense>
    )
}

const QueryLoader = ({ result, loadingPromise, renderCallback }) => {
    if (loadingPromise) {
        // @TODO figure out how to handle the case where the promise resolves to an error,
        // e.g. an Apollo network error
        //
        // use Suspense to wait until the data is available
        throw loadingPromise
    }
    if (result.error) {
        if (process.env.NODE_ENV !== 'production') {
            console.error('Apollo error: ', result.error)
        }
        return <ErrorMessage errorObject={result.error} />
    }
    return renderCallback(result)
}

// @TODO use a shared component for this
const ErrorMessage = ({ errorObject, message }) => {
    return (
        <div className="error">
            {message || 'An error occurred: ' + errorObject.message}
        </div>
    )
}
