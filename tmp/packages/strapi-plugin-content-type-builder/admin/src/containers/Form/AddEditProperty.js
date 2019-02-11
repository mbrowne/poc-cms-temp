import React from 'react'
import forms from './forms.json'
import AddEditPropertyView from './AddEditPropertyView'
// TEMP
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { contentTypeCreate } from './actions'

const AddEditProperty = ({ entityDef, propertyName, hash, ...remainingProps }) => {
    let formConfig = []

    // //temp
    // const parsed = parseHash(hash)
    // console.log('parsed: ', parsed);

    let popUpTitle
    const hashArray = hash.split('::')
    const settingsType = hashArray[2]
    // step 1 of the wizard is choosing the property type
    // step 2 is choosing property settings
    const whichWizardStep = hashArray[0] === '#choose' ? 'chooseType': 'propSettings'
    if (whichWizardStep === 'chooseType') {
        const formType = hashArray[1]
        popUpTitle = `content-type-builder.popUpForm.choose.${formType}.header.title`
    } else {
        const formType = hashArray[1].replace('attribute', '')
        formConfig = forms.attribute[formType][settingsType]
        popUpTitle = 'content-type-builder.popUpForm.edit'
    }

    return (
        <AddEditPropertyView
            wizardStep={whichWizardStep}
            entityDef={entityDef}
            popUpTitle={popUpTitle}
            formConfig={formConfig}
            hash={hash}
            {...remainingProps}
        />
    )
}

// TEMP - redux will be removed later
function mapDispatchToProps(dispatch) {
  return bindActionCreators(
      {
          contentTypeCreate
      },
      dispatch
  )
}

export default connect(
  undefined,
  mapDispatchToProps
)(AddEditProperty)

// export default AddEditProperty
