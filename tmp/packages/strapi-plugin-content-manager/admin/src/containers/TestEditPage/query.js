import gql from 'graphql-tag'
import { entityDefDetails, entityDetails } from '../../graphql/fragments'

// Note: "EditPage" is also used to create new entities
export const editPageQuery = gql`
    ${entityDetails}
    ${entityDefDetails}

    query($entityDefId: ID!, $isEditMode: Boolean!, $entityId: ID!) {
        entity(entityDefId: $entityDefId, entityId: $entityId)
            @include(if: $isEditMode) {
            ...EntityDetails
        }

        entityDef: entityDefinition(id: $entityDefId) {
            ...EntityDefDetails
        }
    }
`
