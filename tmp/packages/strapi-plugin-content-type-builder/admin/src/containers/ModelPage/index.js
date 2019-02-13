import React, { useState } from 'react'
import { storeData } from '../../utils/storeData'
import ModelPageView from './ModelPageView'
import QueryLoader from 'components/QueryLoader'
import * as queries from '../Form/queries'
import { useMutation } from 'react-apollo-hooks'
import { startCase } from 'lodash'
// TEMP
import { compose } from 'redux'
import { connect } from 'react-redux'
import { createStructuredSelector } from 'reselect'
import selectModelPage from './selectors'
import injectReducer from 'utils/injectReducer'
import reducer from './reducer'

// const modelPageDefaults = {
//     didFetchModel: false,
//     initialModel: {
//       attributes: [],
//     },
//     model: {
//       attributes: [],
//     },
//     postContentTypeSuccess: false,
//     showButtons: false,
//     modelLoading: true,
//     showButtonLoader: false,
// }

const ModelPage = (props) => {
    // console.log('Modelpage', props.modelPage.model);

    const entityDefId = props.match.params.modelName
    // const modelPage = { ...modelPageDefaults }
    const entityDefInLocalStorage = storeData.getContentType()
    // console.log('entityDefInLocalStorage: ', entityDefInLocalStorage);
    // if the entityDef is in localStorage only then it's a new entityDef that we need to create; otherwise it's an update
    const mode = (entityDefInLocalStorage && entityDefInLocalStorage.id === entityDefId ? 'create': 'update')
    const mutationFunc = useMutation(queries[mode + 'EntityDefinition'])
    if (mode === 'create') {
        return <ModelPageView {...props} onSubmit={() => saveChanges(props, mutationFunc, 'create')} />
    }

    //TEMP
    // return <ModelPageView {...props} modelPage={modelPage} />

    return (
        <QueryLoader query={queries.entityDefinition} variables={{ id: entityDefId }} entityDef={props.modelPage.model}>
            {({ data }) => {
                if (!data.entityDef) {
                    throw Error(`Entity definition ID '${entityDefId}' not found on server`)
                }
                const model = addStrapiParams(data.entityDef)
                return (
                    <ModelPageView {...props} entityDefFromGraphqlWithStrapiParams={model} onSubmit={() => saveChanges(props, mutationFunc, 'update')} />
                )
            }}
        </QueryLoader>
    )
}

function addStrapiParams(entityDef) {
  const properties = entityDef.properties.map(prop => ({
    ...prop,
    // TODO: rename `type` to `dataType` to match graphql schema
    type: prop.dataType,
    strapiParams: {}
  }))
  return { ...entityDef, properties }
}

function saveChanges(props, mutationFunc, mode /* 'create' | 'update' */) {
    const data = props.modelPage.model
    const entityDefInput = transformToMutationInput(data)

    const result = mutationFunc({
        variables: {
            entityDef: entityDefInput
        }
    })
    console.log('result: ', result);
    // strapi.notification.error(errorMsg);
}

function transformToMutationInput(entityDefData) {
    const { __typename, ...data } = entityDefData
    const entityDefInput = {
        ...data,
        properties: data.properties.map(prop => ({
            id: prop.id,
            label: startCase(prop.id),
            dataType: prop.type,
            readOnly: false,
        }))
    }
    return entityDefInput
}

//TEMP
const mapStateToProps = createStructuredSelector({
    modelPage: selectModelPage(),
})
const withReducer = injectReducer({ key: 'modelPage', reducer })

export default compose(withReducer, connect(mapStateToProps))(ModelPage)
