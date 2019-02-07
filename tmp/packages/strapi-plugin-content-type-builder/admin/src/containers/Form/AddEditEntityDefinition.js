import React from 'react'
import { includes, upperFirst } from 'lodash'
import QueryLoader from 'components/QueryLoader'
import query from './queries/entityDefinitionQuery'
import Form from './Form'

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
    return <EditForm hash={hash} id={entityDefId} {...remainingProps} />
}

const EditForm = ({ id, ...remainingProps}) => {
    return (
        <QueryLoader query={query} variables={{ id }}>
            {({ data }) => {
                if (!data.entityDef) {
                    throw Error(`Entity definition ID '${id}' not found on server`)
                }
                // console.log('entityDef: ', data.entityDef);

                //TEMP
                data.entityDef.pluralName = 'TEMP - CHANGE ME'

                return <Form mode="edit" entityDef={data.entityDef} {...remainingProps} />
            }}
        </QueryLoader>
    )
}

export default AddEditEntityDefinition
