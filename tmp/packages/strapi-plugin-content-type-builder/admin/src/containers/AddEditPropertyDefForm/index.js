import React from 'react'
import { toNumber, isObject, upperFirst } from 'lodash'
import moment from 'moment'
import { useApolloClient } from 'react-apollo-hooks'
import { FormattedMessage } from 'react-intl'
import formConfig from './form.json'
import PopUpForm from 'components/PopUpForm'
import {
    useQueryLoader,
    useConvenientState,
    useFormState,
    useApolloStateUpdate,
} from 'hooks'
import * as queries from '../../graphql/queries'

function useUpdatePropertyDef(
    origEntityDef,
    origPropertyDef = null,
    isUnsavedEntityDef = false
) {
    const origPropertyId = origPropertyDef ? origPropertyDef.id : null
    const client = useApolloClient()
    const updateUnsavedEntityDef = useApolloStateUpdate(
        'entityDefinitionBuilder.unsavedEntityDef'
    )
    return propertyDef => {
        propertyDef.__typename = 'PropertyDefinition'
        // TEMP
        if (!propertyDef.label) {
            propertyDef.label = upperFirst(propertyDef.id)
        }

        const properties = [...origEntityDef.properties]
        const existingPropIndex = origPropertyId
            ? properties.findIndex(p => p.id === origPropertyId)
            : -1
        if (existingPropIndex === -1) {
            properties.push(propertyDef)
        } else {
            properties[existingPropIndex] = propertyDef
        }
        const updatedEntityDef = {
            ...origEntityDef,
            properties,
            // client-side flag indicating that this entity def has unsaved changes
            hasChanges: true,
        }

        if (isUnsavedEntityDef) {
            // Workaround for Apollo's special treatment of `id` property: rename to businessId
            const { id, ...values } = updatedEntityDef
            updateUnsavedEntityDef({
                businessId: id,
                ...values,
            })
        } else {
            client.writeData({
                data: {
                    EntityDefinition: updatedEntityDef,
                },
                id: origEntityDef.id,
            })
        }
    }
}

/*
interface AddEditPropertyDefFormProps extends RouteComponentProps {
    basePath: string  // passed in from SubRouter in App/index.js
    redirectRoute?: string
}
*/

const AddEditPropertyDefForm = props => {
    const client = useApolloClient()
    const modalParams = getRouteParams(props.match.params)

    const { entityDefinitionBuilder } = client.readQuery({
        query: queries.unsavedEntityDef,
    })
    const {
        businessId,
        ...unsavedEntityDef
    } = entityDefinitionBuilder.unsavedEntityDef

    // Workaround for Apollo's special treatment of `id` property
    unsavedEntityDef.id = businessId
    // Are we editing a new entity definition that hasn't been saved yet?
    const isUnsavedEntityDef = unsavedEntityDef.id === modalParams.entityDefId

    if (isUnsavedEntityDef) {
        return (
            <AddEditEntityDefFormView
                {...props}
                isUnsavedEntityDef={isUnsavedEntityDef}
                modalParams={modalParams}
                entityDef={unsavedEntityDef}
            />
        )
    }
    // If we are editing an existing entity definition on the server,
    // we now need to do the server-side query
    return useQueryLoader(queries.entityDefinition, {
        variables: { id: modalParams.entityDefId },
    })(({ data }) => {
        return (
            <AddEditEntityDefFormView
                {...props}
                isUnsavedEntityDef={isUnsavedEntityDef}
                modalParams={modalParams}
                entityDef={data.entityDef}
            />
        )
    })
}

// Get route params specific to this modal window
function getRouteParams(params) {
    const mode = params.modal_mode
    if (mode !== 'create' && mode !== 'edit') {
        throw Error(`Unrecognized 'mode': ${mode}`)
    }
    const entityDefId = params.modal_entityDefId
    const { modal_formType } = params
    if (
        modal_formType !== 'base-settings' &&
        modal_formType !== 'advanced-settings'
    ) {
        throw Error(`Unrecognized 'formType': ${modal_formType}`)
    }
    const formType =
        modal_formType === 'base-settings' ? 'baseSettings' : 'advancedSettings'
    let propertyType
    let propertyId
    if (mode === 'create') {
        propertyType = params.modal_propTypeOrPropertyId
    } else {
        propertyId = params.modal_propTypeOrPropertyId
    }

    return {
        mode,
        entityDefId,
        formType,
        propertyType,
        propertyId,
    }
}

