import React from 'react'
import cn from 'classnames'
import {
    capitalize,
    findIndex,
    get,
    isUndefined,
    toInteger,
    upperFirst,
} from 'lodash'
import { useQueryLoader } from 'hooks'

// You can find these components in either
// ./node_modules/strapi-helper-plugin/lib/src
// or strapi/packages/strapi-helper-plugin/lib/src
import PageFooter from 'components/PageFooter'
import PluginHeader from 'components/PluginHeader'
import PopUpWarning from 'components/PopUpWarning'
import InputCheckbox from 'components/InputCheckbox'
// Components from the plugin itself
import AddFilterCTA from 'components/AddFilterCTA'
import FiltersPickWrapper from 'components/FiltersPickWrapper/Loadable'
import Filter from 'components/Filter/Loadable'
import Search from 'components/Search'
import Table from 'components/Table'

import * as queries from '../../graphql/queries'
import styles from './styles.scss'
import Div from '../ListPage/Div'

import { convertEntityResults } from '../../utils/convertEntityResults'

const ListPage = ({ match, history, location }) => {
    // TEMP
    match.params.entityDefId = 'Tag'
    const entityDefId = 'Tag'

    const where = {
        entityDefId,
    }
    return useQueryLoader(queries.entities, {
        variables: { entityDefId, where },
    })(({ data }) => {
        const { entityDef } = data
        // const { totalCount, results: entities } = data.entities
        const { totalCount } = data.entities
        const entities = convertEntityResults([
            {
                id: 'abcd1234',
                state: [
                    {
                        propertyId: 'businessId',
                        value: {
                            __typename: 'LiteralPropertyValue',
                            value: 'pop-art',
                        },
                    },
                    {
                        propertyId: 'displayName',
                        value: {
                            __typename: 'LiteralPropertyValue',
                            value: 'Pop Art',
                        },
                    },
                ],
            },
        ])
        console.log('totalCount: ', totalCount)
        console.log('entities: ', entities)
        console.log('entityDef: ', entityDef)

        const helpers = {
            renderPluginHeader: () => {
                const pluginHeaderActions = [
                    {
                        id: 'addEntry',
                        label: 'content-manager.containers.List.addAnEntry',
                        labelValues: {
                            entity: entityDefId || 'Content Manager',
                        },
                        kind: 'primaryAddShape',
                        onClick: () =>
                            history.push({
                                pathname: `${location.pathname}/create`,
                                // search: this.generateRedirectURI(),
                            }),
                    },
                ]

                const showLoaders = false // @TODO
                return (
                    <PluginHeader
                        actions={pluginHeaderActions}
                        description={{
                            id:
                                totalCount > 1
                                    ? 'content-manager.containers.List.pluginHeaderDescription'
                                    : 'content-manager.containers.List.pluginHeaderDescription.singular',
                            values: {
                                label: totalCount,
                            },
                        }}
                        title={{
                            id: entityDefId || 'Content Manager',
                        }}
                        withDescriptionAnim={showLoaders}
                    />
                )
            },

            // TODO
            areAllEntriesSelected: () => false,
            generateRedirectURI: () =>
                `?redirectUrl=/plugins/content-manager/${entityDefId}`,
        }

        function handleRequestDelete() {}

        function handleChangeSort() {}

        function handleClickSelectAll() {}

        function handleClickSelect() {}

        function handleToggleDeleteAll() {}

        const tableHeaders =
            entityDef.adminUiSettings.propertiesToShowOnListScreen
        const showLoaders = false

        return (
            <div className={cn('container-fluid', styles.containerFluid)}>
                <h1>test</h1>
                {/* {helpers.showSearch() && (
                    <Search
                        changeParams={this.props.changeParams}
                        initValue={
                            getQueryParameters(
                                this.props.location.search,
                                '_q'
                            ) || ''
                        }
                        model={this.getCurrentModelName()}
                        value={params._q}
                    />
                )} */}
                {helpers.renderPluginHeader()}

                <div className={cn(styles.wrapper)}>
                    {/* {helpers.showFilters() && <div>TODO: Filters</div>} */}
                    <div className={cn('row', styles.row)}>
                        <div className="col-md-12">
                            <Table
                                deleteAllValue={helpers.areAllEntriesSelected()}
                                entriesToDelete={[]}
                                enableBulkActions={false}
                                filters={[]}
                                handleDelete={handleRequestDelete}
                                headers={tableHeaders}
                                history={history}
                                onChangeSort={handleChangeSort}
                                onClickSelectAll={handleClickSelectAll}
                                onClickSelect={handleClickSelect}
                                onToggleDeleteAll={handleToggleDeleteAll}
                                primaryKey={'id'}
                                records={entities}
                                redirectUrl={helpers.generateRedirectURI()}
                                route={match}
                                routeParams={match.params}
                                // search={params._q}
                                showLoader={showLoaders}
                                sort={''}
                            />
                        </div>
                    </div>
                </div>
            </div>
        )
    })
}

export default ListPage
