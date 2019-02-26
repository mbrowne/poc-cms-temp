import React from 'react'
import { useQueryLoader } from 'hooks/useQueryLoader'
import { connect } from 'react-redux'
import { createStructuredSelector } from 'reselect'
import { FormattedMessage } from 'react-intl'
import { NavLink } from 'react-router-dom'
import { isEmpty, startCase } from 'lodash'
import { makeSelectMenu } from 'containers/App/selectors'
import { getPluginState } from '../state'
import * as queries from '../graphql/queries'
import styles from './styles.scss'
import PluginLeftMenu from 'components/PluginLeftMenu'
import ContentHeader from 'components/ContentHeader'
import EmptyAttributesBlock from 'components/EmptyAttributesBlock'
import List from 'components/List'
import AttributeRow from 'components/AttributeRow'
import NotFoundPage from '../NotFoundPage'

/*
interface EntityDefinitionProps {
    menu: Menu
}

interface Menu {
    name: string
    items: Array<{
        icon: string
        name: string
        source?: string
    }>
}
*/

const EntityDefinition /* : React.SFC<EntityDefinitionProps> */ = ({
    menu,
    match,
    showButtons,
}) => {
    const contentHeaderButtons = [
        {
            label: 'content-type-builder.form.button.cancel',
            handleClick: handleCancelChanges,
            kind: 'secondary',
            type: 'button',
        },
        {
            label: 'content-type-builder.form.button.save',
            handleClick: handleSubmit,
            kind: 'primary',
            type: 'submit',
            id: 'saveData',
        },
    ]

    const helpers = {
        renderCustomLink(leftMenuProps, linkStyles) {
            const { link } = leftMenuProps
            if (link.name === 'button.contentType.add') {
                return helpers.renderAddLink(leftMenuProps, linkStyles)
            }

            const linkName = link.source
                ? `${link.name}&source=${link.source}`
                : link.name
            const temporary =
                link.isTemporary ||
                (showButtons && linkName === match.params.id) ? (
                    <FormattedMessage id="content-type-builder.contentType.temporaryDisplay" />
                ) : (
                    ''
                )
            const spanStyle =
                link.isTemporary ||
                (showButtons && linkName === match.params.id) ||
                (isEmpty(temporary) && link.source)
                    ? styles.leftMenuSpan
                    : ''
            const pluginSource =
                isEmpty(temporary) && link.source ? (
                    <FormattedMessage id="content-type-builder.from">
                        {message => (
                            <span style={{ marginRight: '10px' }}>
                                ({message}: {link.source})
                            </span>
                        )}
                    </FormattedMessage>
                ) : (
                    ''
                )

            return (
                <li className={linkStyles.pluginLeftMenuLink}>
                    <NavLink
                        className={linkStyles.link}
                        to={`/plugins/content-type-builder/entity-defs/${
                            link.name
                        }${link.source ? `&source=${link.source}` : ''}`}
                        activeClassName={linkStyles.linkActive}
                    >
                        <div>
                            <i className={`fa fa-caret-square-o-right`} />
                        </div>
                        <div className={styles.contentContainer}>
                            <span className={spanStyle}>
                                {startCase(link.name)}
                            </span>
                            <span
                                style={{
                                    marginLeft: '1rem',
                                    fontStyle: 'italic',
                                }}
                            >
                                {temporary}
                                {pluginSource}
                            </span>
                        </div>
                    </NavLink>
                </li>
            )
        },

        renderAddLink: ({ link }, customLinkStyles) => (
            <li className={customLinkStyles.pluginLeftMenuLink}>
                <div
                    className={`${customLinkStyles.liInnerContainer} ${
                        styles.iconPlus
                    }`}
                    onClick={handleAddLinkClick}
                >
                    <div>
                        <i className={`fa ${link.icon}`} />
                    </div>
                    <span>
                        <FormattedMessage
                            id={`content-type-builder.${link.name}`}
                        />
                    </span>
                </div>
            </li>
        ),

        addCustomSection: sectionStyles => (
            <div className={sectionStyles.pluginLeftMenuSection}>
                <p>
                    <FormattedMessage id="content-type-builder.menu.section.documentation.name" />
                </p>
                <ul>
                    <li>
                        <FormattedMessage id="content-type-builder.menu.section.documentation.guide" />
                        &nbsp;
                        <FormattedMessage id="content-type-builder.menu.section.documentation.guideLink">
                            {message => (
                                <a
                                    href="http://strapi.io/documentation/3.x.x/guides/models.html"
                                    target="_blank"
                                >
                                    {message}
                                </a>
                            )}
                        </FormattedMessage>
                    </li>
                </ul>
            </div>
        ),

        renderListTitle: () => null,

        renderCustomLi: (row, key) => (
            <AttributeRow
                key={key}
                row={row}
                onEditAttribute={handleEditProperty}
                onDelete={handleDeleteProperty}
            />
        ),
    }

    function handleAddLinkClick() {
        // TODO
        // if (storeData.getIsModelTemporary()) {
        //     strapi.notification.info(
        //         'content-type-builder.notification.info.contentType.creating.notSaved'
        //     )
        // } else {
        //     this.toggleModal()
        // }
    }

    function handleSubmit() {}

    function handleCancelChanges() {}

    function handleAddProperty() {}

    function handleEditProperty() {}

    function handleDeleteProperty() {}

    function renderContent(entityDef) {
        return entityDef.properties.length === 0 ? (
            <EmptyAttributesBlock
                title="content-type-builder.home.emptyAttributes.title"
                description="content-type-builder.home.emptyAttributes.description"
                label="content-type-builder.button.attributes.add"
                onClick={handleAddProperty}
                id="openAddAttr"
            />
        ) : (
            <List
                id="propertiesList"
                listContent={entityDef}
                renderCustomListTitle={helpers.renderListTitle}
                listContentMappingKey={'properties'}
                renderCustomLi={helpers.renderCustomLi}
                onButtonClick={handleAddProperty}
            />
        )
    }

    return useQueryLoader(queries.entityDefinition, {
        variables: { id: match.params.id },
    })(({ data }) => {
        const { entityDef } = data
        const { entityDefUI } = getPluginState(data)
        if (!entityDef) {
            return <NotFoundPage />
        }

        // Url to redirect the user if they modify the unsaved entity def ID
        const redirectRoute = match.path.replace('/:id', '')

        const addButtons = true

        // const name = get(storeData.getContentType(), 'id')
        // const addButtons =
        //     (name === this.props.match.params.modelName &&
        //         size(get(storeData.getContentType(), 'properties')) > 0) ||
        //     this.props.modelPage.showButtons

        const contentHeaderDescription =
            entityDef.description ||
            'content-type-builder.modelPage.contentHeader.emptyDescription.description'

        const icoType = match.params.id.includes('&source=') ? '' : 'pencil'

        return (
            <div className={styles.entityDefPage}>
                <div className="container-fluid">
                    <div className="row">
                        <PluginLeftMenu
                            sections={menu}
                            renderCustomLink={helpers.renderCustomLink}
                            addCustomSection={helpers.addCustomSection}
                        />
                        <div className="col-md-9">
                            <div className={styles.componentsContainer}>
                                <ContentHeader
                                    name={entityDef.id}
                                    description={contentHeaderDescription}
                                    icoType={icoType}
                                    editIcon
                                    editPath={`${redirectRoute}/${
                                        match.params.id
                                    }#edit${
                                        match.params.id
                                    }::contentType::baseSettings`}
                                    addButtons={addButtons}
                                    isLoading={entityDefUI.showButtonLoader}
                                    buttonsContent={contentHeaderButtons}
                                />
                                {renderContent(entityDef)}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    })
}

const mapStateToProps = createStructuredSelector({
    menu: makeSelectMenu(),
})

export default connect(mapStateToProps)(EntityDefinition)
