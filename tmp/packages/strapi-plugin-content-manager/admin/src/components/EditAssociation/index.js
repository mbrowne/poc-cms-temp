import React from 'react'
import PropTypes from 'prop-types'
import { useApolloClient } from 'react-apollo-hooks'

// Components.
import SelectOne from 'components/SelectOne'
import SelectMany from 'components/SelectMany'

/*
interface EditAssociationProps {
    propertyId: string
    associationDef: AssociationDefinition
    entityState: {[propertyId: string]: any}
    onChangeSingleAssociationValue: Function
}
*/

const EditAssociation = props => {
    const { associationDef } = props
    const { cardinality } = associationDef.destinationItemDef
    const client = useApolloClient()
    if (cardinality === 'ZERO_OR_ONE' || cardinality === 'ONE') {
        return (
            <SelectOne
                apolloClient={client}
                entityState={props.entityState}
                associationDef={associationDef}
                onChangeData={props.onChangeSingleAssociationValue}
                // onRedirect={props.onRedirect}
            />
        )
    }
    return 'many'
}

EditAssociation.propTypes = {
    associationDef: PropTypes.object.isRequired,
    entityState: PropTypes.object.isRequired,
    onChangeSingleAssociationValue: PropTypes.func.isRequired,
    // onRedirect: PropTypes.func.isRequired,
}

export default EditAssociation
