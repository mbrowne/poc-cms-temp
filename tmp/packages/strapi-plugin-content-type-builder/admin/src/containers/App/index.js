/**
 *
 * This component is the skeleton around the actual pages, and should only
 * contain code that should be seen on all pages. (e.g. navigation bar)
 *
 */

import React from 'react'
import { connect } from 'react-redux'
import { bindActionCreators, compose } from 'redux'
// import { withRouter } from 'react-router';
import { createStructuredSelector } from 'reselect'
import { Switch, Route, withRouter } from 'react-router-dom'
import PropTypes from 'prop-types'
import { pluginId } from 'app'

import HomePage from 'containers/HomePage'
import EntityDefinitionPage from 'containers/EntityDefinition'
import AddEditEntityDefForm from 'containers/AddEditEntityDefForm'
import ChoosePropertyTypeForm from 'containers/ChoosePropertyTypeForm'
import AddEditPropertyDefForm from 'containers/AddEditPropertyDefForm'
import NotFoundPage from 'containers/NotFoundPage'

// Utils
import injectSaga from 'utils/injectSaga'
// import { storeData } from '../../utils/storeData'

import styles from './styles.scss'
import { modelsFetch } from './actions'
import saga from './sagas'

import { useApolloClient } from 'react-apollo-hooks'
import { defaultState } from '../state'

/* eslint-disable consistent-return */
class App extends React.Component {
    componentDidMount() {
        this.props.modelsFetch()
    }

    componentWillReceiveProps(nextProps) {
        if (
            nextProps.shouldRefetchContentType !==
            this.props.shouldRefetchContentType
        ) {
            this.props.modelsFetch()
        }
    }

    // componentWillUnmount() {
    //     // Empty the app localStorage
    //     storeData.clearAppStorage()
    // }

    render() {
        return (
            <div className={`${pluginId} ${styles.app}`}>
                <InitApolloState />
                <Switch>
                    <Route
                        path="/plugins/content-type-builder/entity-defs/:id"
                        render={props => (
                            <SubRouter
                                component={EntityDefinitionPage}
                                {...props}
                            />
                        )}
                    />
                    <Route
                        path="/plugins/content-type-builder"
                        render={props => (
                            <SubRouter component={HomePage} {...props} />
                        )}
                    />
                    {/* <Route
                        exact
                        path="/plugins/content-type-builder/models/:modelName"
                        component={ModelPage}
                    /> */}
                    <Route path="" component={NotFoundPage} />
                </Switch>
            </div>
        )
    }
}

// This sub-router uses the auxiliary routing convention described in this article:
// https://itnext.io/auxiliary-routing-with-react-e0a4eee36122
//
// This allows for maximum flexibility for routes that open modal windows; it makes it possible
// to have URLs that open a given modal window on top of any base route. This might or
// might not actually be needed, but aside from syntax (parentheses instead of #),
// it essentially does the same thing that Strapi's official content-type-builder plugin does with
// its hash-based routes, so I'm implementing it here to stay consistent with the Strapi approach.
function SubRouter({ component: Component, ...props }) {
    const basePath = props.match.url
    // :modal_formType      should be either 'baseSettings' or 'advancedSettings'
    // :modal_mode          should be either 'create' or 'edit'

    // return (
    //     <React.Fragment>
    //         <Route
    //             path={`${basePath}/\\(:modal_formType/:modal_mode\\)`}
    //             render={props => (
    //                 <AddEditEntityDefForm {...props} basePath={basePath} />
    //             )}
    //         />
    //         <Route
    //             path={`${basePath}/\\(:modal_formType/:modal_mode/:modal_entityDefId\\)`}
    //             render={props => (
    //                 <AddEditEntityDefForm {...props} basePath={basePath} />
    //             )}
    //         />
    //         <Route
    //             path={`${basePath}/\\(choose-property-type/:modal_entityDefId\\)`}
    //             render={props => (
    //                 <ChoosePropertyTypeForm {...props} basePath={basePath} />
    //             )}
    //         />
    //         <Route
    //             path={`${basePath}/\\(property/:modal_mode/:modal_entityDefId\\)`}
    //             render={props => (
    //                 <AddEditPropertyDefForm {...props} basePath={basePath} />
    //             )}
    //         />
    //         <Route
    //             // Note: This route is only valid for editing existing properties ('edit' mode), not creating new ones
    //             path={`${basePath}/\\(property/:modal_mode/:modal_entityDefId/:modal_propertyId\\)`}
    //             render={props => (
    //                 <AddEditPropertyDefForm {...props} basePath={basePath} />
    //             )}
    //         />
    //         <Component {...props} />
    //     </React.Fragment>
    // )

    return (
        <React.Fragment>
            <Route
                path={`${basePath}/\\(:modal_formType/:modal_mode/:modal_entityDefId\\)`}
                render={props => (
                    <React.Fragment>
                        <Route
                            path={`${basePath}/\\(choose-property-type/:modal_entityDefId\\)`}
                            render={props => (
                                <ChoosePropertyTypeForm
                                    {...props}
                                    basePath={basePath}
                                />
                            )}
                        />
                        <Route
                            path=""
                            render={() => {
                                console.log('test')
                                return <div>test</div>
                            }}
                            // render={props => (
                            //     <AddEditEntityDefForm
                            //         {...props}
                            //         basePath={basePath}
                            //     />
                            // )}
                        />
                    </React.Fragment>
                )}
            />
            <Route
                path={`${basePath}/\\(:modal_formType/:modal_mode\\)`}
                render={props => (
                    <AddEditEntityDefForm {...props} basePath={basePath} />
                )}
            />
            <Route
                path={`${basePath}/\\(property/:modal_mode/:modal_entityDefId\\)`}
                render={props => (
                    <AddEditPropertyDefForm {...props} basePath={basePath} />
                )}
            />
            <Route
                // Note: This route is only valid for editing existing properties ('edit' mode), not creating new ones
                path={`${basePath}/\\(property/:modal_mode/:modal_entityDefId/:modal_propertyId\\)`}
                render={props => (
                    <AddEditPropertyDefForm {...props} basePath={basePath} />
                )}
            />
            <Component {...props} />
        </React.Fragment>
    )
}

// Initialize Apollo local state
const InitApolloState = () => {
    const client = useApolloClient()

    client.cache.writeData({
        data: defaultState,
    })
    return null
}

App.contextTypes = {
    plugins: PropTypes.object,
    router: PropTypes.object.isRequired,
    updatePlugin: PropTypes.func,
}

App.propTypes = {
    modelsFetch: PropTypes.func.isRequired,
    shouldRefetchContentType: PropTypes.bool,
}

App.defaultProps = {
    shouldRefetchContentType: false,
}

export function mapDispatchToProps(dispatch) {
    return bindActionCreators(
        {
            modelsFetch,
        },
        dispatch
    )
}

// makeSelectShouldRefetchContentType

const withConnect = connect(
    null,
    mapDispatchToProps
)
const withSaga = injectSaga({ key: 'global', saga })
// const withFormReducer = injectReducer({ key: 'form', reducer: formReducer })
// const withFormSaga = injectSaga({ key: 'form', saga: formSaga })
export default compose(
    // withFormReducer,
    // withFormSaga,
    withSaga,
    withRouter,
    withConnect
)(App)
