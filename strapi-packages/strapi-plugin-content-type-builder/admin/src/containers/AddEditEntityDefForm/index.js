import React from 'react'
import { forEach, toNumber, isObject } from 'lodash'
import moment from 'moment'
import { useApolloClient, useMutation } from 'react-apollo-hooks'
import { useQueryLoader, useFormState, useApolloStateUpdate } from 'hooks'
import * as queries from '../../graphql/queries'
import PopUpForm from 'components/PopUpForm'

import formConfig from './form.json'

class EntityDefinition {
    id
    label = null
    pluralLabel = null
    isAbstract = false
    properties = []
}

const popUpHeaderNavLinks = [
    {
        name: 'base-settings',
        message: 'content-type-builder.popUpForm.navContainer.base',
        nameToReplace: 'advanced-settings',
    },
    {
        name: 'advanced-settings',
        message: 'content-type-builder.popUpForm.navContainer.advanced',
        nameToReplace: 'base-settings',
    },
]

// function useLoadOrCreateEntityDef(mode, entityDefId) {
//     return mode === 'edit'
//         ? useQueryLoader(queries.entityDefinition, {
//               variables: { id: entityDefId },
//           })
//         : renderContent =>
//               renderContent({ data: { entityDef: new EntityDefinition() } })
// }

function useUpdateUnsavedEntityDef() {
    const updateUnsavedEntityDef = useApolloStateUpdate(
        'entityDefinitionBuilder.unsavedEntityDef'
    )
    return updates => {
        // Workaround for Apollo's special treatment of `id` property: rename to businessId
        const { id, ...values } = updates
        return updateUnsavedEntityDef({
            businessId: id,
            ...values,
        })
    }

    // return useApolloStateUpdate('entityDefinitionBuilder.unsavedEntityDef')
}

/*
interface AddEditEntityDefFormProps extends RouteComponentProps {
    basePath: string  // passed in from SubRouter in App/index.js
    redirectRoute?: string
}
*/

const AddEditEntityDefForm = props => {
    const {
        match: { params },
    } = props
    // Get route params specific to this modal window
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

    const mode = params.modal_mode
    if (mode !== 'create' && mode !== 'edit') {
        throw Error(`Unrecognized 'mode': ${mode}`)
    }

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

    // Indicates whether or not the entity definition being edited was saved on the server already
    let isUnsavedEntityDef = false

    // props to be passed to AddEditEntityDefFormView
    const viewProps = {
        ...props,
        formType,
        mode,
        // @TODO
        entityDefSelectOptions: [],
    }

    if (mode === 'edit') {
        // Are we editing an entity definition that was previously created but hasn't been saved yet?
        if (unsavedEntityDef.id === entityDefId) {
            isUnsavedEntityDef = true
            return (
                <AddEditEntityDefFormView
                    {...viewProps}
                    entityDef={unsavedEntityDef}
                    isUnsavedEntityDef={isUnsavedEntityDef}
                />
            )
        } else {
            isUnsavedEntityDef = false
            return useQueryLoader(queries.entityDefinition, {
                variables: { id: entityDefId },
            })(result => {
                const { entityDef } = result.data
                if (!entityDef) {
                    throw Error(
                        `Entity definition ID '${entityDefId} not found`
                    )
                }
                return (
                    <AddEditEntityDefFormView
                        {...viewProps}
                        entityDef={entityDef}
                        isUnsavedEntityDef={isUnsavedEntityDef}
                    />
                )
            })
        }
    }
    // mode === 'create'
    isUnsavedEntityDef = true
    return (
        <AddEditEntityDefFormView
            {...viewProps}
            entityDef={new EntityDefinition()}
            isUnsavedEntityDef={isUnsavedEntityDef}
        />
    )
}

const AddEditEntityDefFormView = props => {
    const {
        history,
        match,
        basePath,
        data,
        mode,
        formType,
        isUnsavedEntityDef,
        entityDefSelectOptions,
        redirectRoute,
    } = props
    const origEntityDef = props.entityDef

    const helpers = {
        getInitialFormValues: (formConfig, entityDef = undefined) => {
            const values = {}
            forEach(formConfig, formSection => {
                for (const item of formSection.items) {
                    values[item.name] = item.value
                }
            })

            if (entityDef) {
                const {
                    properties,
                    __typename,
                    hasChanges,
                    ...basicSettings
                } = entityDef
                Object.assign(values, basicSettings)
            }

            return values
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

    async function handleSubmit(e) {
        e.preventDefault()
        const { values } = formState

        if (isUnsavedEntityDef) {
            // If it's a new entity definition not yet saved to the server, save it in local state so that the
            // user can add properties to it and save it in the next step
            updateUnsavedEntityDef(values)
        } else {
            // If it's already on the server, go ahead and update it immediately
            try {
                await updateSavedEntityDef({
                    variables: {
                        id: origEntityDef.id,
                        entityDef: values,
                    },
                })
            } catch (e) {
                console.error('Apollo error: ', e)
                strapi.notification.error('Error saving data: ' + e.message)
            }
        }
        history.push(
            redirectRoute
                ? redirectRoute
                : `/plugins/content-type-builder/entity-defs/${values.id}`
        )
    }

    const [formState, setFormState] = useFormState(
        helpers.getInitialFormValues(formConfig, origEntityDef)
    )

    const updateUnsavedEntityDef = useUpdateUnsavedEntityDef()
    const updateSavedEntityDef = useMutation(queries.updateEntityDefinition)

    const selectOptions = {
        parentEntityDefId: entityDefSelectOptions || [],
    }

    return (
        <PopUpForm
            isOpen={true}
            form={formConfig[formType]}
            // since isOpen is always true, we know that the toggle callback will always be a request
            // to close the modal (not open it)
            toggle={handleRequestCloseModal}
            popUpFormType="contentType"
            popUpTitle={`content-type-builder.popUpForm.${mode}.contentType.header.title`}
            routePath={match.url}
            popUpHeaderNavLinks={popUpHeaderNavLinks}
            values={formState.values}
            selectOptions={selectOptions}
            onChange={handleChange}
            onSubmit={handleSubmit}
            renderModalBody={false}
            buttonSubmitMessage="form.button.save"
            showLoader={false}
        />
    )
}

export default AddEditEntityDefForm
