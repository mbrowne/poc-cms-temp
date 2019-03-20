import React from 'react'
import { FormStateProvider, FormStateConsumer } from './context'

const Form = ({
    component = 'form',
    initialValues = {},
    onSubmit,
    children
}) => {
    const ChildFormComponent = component
    return (
        <FormStateProvider initialValues={initialValues}>
            <FormStateConsumer>
                {({ formState }) => (
                    <ChildFormComponent
                        onSubmit={e => {
                            e.preventDefault()
                            onSubmit(formState.values, e)
                        }}
                    >
                        {children}
                    </ChildFormComponent>
                )}
            </FormStateConsumer>
        </FormStateProvider>
    )
}

export default Form
