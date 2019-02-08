import React, { useState, useEffect } from 'react'
import AttributeCard from 'components/AttributeCard'
import PopUpForm from 'components/PopUpForm'
import { router } from 'app'
import forms from './forms.json'
import { useFormState } from 'components/Form'
import { map, get, compact, concat } from 'lodash'
import { storeData } from '../../utils/storeData'

const AddEditPropertyView = (props) => {
    // console.log('remainingProps.toggle', remainingProps.toggle)

    const { mode, popUpTitle, formType, formConfig, routePath, hash, entityDefId } = props
    const nodeToFocusState = useState(null)

    const formStateRetVal = useFormState({})
    const { formState, setFormState } = formStateRetVal

    const propValues = formState.values
    if (mode !== 'choose' && !propValues.type) {
        setFormState(getAttributeDefaultsForType(formType))
        return
    }

    // TEMP
    formState.values.name = 'testProp'
    console.log('formState.values: ', formState.values);
    // formState.values = { name: 'testProp' }

    if (formState.values.type !== formType) {
        formState.values.type = formType
    }

    const isTempEntityDef = isEditingTempEntityDef(entityDefId)

    useEffect(() => {
        const onKeyDown = e => handleKeyBinding(e, nodeToFocusState)
        document.addEventListener('keydown', onKeyDown)
        return () => {
            document.removeEventListener('keydown', onKeyDown)
        }
    })

    function handleChange({ target }) {
        setFormState({ [target.name]: target.value })
    }

    async function handleSubmit(e) {
        e.preventDefault()
        if (mode === 'create') {
            addProperty(props, formState.values, isTempEntityDef)
        }
        else editProperty(props, formState.values)
    }

    function renderModalBody() {
        return renderModalBodyChooseAttributes(props, nodeToFocusState)
    }

    return (
        <PopUpForm
            {...props}
            isOpen={true}
            popUpTitle={popUpTitle}
            popUpFormType={formType || ''}
            form={formConfig}
            values={formState.values}
            buttonSubmitMessage='form.button.continue'
            onChange={handleChange}
            onSubmit={handleSubmit}
            routePath={`${routePath}/${hash}`}
            // Override the default rendering
            renderModalBody={mode === 'choose' ? renderModalBody: false}
            noButtons={mode === 'choose'}
        />
    )
}

function isEditingTempEntityDef(entityDefId) {
    return storeData.getIsModelTemporary() &&
        get(storeData.getContentType(), 'id') === entityDefId
}

function addProperty(props, formValues, isTempEntityDef) {
    if (isTempEntityDef) {
        addPropertyToTempEntityDef(props, formValues)
    } else {
        addPropertyToExistingEntityDef(props, formValues)
    }
    redirectAfterSave(props)
}

function addPropertyToTempEntityDef(props, formValues) {

    // @TODO
    // const formErrors = this.checkAttributeValidations(
    //     checkFormValidity(
    //         this.props.modifiedDataAttribute,
    //         this.formValidations
    //     )
    // )

    // if (!isEmpty(formErrors)) {
    //     return this.props.setFormErrors(formErrors)
    // }

    // @TODO check for attributerelation (and rename to isAssociationProp)
    const isAssociationProp = false
    const parallelAttribute = null
    if (!isAssociationProp) {
        const contentType = props.localState.entityDef
        const newAttribute = formValues

        contentType.attributes = compact(
            concat(contentType.attributes, newAttribute, parallelAttribute)
        )
        // // Reset the store and update the parent container
        // props.contentTypeCreate(contentType)

        // Get the displayed model from the localStorage
        const model = storeData.getModel()
        // Set the new field number in the localStorage
        model.fields = contentType.attributes.length
        // // Update the global store (app container) to add the new value to the model without refetching
        // props.temporaryContentTypeFieldsUpdated(model.fields)
        // Store the updated model in the localStorage
        storeData.setModel(model)
        // TODO
        // this.props.resetFormErrors()
    }
}

function addPropertyToExistingEntityDef(props, formValues) {
    // const { entityDef } = props.localState
    // console.log('entityDef: ', entityDef);
    // console.log('formValues', formValues)

    // const tmp = {
    //     ...formValues,
    //     id: formValues.name,
    // }
    // console.log('Adding property', tmp);

    props.localActions.addAttributeToContentType({
        ...formValues,
        id: formValues.name,
    })
}

