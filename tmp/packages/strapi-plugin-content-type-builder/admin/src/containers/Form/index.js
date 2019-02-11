import React, { useState } from 'react'
import { includes, isEmpty, replace, split } from 'lodash'
// import Form from './Form'
import AddEditEntityDefinition from './AddEditEntityDefinition'
import AddEditProperty from './AddEditProperty'

const FormRouter = (props) => {
    const [showModal, setShowModal] = useState(false)

    if (!isEmpty(props.hash)) {
        if (!showModal) {
            setShowModal(true)
        }
        // const valueToReplace = includes(props.hash, '#create')
        //     ? '#create'
        //     : '#edit'
        // const entityDefId = replace(
        //     split(props.hash, '::')[0],
        //     valueToReplace,
        //     ''
        // )
        const isPopUpAttribute = includes(props.hash, 'attribute')
        // const isCreating = valueToReplace === '#create'

        return isPopUpAttribute
            ? <AddEditProperty {...props} />
            : <AddEditEntityDefinition showModal={showModal} {...props} /> //<Form showModal={showModal} {...props} />
    }
    else {
        if (showModal) {
            setShowModal(false)
        }
        return null
    }
}

export default FormRouter
