import React from 'react'
import { includes, replace } from 'lodash'
import forms from './forms.json'
import AddEditPropertyView from './AddEditPropertyView'

const AddEditProperty = ({ entityDefId, propertyName, hash, ...remainingProps }) => {
    let formConfig = []
    const { mode, formType, settingsType } = parseHash(hash)

    // //temp
    // const parsed = parseHash(hash)
    // console.log('parsed: ', parsed);

    let popUpTitle
    if (mode === 'choose') {
        popUpTitle = `content-type-builder.popUpForm.choose.${formType}.header.title`
    } else {
        // console.log('forms', forms)
        formConfig = forms.attribute[formType][settingsType]
        popUpTitle = 'content-type-builder.popUpForm.edit'
    }

    return (
        <AddEditPropertyView
            mode={mode}
            formType={formType}
            popUpTitle={popUpTitle}
            formConfig={formConfig}
            hash={hash}
            {...remainingProps}
        />
    )
}

function parseHash(hash) {
    const hashArray = hash.split('::')
    const valueToReplace = includes(hash, '#create') ? '#create' : '#edit';
    const entityDefId = replace(hashArray[0], valueToReplace, '');
    const mode = hashArray[0].substring(1)
    if (entityDefId !== '#choose') {
        return {
            mode,
            formType: hashArray[1].replace('attribute', ''),
            settingsType: hashArray[2]
        }
    }
    return {
        mode,
        formType: hashArray[1]
    }
}

function getAttributeFormData(formType) {
    const type = formType === 'number' ? 'integer' : formType;
    let defaultValue = type === 'number' ? 0 : '';
  
    if (type === 'boolean') {
      defaultValue = false;
    }
  
    const attribute = {
      name: '',
      params: {
        appearance: {
          WYSIWYG: false,
        },
        type,
        default: defaultValue,
        required: false,
        unique: false,
        maxLength: false,
        minLength: false,
        multiple: false,
        min: false,
        max: false,
      },
    }
  
    return attribute
}

export default AddEditProperty
