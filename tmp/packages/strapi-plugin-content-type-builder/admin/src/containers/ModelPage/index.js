import React from 'react'
import { storeData } from '../../utils/storeData'
import ModelPageView from './ModelPageView'
import QueryLoader from 'components/QueryLoader'
import entityDefinitionQuery from '../Form/queries/entityDefinitionQuery'
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
    const entityDefId = props.match.params.modelName
    // const modelPage = { ...modelPageDefaults }
    const { modelPage } = props
    const entityDefInLocalStorage = storeData.getContentType()
    // console.log('entityDefInLocalStorage: ', entityDefInLocalStorage);
    if (entityDefInLocalStorage && entityDefInLocalStorage.id === entityDefId) {
        modelPage.model = entityDefInLocalStorage
        // TEMP
        modelPage.model.attributes = []
        return <ModelPageView {...props} modelPage={modelPage} />
    }
    return (
        <QueryLoader query={entityDefinitionQuery} variables={{ id: entityDefId }}>
            {({ data }) => {
                if (!data.entityDef) {
                    throw Error(`Entity definition ID '${entityDefId}' not found on server`)
                }
                modelPage.model = data.entityDef
                return <ModelPageView {...props} modelPage={modelPage} />
            }}
        </QueryLoader>
    )
}

//TEMP
const mapStateToProps = createStructuredSelector({
    modelPage: selectModelPage(),
})
const withReducer = injectReducer({ key: 'modelPage', reducer })

export default compose(withReducer, connect(mapStateToProps))(ModelPage)
