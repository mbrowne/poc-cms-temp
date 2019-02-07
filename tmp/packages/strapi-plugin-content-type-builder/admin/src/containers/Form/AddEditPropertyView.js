import React, { useState, useEffect } from 'react'
import AttributeCard from 'components/AttributeCard'
import PopUpForm from 'components/PopUpForm'
import { router } from 'app'
import forms from './forms.json'
import { map } from 'lodash'

const AddEditPropertyView = (props) => {
    // console.log('remainingProps.toggle', remainingProps.toggle)

    const { mode, popUpTitle, formType, formConfig, routePath, hash } = props
    const nodeToFocusState = useState(null)
    // TODO
    // Make sure it only runs on first render, and also need removeEventListener()
    //
    // useEffect(() => {
    //     document.addEventListener('keydown', e => handleKeyBinding(e, nodeToFocusState))
    // })

    function handleChange({ target }) {
        console.log('target.value', target.value)
    }

    function handleSubmit() {}

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
            buttonSubmitMessage='form.button.continue'
            onChange={handleChange}
            onSubmit={handleSubmit}
            routePath={`${routePath}/${hash}`}
            // Override the default rendering
            renderModalBody={mode === 'choose' ? renderModalBody: false}
        />
    )
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

export default AddEditPropertyView