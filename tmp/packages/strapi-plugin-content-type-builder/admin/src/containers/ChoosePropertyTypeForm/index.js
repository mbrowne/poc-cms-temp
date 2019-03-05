import React from 'react'
import formConfig from './form.json'
import PopUpForm from 'components/PopUpForm'
import AttributeCard from 'components/AttributeCard'

const noop = () => {}

const ChoosePropertyTypeForm = ({ match, history, basePath }) => {
    const helpers = {
        renderModalBody: () => {
            return formConfig.items.map((propType, i) => (
                <AttributeCard
                    key={i}
                    attribute={propType}
                    autoFocus={i === 0}
                    routePath={match.url}
                    handleClick={helpers.goToPropTypeView}
                    // nodeToFocus={state.nodeToFocus}
                    tabIndex={i}
                    // resetNodeToFocus={helpers.resetNodeToFocus}
                />
            ))
        },

        goToPropTypeView: propType => {
            // @TODO: relationships
            if (propType === 'relation') {
                throw Error('TODO')
            }
            history.push(
                `${basePath}/(property/create/${entityDefId}/${propType}/base-settings)`
            )
        },
    }

    function handleRequestCloseModal() {
        history.push(basePath)
    }

    // Get route params specific to this modal window
    const entityDefId = match.params.modal_entityDefId

    return (
        <PopUpForm
            isOpen={true}
            form={formConfig}
            // since isOpen is always true, we know that the toggle callback will always be a request
            // to close the modal (not open it)
            toggle={handleRequestCloseModal}
            popUpFormType="choose"
            popUpTitle="content-type-builder.popUpForm.choose.attributes.header.title"
            routePath={match.url}
            // popUpHeaderNavLinks={popUpHeaderNavLinks}
            values={{}}
            onChange={noop}
            onSubmit={noop}
            renderModalBody={helpers.renderModalBody}
            noButtons={true}
            buttonSubmitMessage=""
        />
    )
}

export default ChoosePropertyTypeForm
