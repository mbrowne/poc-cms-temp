import gql from 'graphql-tag'
import { entityDefDetails } from '../../graphql/fragments'

// Note: "EditPage" is also used to create new entities
export const editPageQuery = gql`
    ${entityDefDetails}

    query($entityDefId: ID!, $isEditMode: Boolean!, $entityId: ID!) {
        entity(entityDefId: $entityDefId, entityId: $entityId)
            @include(if: $isEditMode) {
            id
        }

        entityDef: entityDefinition(id: $entityDefId) {
            ...EntityDefDetails
        }
    }
`
