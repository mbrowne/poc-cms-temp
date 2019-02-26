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

const AddEditEntityDefForm = ({ match: { params } }) => {
    // Get route params specific to this modal window
    const id = params.modal_entityDefId
    const mode = params.modal_mode
    if (mode !== 'create' && mode !== 'edit') {
        throw Error(`Unrecognized 'mode': ${mode}`)
    }

    return useLoadOrCreateEntityDef(mode, id)(({ data }) => {
        const { entityDef } = data
        if (!entityDef) {
            throw Error(`Entity definition ID '${id} not found`)
        }

        return <div>{/* <PopUpForm isOpen={true} /> */}</div>
    })
}

export default AddEditEntityDefForm
