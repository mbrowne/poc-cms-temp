import React, { Suspense } from 'react'
import { includes, upperFirst } from 'lodash'
import { useQuery } from 'react-apollo-hooks'
import { entityDefinition as entityDefinitionQuery } from './queries'
import Form from './Form'
import { storeData } from '../../utils/storeData'

// try {
//     await useMutation_fromClassComponent(createEntityDefinitionMutation, {
//         variables: {
//             entityDef
//         },
//         update: (proxy, mutationResult) => {
//             console.log('mutationResult: ', mutationResult);
//             cbSuccess()
//         }
//     })
// }
// catch (e) {
//     console.log('Mutation error: ', e);
//     cbFail(e)
// }

const AddEditEntityDefinition = ({ hash, ...remainingProps }) => {
    const valueToReplace = includes(hash, '#create')
        ? '#create'
        : '#edit'
    const entityDefId = upperFirst((hash.split('::')[0]).replace(valueToReplace, ''))
    // console.log('entityDefId: ', entityDefId);
    const isPopUpAttribute = includes(hash, 'attribute')
    const isCreating = valueToReplace === '#create'

    if (isCreating) {
        return (
            <Form mode="create" hash={hash} showModal={true} {...remainingProps} />
        )
    }
    if (!entityDefId) {
        return null
    }
    return <EditForm hash={hash} id={entityDefId} showModal={true} {...remainingProps} />
}

const EditForm = ({ id, ...remainingProps}) => {
    if (isEditingTempEntityDef(id)) {
        return <Form mode="edit" entityDef={storeData.getContentType()} {...remainingProps} />
    }
    
    return (
        <Suspense fallback={<div>Loading...</div>}>
            {React.createElement(() => {
                const { data, error } = useQuery(entityDefinitionQuery, { variables: { id }})
                if (error) {
                    throw error
                }

                if (!data.entityDef) {
                    throw Error(`Entity definition ID '${id}' not found on server`)
                }
                // console.log('entityDef: ', data.entityDef);

                //TEMP
                // data.entityDef.pluralName = 'TEMP - CHANGE ME'

                return <Form mode="edit" entityDef={data.entityDef} onPersistChanges={handlePersistChanges} {...remainingProps} />
            })}
        </Suspense>
    )
}

function handlePersistChanges(entityDef) {
    console.log('TODO: handlePersistChanges for editing existing entityDef');
    console.log('entityDef: ', entityDef);
}

function isEditingTempEntityDef(entityDefId) {
    return (
        storeData.getIsModelTemporary() &&
        storeData.getContentType().id.toLowerCase() === entityDefId.toLowerCase()
    )
}

export default AddEditEntityDefinition
