import React from 'react'
import moment from 'moment'
import cn from 'classnames'
import { get, isObject, toNumber } from 'lodash'

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
import EditRelations from 'components/EditRelations'

import { useQueryLoader, useConvenientState, useFormState } from 'hooks'
import { editPageQuery } from './query'
import getQueryParameters from 'utils/getQueryParameters'
import styles from './styles.scss'
import {
    convertEntityDefResult,
    convertAdminUiSettings,
} from '../../utils/convertEntityDefResults'
import { getLayout } from './utils'

const labels = {
    createFormHeading: 'New Entry',
}

const EditPage = props => {
    // TEMP
    const entityDefId = 'Tag'
    const entityId = 'create'
    // const entityId = 'abcd1234'
    const mode = entityId === 'create' ? 'create' : 'edit'

    return useQueryLoader(editPageQuery, {
        variables: { entityDefId, entityId, isEditMode: mode === 'edit' },
    })(({ data }) => {
        return (
            <EditPageView
                {...props}
                data={data}
                mode={mode}
                entityDefId={entityDefId}
                entityId={entityId}
            />
        )
    })
}

const EditPageView = ({
    data,
    mode,
    match,
    history,
    location,
    entityDefId,
    entityId,
}) => {
    const entityDef = convertEntityDefResult(data.entityDef)
    const { propertiesToShowOnEditForm } = entityDef.adminUiSettings
    // const { propertiesToShowOnEditForm } = convertAdminUiSettings(entityDef.adminUiSettings)
    // console.log('entityDef: ', entityDef)

    // TEMP
    const entity = {
        id: null,
        state: {
            businessId: 'pop-art',
            displayName: 'Pop Art',
        },
    }

    const state = useConvenientState({
        showWarning: false,
        showWarningDelete: false,
    })

    const [formState, setFormState] = useFormState(entity.state)

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
            mode === 'create' ? labels.createFormHeading : match.params.id,

        hasDisplayedAssociations: () => false,
        hasDisplayedLiteralProperties: () => true,

        // Retrieve the entity def's layout
        getLayout: () => getLayout(propertiesToShowOnEditForm),
    }

    function toggleCancelChangesWarning() {
        state.setShowWarning(prev => !prev)
    }

    function toggleDeleteWarning() {
        state.setShowWarningDelete(prev => !prev)
    }

    function handleSubmit() {}

    function handleGoBack() {
        history.goBack()
    }

    function handleConfirm() {}

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

    function renderForm() {
        const source = getQueryParameters(location.search, 'source')
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

        if (!helpers.hasDisplayedLiteralProperties) {
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
                        displayAttributes={propertiesToShowOnEditForm}
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
                        onConfirm={handleConfirm}
                    />
                    <div className="row">{renderForm()}</div>
                </div>
            </form>
        </div>
    )
}

export default EditPage
