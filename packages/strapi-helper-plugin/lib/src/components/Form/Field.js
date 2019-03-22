import React, { useContext } from 'react'
import { Context } from './context'

export const Field = ({
    name,
    label,
    getFieldValue,
    component: InputComponent,
    ...otherProps
}) => {
    const { formState, onFieldChange } = useContext(Context)
    // console.log('formState: ', formState)
    const inputComponentProps = { name, label, ...otherProps }
    return (
        <InputComponent
            value={formState.values[name] || ''}
            onChange={e => onFieldChange(e)}
            {...inputComponentProps}
        />
    )
}
