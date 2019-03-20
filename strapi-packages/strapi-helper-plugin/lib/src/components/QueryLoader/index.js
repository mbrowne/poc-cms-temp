import React, { Suspense } from 'react'
import { useQuery } from 'react-apollo-hooks'

const QueryLoader = (props) => {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <QueryLoaderInner {...props} />
        </Suspense>
    )
}

const QueryLoaderInner = ({ query, children, ...otherProps }) => {
    const result = useQuery(query, otherProps)
    return result.error ? <ErrorMessage errorObject={result.error} /> : children(result)
}

// @TODO use a shared component for this
const ErrorMessage = ({ errorObject, message }) => {
    return <div className="error">{message || "An error occurred: " + errorObject.message}</div>
}

export default QueryLoader
