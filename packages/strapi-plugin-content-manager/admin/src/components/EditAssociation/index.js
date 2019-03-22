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

const EditAssociation = React.memo(props => {
    const { cardinality } = props.associationDef.destinationItemDef
    const client = useApolloClient()
    if (cardinality === 'ZERO_OR_ONE' || cardinality === 'ONE') {
        return (
            <SelectOne
                {...props}
                apolloClient={client}
                onChangeData={props.onChangeSingleAssociationValue}
            />
        )
    }
    return <SelectMany {...props} apolloClient={client} />
})

EditAssociation.propTypes = {
    associationDef: PropTypes.object.isRequired,
    entityState: PropTypes.object.isRequired,
    onChangeSingleAssociationValue: PropTypes.func.isRequired,
    onAddAssociationItem: PropTypes.func.isRequired,
    onRemoveAssociationItem: PropTypes.func.isRequired,
    onClickEntityDetails: PropTypes.func.isRequired,
}

export default EditAssociation
