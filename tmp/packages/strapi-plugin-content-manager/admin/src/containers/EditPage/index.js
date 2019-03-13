import React from 'react'
import moment from 'moment'
import cn from 'classnames'
import { get, isObject, toNumber } from 'lodash'
import { useMutation } from 'react-apollo-hooks'

// You can find these components in either
// ./node_modules/strapi-helper-plugin/lib/src
// or strapi/packages/strapi-helper-plugin/lib/src
import BackHeader from 'components/BackHeader'
import EmptyAttributesBlock from 'components/EmptyAttributesBlock'
import LoadingIndicator from 'components/LoadingIndicator'
import PluginHeader from 'components/PluginHeader'
import PopUpWarning from 'components/PopUpWarning'
// Plugin's components
import CustomDragLayer from 'components/CustomDragLayer'
import Edit from 'components/Edit'
import EditAssociation from 'components/EditAssociation'

import { useQueryLoader, useConvenientState, useFormState } from 'hooks'
import getQueryParameters from 'utils/getQueryParameters'
import styles from './styles.scss'
import { convertEntityDefResult } from '../../utils/convertEntityDefResults'
import { convertEntityResult } from '../../utils/convertEntityResults'
import { newEntity } from '../../utils/newEntity'
import { getLayout } from './utils'
import { editPageQuery } from './query'
import * as mutations from './mutations'
import { entities as entitiesQuery } from '../../graphql/queries'
import { useDeleteEntityRequest } from '../../local-hooks'

const labels = {
    createFormHeading: 'New Entry',
}

const EditPage = props => {
    const {
        match: { params },
    } = props
    const { entityDefId, entityId } = params
    const mode = entityId === 'create' ? 'create' : 'edit'

    return useQueryLoader(editPageQuery, {
        variables: { entityDefId, entityId, isEditMode: mode === 'edit' },
    })(({ data }) =>
        renderEditPage({
            ...props,
            data,
            mode,
            entityDefId,
        })
    )
}

