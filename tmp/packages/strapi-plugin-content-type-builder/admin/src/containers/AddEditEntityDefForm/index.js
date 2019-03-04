import React from 'react'
import { forEach, toNumber, isObject, includes } from 'lodash'
import moment from 'moment'
import { useMutation } from 'react-apollo-hooks'
import {
    useQueryLoader,
    useConvenientState,
    useFormState,
    useApolloStateUpdate,
} from 'hooks'
import {
    entityDefinition as entityDefinitionQuery,
    updateEntityDefinition as updateEntityDefinitionMutation,
} from '../graphql/queries'
import PopUpForm from 'components/PopUpForm'

import formConfig from './form.json'

class EntityDefinition {
    id
    label
    pluralLabel
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

function useLoadOrCreateEntityDef(mode, entityDefId) {
    return mode === 'edit'
        ? useQueryLoader(entityDefinitionQuery, {
              variables: { id: entityDefId },
          })
        : renderContent =>
              renderContent({ data: { entityDef: new EntityDefinition() } })
}

function useUpdateUnsavedEntityDef() {
    return useApolloStateUpdate('entityDefinitionBuilder.unsavedEntityDef')
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
    const id = params.modal_entityDefId
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

    return useLoadOrCreateEntityDef(mode, id)(({ data }) => {
        const { entityDef } = data
        if (!entityDef) {
            throw Error(`Entity definition ID '${id} not found`)
        }
        return (
            <AddEditEntityDefFormView
                {...props}
                data={data}
                formType={formType}
                mode={mode}
            />
        )
    })
}

const AddEditEntityDefFormView = props => {
    const { history, match, basePath, data, mode, formType } = props
    const redirectRoute = props.redirectRoute || basePath

    // Indicates whether or not the entity definition being edited was saved on the server already
    const isSavedEntityDef = Boolean(data.entityDef)
    const origEntityDef = isSavedEntityDef
        ? data.entityDef
        : data.entityDefinitionBuilder.unsavedEntityDef

    const helpers = {
        getInitialFormValues: (formConfig, entityDef = undefined) => {
            const values = {}
            forEach(formConfig, formSection => {
                for (const item of formSection.items) {
                    values[item.name] = item.value
                }
            })

            if (entityDef) {
                const { properties, __typename, ...basicSettings } = entityDef
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
        // If it's already on the server, go ahead and update it immediately
        if (isSavedEntityDef) {
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
        // Otherwise, save it in local state so that the user can add properties to it and save it in the next step
        else {
            updateUnsavedEntityDef(values)
        }

        history.push(`${redirectRoute}/entity-defs/${values.id}`)
    }

    const state = useConvenientState({
        showButtonLoading: false,
    })

    const [formState, setFormState] = useFormState(
        helpers.getInitialFormValues(formConfig, origEntityDef)
    )

    const updateUnsavedEntityDef = useUpdateUnsavedEntityDef()
    const updateSavedEntityDef = useMutation(updateEntityDefinitionMutation)

    const selectOptions = {
        parentEntityDefId: data.entityDefSelectOptions || [],
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
            showLoader={state.showButtonLoading}
        />
    )
}

export default AddEditEntityDefForm
