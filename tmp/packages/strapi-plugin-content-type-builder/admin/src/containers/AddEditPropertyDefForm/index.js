import React from 'react'

const AddEditPropertyDefForm = ({ match }) => {
    console.log('match: ', match)
    return 'property form'
}

// redirectAfterSave: (shouldOpenPropertiesModal = false) => {
//     const entityDefId = formState.values.id
//     console.log('TODO: redirect to property edit')
//     history.push(redirectRoute)
//     // const path = shouldOpenPropertiesModal ? '#choose::attributes' : '';
//     // history.push(`${redirectRoute}/${entityDefId}${path}`);
// },

export default AddEditPropertyDefForm
