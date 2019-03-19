/*
 *
 * HomePage
 *
 */

import React from 'react'
import Helmet from 'react-helmet'
import PropTypes from 'prop-types'
import { useApolloClient } from 'react-apollo-hooks'
import { useQueryLoader } from 'hooks'
import * as queries from '../../graphql/queries'

// Design
import ContentHeader from 'components/ContentHeader'
import EmptyContentTypeView from 'components/EmptyContentTypeView'
import TableList from 'components/TableList'

import styles from './styles.scss'

const HomePage = props => {
    const client = useApolloClient()
    const { entityDefinitionBuilder } = client.readQuery({
        query: queries.unsavedEntityDef,
    })
    const {
        businessId,
        ...unsavedEntityDef
    } = entityDefinitionBuilder.unsavedEntityDef

    // Workaround for Apollo's special treatment of `id` property
    unsavedEntityDef.id = businessId

    return useQueryLoader(queries.entityDefinitions)(({ data }) => {
        const entityDefs = [...data.entityDefs.results]
        if (unsavedEntityDef.id) {
            unsavedEntityDef.isUnsaved = true
            unsavedEntityDef.propertiesCount =
                unsavedEntityDef.properties.length
            entityDefs.push(unsavedEntityDef)
        }
        return <HomePageView {...props} entityDefs={entityDefs} />
    })
}

const HomePageView = ({ history, entityDefs }) => {
    const helpers = {
        renderTableListComponent: () => {
            const availableNumber = entityDefs.length
            const title =
                availableNumber > 1
                    ? 'content-type-builder.table.contentType.title.plural'
                    : 'content-type-builder.table.contentType.title.singular'
            return (
                <TableList
                    availableNumber={availableNumber}
                    title={title}
                    buttonLabel="content-type-builder.button.contentType.add"
                    onButtonClick={handleAddEntityDef}
                    onHandleDelete={handleDelete}
                    rowItems={entityDefs}
                />
            )
        },
    }

    function handleDelete(entityDefId) {
        // TODO
        alert('Delete is not yet implemented')
    }

    function handleAddEntityDef() {
        // this implementation might change
        const {
            entityDefinitionBuilder: { unsavedEntityDef },
        } = client.readQuery({ query: queries.unsavedEntityDef })
        const hasUnsavedEntityDef = Boolean(unsavedEntityDef.businessId)

        if (hasUnsavedEntityDef) {
            // Ask user to save already-started entity definition before creating another one
            strapi.notification.info(
                'content-type-builder.notification.info.contentType.creating.notSaved'
            )
        } else {
            history.push(`/plugins/content-type-builder/(base-settings/create)`)
        }
    }

    const client = useApolloClient()

    const component = entityDefs.length ? (
        helpers.renderTableListComponent()
    ) : (
        <EmptyContentTypeView handleButtonClick={handleAddEntityDef} />
    )

    return (
        <div className={styles.homePage}>
            <Helmet
                title="HomePage"
                meta={[
                    {
                        name: 'description',
                        content: 'Description of HomePage',
                    },
                ]}
            />
            <ContentHeader
                name="content-type-builder.home.contentTypeBuilder.name"
                description="content-type-builder.home.contentTypeBuilder.description"
                styles={{ margin: '-1px 0 3rem 0' }}
            />
            {component}
        </div>
    )
}

export default HomePage
