import React from 'react'

const ChoosePropertyTypeForm = ({ match }) => {
    // Get route params specific to this modal window
    const entityDefId = match.params.modal_entityDefId
    console.log('entityDefId: ', entityDefId)

    console.log('match: ', match)
    return 'choose property type'
}

export default ChoosePropertyTypeForm
