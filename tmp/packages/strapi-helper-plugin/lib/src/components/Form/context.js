import React from 'react'
import { useFormState } from './useFormState'

// export const {
//     Provider: FormStateProvider,
//     Consumer: FormStateConsumer,
// } = React.createContext()

// @TODO we might not want to export this externally if we keep this implementation,
// since Context.Provider != FormStateProvider
export const Context = React.createContext()

export const FormStateProvider = ({ initialValues, children }) => {
    const { formState, setFormState } = useFormState(initialValues)
    const ctx = {
        formState,
        setFormState,
        // @TODO it might make more sense for this to be moved to the Field component
        // (but I'm not sure yet)
        onFieldChange: (event, change) =>
            handleChange(event, change, setFormState),
    }
    return <Context.Provider value={ctx}>{children}</Context.Provider>
}

function handleChange(event, change, setFormState) {
    if (!change) {
        // @TODO make this more robust, to handle checkboxes, etc.
        // if second argument wasn't provided, we assume it's a built-in React
        // input change event handler
        const { target } = event
        change = {
            fieldName: target.name,
            value: target.value,
        }
    }
    const { fieldName, value } = change
    setFormState({ [fieldName]: value })
}

export const FormStateConsumer = Context.Consumer

// HOC useful for directly accessing form state from class components
export function withFormState(OrigComponent) {
    return props => (
        <FormStateConsumer>
            {ctx => <OrigComponent {...props} {...ctx} />}
        </FormStateConsumer>
    )
}