function editTempContentTypeAttribute(props, formValues) {
    // const formErrors = this.checkAttributeValidations(
    //     checkFormValidity(
    //         this.props.modifiedDataAttribute,
    //         this.formValidations
    //     )
    // )

    // if (!isEmpty(formErrors)) {
    //     return this.props.setFormErrors(formErrors)
    // }

    // const contentType = storeData.getContentType()
    // const newAttribute = this.setTempAttribute()
    // const oldAttribute =
    //     contentType.attributes[this.props.hash.split('::')[3]]
    // contentType.attributes[this.props.hash.split('::')[3]] = newAttribute

    // if (newAttribute.params.target === this.props.modelName) {
    //     const parallelAttribute = this.setParallelAttribute(newAttribute)
    //     contentType.attributes[
    //         findIndex(contentType.attributes, [
    //             'name',
    //             oldAttribute.params.key,
    //         ])
    //     ] = parallelAttribute
    // }

    // if (
    //     oldAttribute.params.target === this.props.modelName &&
    //     newAttribute.params.target !== this.props.modelName
    // ) {
    //     contentType.attributes.splice(
    //         findIndex(contentType.attributes, [
    //             'name',
    //             oldAttribute.params.key,
    //         ]),
    //         1
    //     )
    // }

    // this.editContentTypeAttribute(redirectToChoose)

    // const newContentType = contentType
    // // Empty errors
    // this.props.resetFormErrors()
    // storeData.setContentType(newContentType)
}

function redirectAfterSave(props) {
    router.push(`${props.redirectRoute}/${props.entityDefId}`)
}

function renderModalBodyChooseAttributes(props, [nodeToFocus]) {
    const attributesDisplay = forms.attributesDisplay.items
    // const attributesDisplay = has(this.context.plugins.toJS(), 'upload')
    // ? forms.attributesDisplay.items
    // : forms.attributesDisplay.items.filter(obj => obj.type !== 'media') // Don't display the media field if the upload plugin isn't installed

    function goToAttributeTypeView(attributeType) {
        const settings =
            attributeType === 'relation' ? 'defineRelation' : 'baseSettings'
        router.push(
            `${props.routePath}#create${
                props.modelName
            }::attribute${attributeType}::${settings}`
        )
    }

    return map(attributesDisplay, (attribute, key) => (
        <AttributeCard
            key={key}
            attribute={attribute}
            autoFocus={key === 0}
            routePath={props.routePath}
            handleClick={goToAttributeTypeView}
            nodeToFocus={nodeToFocus}
            tabIndex={key}
            resetNodeToFocus={resetNodeToFocus}
        />
    ))
}

function resetNodeToFocus() {}

function handleKeyBinding(e, nodeToFocusState) {
    const [ nodeToFocus, setNodeToFocus ] = nodeToFocusState
    let toAdd = 0

    switch (e.keyCode) {
        case 37: // Left arrow
        case 39: // Right arrow
            toAdd = nodeToFocus % 2 === 0 ? 1 : -1
            break
        case 38:
            if (nodeToFocus === 0 || nodeToFocus === 1) {
                toAdd = 8
            } else {
                toAdd = -2
            }
            break
        case 40:
            if (
                nodeToFocus ===
                    forms.attributesDisplay.items.length - 1 ||
                nodeToFocus === forms.attributesDisplay.items.length - 2
            ) {
                toAdd = -8
            } else {
                toAdd = 2
            }
            break
        case 9: // Tab
            e.preventDefault()
            toAdd = nodeToFocus === 9 ? -9 : 1
            break
        default:
            toAdd = 0
            break
    }

    setNodeToFocus(prevNodeToFocus => prevNodeToFocus + toAdd)
}

function getAttributeDefaultsForType(formType) {
    const type = formType === 'number' ? 'integer' : formType;
    let defaultValue = type === 'number' ? 0 : '';
  
    if (type === 'boolean') {
      defaultValue = false;
    }
  
    const attribute = {
      id: '',
      name: '', // temp - will later be replaced by 'id'
      type,
      defaultValue,
      required: false,
      unique: false,
      maxLength: false,
      minLength: false,
      multiple: false,
      min: false,
      max: false,
      strapiParams: {
        appearance: {
          WYSIWYG: false,
        },
      },
    }
  
    return attribute
}

export default AddEditPropertyView