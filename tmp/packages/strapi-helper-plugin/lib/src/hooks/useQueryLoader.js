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
        // use Suspense to wait until the data is available
        throw loadingPromise
    }
    return result.error ? (
        <ErrorMessage errorObject={result.error} />
    ) : (
        renderCallback(result)
    )
}

// @TODO use a shared component for this
const ErrorMessage = ({ errorObject, message }) => {
    return (
        <div className="error">
            {message || 'An error occurred: ' + errorObject.message}
        </div>
    )
}
