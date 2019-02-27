import React from 'react'
import { useQueryLoader } from 'hooks/useQueryLoader'
import { entityDefinition as entityDefinitionQuery } from '../graphql/queries'
import PopUpForm from 'components/PopUpForm'

import formConfig from './form.json'

class EntityDefinition {
    id
    label
    pluralLabel
    isAbstract = false
    properties = []
}

function useLoadOrCreateEntityDef(mode, entityDefId) {
    return mode === 'edit'
        ? useQueryLoader(entityDefinitionQuery, {
              variables: { id: entityDefId },
          })
        : renderContent =>
              renderContent({ data: { entityDef: new EntityDefinition() } })
}

// const AddEditEntityDefForm = ({ match: { params } }, history }) => {
const AddEditEntityDefForm = props => {
    console.log('props: ', props)
    const {
        match: { params },
        history,
    } = props
    // Get route params specific to this modal window
    const id = params.modal_entityDefId
    const mode = params.modal_mode
    if (mode !== 'create' && mode !== 'edit') {
        throw Error(`Unrecognized 'mode': ${mode}`)
    }

    function handleRequestCloseModal() {}

    return useLoadOrCreateEntityDef(mode, id)(({ data }) => {
        const { entityDef } = data
        if (!entityDef) {
            throw Error(`Entity definition ID '${id} not found`)
        }

        return (
            <PopUpForm
                isOpen={true}
                // since isOpen is always true, we know that the toggle callback will always be a request
                // to close the modal (not open it)
                toggle={handleRequestCloseModal}
            />
        )
    })
}

export default AddEditEntityDefForm