const AddEditEntityDefFormView = props => {
    const {
        entityDef: origEntityDef,
        isUnsavedEntityDef,
        match,
        history,
        modalParams,
        basePath,
    } = props

    const redirectRoute = props.redirectRoute || basePath

    // console.log('origEntityDef: ', origEntityDef)

    const helpers = {
        getExistingProperty: propId => {
            const prop = origEntityDef.properties.find(p => p.id === propId)
            if (!prop) {
                throw Error('Property not found in entity definition')
            }
            return prop
        },

        getInitialFormValues: (propertyDef = undefined) => {
            if (propertyDef) {
                return { ...propertyDef }
            }

            const dataType =
                propertyType === 'number' ? 'integer' : propertyType
            let defaultValue = propertyType === 'number' ? 0 : ''

            if (propertyType === 'boolean') {
                defaultValue = false
            }

            const prop = {
                id: '',
                label: '',
                readOnly: false,
                dataType,
                defaultValue,
                inheritedFrom: null,
            }

            return prop
        },

        renderCustomPopUpHeader: startTitle => {
            const italicText =
                mode === 'create' ? (
                    <FormattedMessage
                        id="popUpForm.header"
                        defaultMessage="{title}"
                        values={{
                            title: propertyType,
                        }}
                    >
                        {message => (
                            <span
                                style={{
                                    fontStyle: 'italic',
                                    textTransform: 'capitalize',
                                }}
                            >
                                {message}
                            </span>
                        )}
                    </FormattedMessage>
                ) : (
                    <span
                        style={{
                            fontStyle: 'italic',
                            textTransform: 'capitalize',
                        }}
                    >
                        {origPropertyDef.id}
                    </span>
                )
            return (
                <div>
                    <FormattedMessage id={startTitle} />
                    &nbsp;
                    {italicText}
                    &nbsp;
                    <FormattedMessage id="content-type-builder.popUpForm.field" />
                </div>
            )
        },

        redirectAfterSave: (redirectToChoosePropertyType = false) => {
            if (redirectToChoosePropertyType) {
                history.push(
                    `${redirectRoute}/(choose-property-type/${entityDefId})`
                )
            } else {
                history.push(redirectRoute)
            }
        },
    }

    function handleRequestCloseModal() {
        history.push(basePath)
    }

    function handleChange({ target }) {
        let value =
            target.type === 'number' && target.value !== ''
                ? toNumber(target.value)
                : target.value

        // Parse enumeration textarea to transform it into a array
        if (target.name === 'params.enumValue') {
            value = target.value.split(',')
        }

        if (isObject(target.value) && target.value._isAMomentObject === true) {
            value = moment(target.value, 'YYYY-MM-DD HH:mm:ss').format()
        }

        setFormState({ [target.name]: value })
    }

    function handleSubmit(e, redirectToChoosePropertyType = true) {
        e.preventDefault()
        const { values } = formState
        updatePropertyDef(values)
        helpers.redirectAfterSave(redirectToChoosePropertyType)

        // // If it's already on the server, go ahead and update it immediately
        // if (isSavedEntityDef) {
        //     try {
        //         await updateSavedEntityDef({
        //             variables: {
        //                 id: origEntityDef.id,
        //                 entityDef: values,
        //             },
        //         })
        //     } catch (e) {
        //         console.error('Apollo error: ', e)
        //         strapi.notification.error('Error saving data: ' + e.message)
        //     }
        // }
        // // Otherwise, save it in local state so that the user can add properties to it and save it in the next step
        // else {
        //     updateUnsavedEntityDef(values)
        // }

        // history.push(`${redirectRoute}/entity-defs/${values.id}`)
    }

    const { mode, entityDefId, formType, propertyId } = modalParams
    let propertyType
    let origPropertyDef
    if (mode === 'create') {
        propertyType = modalParams.propertyType
    } else {
        origPropertyDef = helpers.getExistingProperty(propertyId)
        // @TODO relationship properties
        propertyType = origPropertyDef.dataType
    }

    const state = useConvenientState({
        showButtonLoading: false,
    })

    const [formState, setFormState] = useFormState(
        helpers.getInitialFormValues(origPropertyDef)
    )

    const updatePropertyDef = useUpdatePropertyDef(
        origEntityDef,
        origPropertyDef,
        isUnsavedEntityDef
    )

    return (
        <PopUpForm
            isOpen={true}
            form={formConfig[propertyType][formType]}
            // since isOpen is always true, we know that the toggle callback will always be a request
            // to close the modal (not open it)
            toggle={handleRequestCloseModal}
            popUpFormType="attribute"
            renderCustomPopUpHeader={helpers.renderCustomPopUpHeader(
                `content-type-builder.popUpForm.${mode}`
            )}
            popUpTitle=""
            routePath={match.url}
            values={formState.values}
            onChange={handleChange}
            onSubmit={handleSubmit}
            renderModalBody={false}
            buttonSubmitMessage="form.button.continue"
            showLoader={state.showButtonLoading}
        />
    )
}

export default AddEditPropertyDefForm
