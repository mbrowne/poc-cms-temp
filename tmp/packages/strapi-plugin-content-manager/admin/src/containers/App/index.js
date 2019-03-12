/**
 *
 * This component is the skeleton around the actual pages, and should only
 * contain code that should be seen on all pages. (e.g. navigation bar)
 *
 */

import React, { Suspense } from 'react'
import PropTypes from 'prop-types'
import { Switch, Route } from 'react-router-dom'
import { useQuery } from 'react-apollo-hooks'
import gql from 'graphql-tag'

import getQueryParameters from 'utils/getQueryParameters'

import EditPage from 'containers/EditPage'
import ListPage from 'containers/ListPage'
import SettingsPage from 'containers/SettingsPage'
import SettingPage from 'containers/SettingPage'
import LoadingIndicatorPage from 'components/LoadingIndicatorPage'
import EmptyAttributesView from 'components/EmptyAttributesView'

// import StrapiOrig_ListPage from 'containers/StrapiOrig_ListPage'
// import StrapiOrig_EditPage from 'containers/StrapiOrig_EditPage'

const entityDefsQuery = gql`
    {
        entityDefinitions {
            results {
                id
                propertiesCount
            }
        }
    }
`

const App = props => {
    // There seems to be some bug in react-apollo-hooks or apollo-client involving the cache...
    // because we're doing a query for entityDefinitions in bootstrap.js before this one runs,
    // using suspense breaks for some reason if we request a field that wasn't already requested
    // (e.g. propertiesCount above). So disabling suspense for this component for now...
    const { data, error, loading } = useQuery(entityDefsQuery, {
        suspend: false,
    })
    if (loading) {
        return <LoadingIndicatorPage />
    }
    return <AppView {...props} data={data} error={error} />

    // const { data, error } = useQuery(entityDefsQuery)
    // return (
    //     <Suspense fallback={<LoadingIndicatorPage />}>
    //         <AppView {...props} data={data} error={error} />
    //     </Suspense>
    // )
}

const AppView = ({ location, history, data, error }) => {
    if (error) {
        console.log('error: ', error)
        console.error('Apollo error: ', error)
        strapi.notification.error('Error fetching entity definitions: ' + error)
        return null
    }

    const currentEntityDefId = location.pathname.split('/')[3]
    const currentEntityDef = data.entityDefinitions.results.find(
        def => def.id === currentEntityDefId
    )
    const source = getQueryParameters(location.search, 'source')

    if (
        currentEntityDefId &&
        source &&
        currentEntityDef &&
        currentEntityDef.propertiesCount === 0
    ) {
        return (
            <EmptyAttributesView
                currentModelName={currentEntityDefId}
                history={history}
                modelEntries={0}
            />
        )
    }

    return (
        <div className="content-manager">
            <Switch>
                <Route
                    path="/plugins/content-manager/ctm-configurations/:slug/:source?/:endPoint?"
                    component={SettingPage}
                />
                <Route
                    path="/plugins/content-manager/ctm-configurations"
                    component={SettingsPage}
                />
                <Route
                    path="/plugins/content-manager/:entityDefId/:entityId"
                    component={EditPage}
                />
                <Route
                    path="/plugins/content-manager/:entityDefId"
                    component={ListPage}
                />
                {/* <Route
                    path="/plugins/content-manager/:slug/:id"
                    component={StrapiOrig_EditPage}
                />
                <Route
                    path="/plugins/content-manager/:slug"
                    component={StrapiOrig_ListPage}
                /> */}
            </Switch>
        </div>
    )
}

App.propTypes = {
    history: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired,
}

export default App