function renderEditPage({ data, mode, history, location, entityDefId }) {
    const entityDef = convertEntityDefResult(data.entityDef)
    const { propertiesToShowOnEditForm } = entityDef.adminUiSettings
    // const { propertiesToShowOnEditForm } = convertAdminUiSettings(entityDef.adminUiSettings)
    // console.log('entityDef: ', entityDef)

    let entity
    if (mode === 'create') {
        entity = newEntity(entityDef)
        // // TEMP
        // entity.state = {
        //     businessId: 'pop-art',
        //     displayName: 'Pop Art',
        // }
    } else {
        entity = convertEntityResult(data.entity)
        // console.log('entity: ', entity)
        if (!entity.state.businessId) {
            throw Error(`Missing businessId for entity ID '${entity.id}'`)
        }
    }

    const state = useConvenientState({
        showWarning: false,
        showWarningDelete: false,
    })

    const [formState, setFormState] = useFormState(entity.state)
    const createEntityRequest = useMutation(mutations.createEntityRequest)
    const updateEntityRequest = useMutation(mutations.updateEntityRequest)
    const deleteEntityRequest = useDeleteEntityRequest()

    const showLoaders = false // TODO
    const shoeEditPageLoader = false // TODO

    const pluginHeaderActions = [
        {
            label: 'content-manager.containers.Edit.reset',
            kind: 'secondary',
            onClick: toggleCancelChangesWarning,
            type: 'button',
            disabled: showLoaders,
        },
        {
            kind: 'primary',
            label: 'content-manager.containers.Edit.submit',
            onClick: handleSubmit,
            type: 'submit',
            loader: shoeEditPageLoader,
            style: shoeEditPageLoader
                ? { marginRight: '18px', flexGrow: 2 }
                : { flexGrow: 2 },
            disabled: showLoaders,
        },
    ]

    const pluginHeaderSubActions =
        mode === 'create'
            ? []
            : [
                  {
                      label: 'app.utils.delete',
                      kind: 'delete',
                      onClick: toggleDeleteWarning,
                      type: 'button',
                      disabled: showLoaders,
                  },
              ]

    const helpers = {
        getPluginHeaderTitle: () =>
            mode === 'create'
                ? labels.createFormHeading
                : entity.state.businessId,

        hasDisplayedAssociations: () => false,
        hasDisplayedLiteralProperties: () => true,

        // Retrieve the entity def's layout
        getLayout: () => getLayout(propertiesToShowOnEditForm),

        // Get the 'source' from the URL
        getSource: () => getQueryParameters(location.search, 'source'),

        redirectAfterSave: () => {
            if (location.search && location.search.includes('?redirectUrl')) {
                const redirectUrl = location.search.split('?redirectUrl=')[1]

                history.push({
                    pathname: redirectUrl.split('?')[0],
                    search: redirectUrl.split('?')[1],
                })
            } else {
                history.push({
                    pathname: location.pathname.replace('/create', ''),
                    search: `?source=${helpers.getSource()}`,
                })
            }
        },
    }

    function toggleCancelChangesWarning() {
        state.setShowWarning(prev => !prev)
    }

    function toggleDeleteWarning() {
        state.setShowWarningDelete(prev => !prev)
    }

    function handleGoBack() {
        history.goBack()
    }

    function handleConfirm() {}

    async function handleDelete() {
        await deleteEntityRequest({
            entityDefId,
            entityId: entity.id,
        })
        state.showWarningDelete = false
        helpers.redirectAfterSave()
    }

    function handleBlur() {}

    function handleChange(e) {
        let value = e.target.value
        // Check if date
        if (
            isObject(e.target.value) &&
            e.target.value._isAMomentObject === true
        ) {
            value = moment(e.target.value).format('YYYY-MM-DD HH:mm:ss')
        } else if (
            ['float', 'integer', 'biginteger', 'decimal'].indexOf(
                get(entityDef, ['properties', e.target.name, 'dataType'])
            ) !== -1
        ) {
            value = toNumber(e.target.value)
        }

        // const target = {
        //     name: `record.${e.target.name}`,
        //     value,
        // }

        setFormState({
            [e.target.name]: value,
        })
    }

    async function handleSubmit(e) {
        e.preventDefault()

        const entityId = entity.id
        const entityState = Object.entries(formState.values).map(
            ([propertyId, value]) => {
                const propertyDef = entityDef.properties[propertyId]
                switch (propertyDef.__typename) {
                    case 'LiteralPropertyDefinition':
                        return {
                            propertyId,
                            literalValue: JSON.stringify(value),
                        }
                    case 'AssociationDefinition':
                        return {
                            propertyId,
                            associationsValue: value.map(destinationEntity => ({
                                destinationEntityId: destinationEntity.id,
                            })),
                        }
                    default:
                        throw Error(
                            `Unrecognized property type '${
                                propertyDef.__typename
                            }'`
                        )
                }
            }
        )

        console.log('entityState: ', entityState)

        // Needed to simulate the server response for optimistic updates
        const convertToGraphqlOutputFormat = stateValues =>
            Object.keys(stateValues).map(propertyId => {
                const stateVal = stateValues[propertyId]
                let value
                // assume literal property value for now
                value = {
                    __typename: 'LiteralPropertyValue',
                    value: JSON.stringify(stateVal),
                }

                // switch (???) {
                //     case 'LiteralPropertyValue':
                //         value = {
                //             __typename: 'LiteralPropertyValue',
                //             value: propState.literalValue,
                //         }
                //         break
                //     case 'Associations':
                //         // TODO
                //         // UNTESTED
                //         value = {
                //             __typename: 'Associations',
                //             associations: propState.entityIds.map(
                //                 associatedEntityId => ({
                //                     destinationEntity: {
                //                         id: associatedEntityId,
                //                     },
                //                 })
                //             ),
                //         }
                //         break
                //     case 'StaticAssets':
                //         throw Error('TODO')
                //     default:
                //         throw Error(
                //             `Unable to determine value type for property state ${JSON.stringify(
                //                 propState
                //             )}`
                //         )
                // }
                return {
                    __typename: 'PropertyState',
                    propertyId,
                    value,
                }
            })

        try {
            const optimisticModerationResponse = {
                __typename: 'EntityModerationStatus',
                entity: {
                    __typename: 'Entity',
                    id: entityId,
                    state: convertToGraphqlOutputFormat(formState.values),
                },
            }
            // console.log(
            //     'optimisticModerationResponse: ',
            //     optimisticModerationResponse
            // )

            if (mode === 'create') {
                await createEntityRequest({
                    variables: {
                        entityDefId,
                        initialState: entityState,
                    },
                    optimisticResponse: {
                        __typename: 'Mutation',
                        createEntityRequest: optimisticModerationResponse,
                    },
                    // update cache so list screen will optimistically show updated data
                    update: (proxy, { data: { createEntityRequest } }) => {
                        // read current cache data
                        const queryArgs = {
                            query: entitiesQuery,
                            variables: { entityDefId, where: { entityDefId } },
                        }
                        const data = proxy.readQuery(queryArgs)
                        // add entity to the top of the list (TODO(?): respect sort order)
                        data.entities.results.unshift(
                            createEntityRequest.entity
                        )
                        // write our data back to the cache
                        proxy.writeQuery({ ...queryArgs, data })
                    },
                })
            } else {
                await updateEntityRequest({
                    variables: {
                        entityDefId,
                        entityId: entityId,
                        updatedState: entityState,
                    },
                    optimisticResponse: {
                        __typename: 'Mutation',
                        updateEntityRequest: optimisticModerationResponse,
                    },
                })
            }

            strapi.notification.success('content-manager.success.record.save')
            helpers.redirectAfterSave()
        } catch (e) {
            console.error('Apollo error: ', e)
            strapi.notification.error('Error saving data: ' + e.message)
        }
    }

    // For to-one relationships only (not to-many)
    function handleChangeSingleAssociationValue({
        propertyId,
        destinationEntity,
    }) {
        setFormState({
            [propertyId]: [destinationEntity],
        })
    }

    function renderForm() {
        const source = helpers.getSource()
        const basePath = '/plugins/content-manager/ctm-configurations'
        const pathname =
            source !== 'content-manager'
                ? `${basePath}/plugins/${source}/${entityDefId}`
                : `${basePath}/${entityDefId}`

        if (showLoaders) {
            return (
                <div
                    className={
                        !helpers.hasDisplayedAssociations()
                            ? 'col-lg-12'
                            : 'col-lg-9'
                    }
                >
                    <div className={styles.main_wrapper}>
                        <LoadingIndicator />
                    </div>
                </div>
            )
        }

        if (!helpers.hasDisplayedLiteralProperties()) {
            return (
                <div
                    className={
                        !helpers.hasDisplayedAssociations()
                            ? 'col-lg-12'
                            : 'col-lg-9'
                    }
                >
                    <EmptyAttributesBlock
                        description="content-manager.components.EmptyAttributesBlock.description"
                        label="content-manager.components.EmptyAttributesBlock.button"
                        onClick={() => history.push(pathname)}
                    />
                </div>
            )
        }

        // TODO
        // It would be better to allow the user to arrange the properties in any order on the edit form,
        // regardless of whether it's a literal property or association property, etc.
        const literalProps = propertiesToShowOnEditForm.filter(
            p => p.__typename === 'LiteralPropertyDefinition'
        )
        const associationProps = propertiesToShowOnEditForm.filter(
            p => p.__typename === 'AssociationDefinition'
        )
        // TODO StaticAssets props

        // console.log('associationProps: ', associationProps)

        return (
            <div
                className={
                    !helpers.hasDisplayedAssociations()
                        ? 'col-lg-12'
                        : 'col-lg-9'
                }
            >
                <div className={styles.main_wrapper}>
                    <Edit
                        attributes={entityDef.properties}
                        displayAttributes={literalProps}
                        didCheckErrors={false}
                        formValidations={[]}
                        formErrors={[]}
                        layout={helpers.getLayout()}
                        modelName={entityDefId}
                        onBlur={handleBlur}
                        onChange={handleChange}
                        record={formState.values}
                        resetProps={false}
                        entityDef={entityDef}
                        // schema={this.getSchema()}
                    />
                    <div className={styles.editFormAssociations}>
                        {associationProps.map(associationDef => (
                            <EditAssociation
                                key={associationDef.id}
                                associationDef={associationDef}
                                entityState={formState.values}
                                onChangeSingleAssociationValue={
                                    handleChangeSingleAssociationValue
                                }
                            />
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div>
            <form onSubmit={handleSubmit}>
                <BackHeader onClick={handleGoBack} />
                <CustomDragLayer />
                <div className={cn('container-fluid', styles.containerFluid)}>
                    <PluginHeader
                        actions={pluginHeaderActions}
                        subActions={pluginHeaderSubActions}
                        title={{ id: helpers.getPluginHeaderTitle() }}
                        titleId="addNewEntry"
                    />
                    <PopUpWarning
                        isOpen={state.showWarning}
                        toggleModal={toggleCancelChangesWarning}
                        content={{
                            title: 'content-manager.popUpWarning.title',
                            message:
                                'content-manager.popUpWarning.warning.cancelAllSettings',
                            cancel:
                                'content-manager.popUpWarning.button.cancel',
                            confirm:
                                'content-manager.popUpWarning.button.confirm',
                        }}
                        popUpWarningType="danger"
                        onConfirm={handleConfirm}
                    />
                    <PopUpWarning
                        isOpen={state.showWarningDelete}
                        toggleModal={toggleDeleteWarning}
                        content={{
                            title: 'content-manager.popUpWarning.title',
                            message:
                                'content-manager.popUpWarning.bodyMessage.contentType.delete',
                            cancel:
                                'content-manager.popUpWarning.button.cancel',
                            confirm:
                                'content-manager.popUpWarning.button.confirm',
                        }}
                        popUpWarningType="danger"
                        onConfirm={handleDelete}
                    />
                    <div className="row">{renderForm()}</div>
                </div>
            </form>
        </div>
    )
}

export default EditPage
