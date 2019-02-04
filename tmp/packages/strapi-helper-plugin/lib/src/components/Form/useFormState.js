import { useState } from 'react'

// Custom hook for form state
export function useFormState(initialValues = {}) {
    const [formState, setFormState] = useState({
        initialValues,
        values: initialValues
    })
    function setValues(values) {
        setFormState(prevState => ({
            ...prevState,
            values: {
                ...prevState.values,
                ...values
            }
        }))
    }
    return { formState, setFormState: setValues }
}
