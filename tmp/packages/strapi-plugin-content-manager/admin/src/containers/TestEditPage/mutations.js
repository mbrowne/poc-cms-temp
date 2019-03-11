import gql from 'graphql-tag'
import { entityDetails } from '../../graphql/fragments'

export const createEntityRequest = gql`
    ${entityDetails}

    mutation($entityDefId: ID!, $initialState: [PropertyStateInput!]!) {
        createEntityRequest(
            entityDefId: $entityDefId
            initialState: $initialState
        ) {
            entity {
                # Fetch full entity so we can do optimistic inserts
                ...EntityDetails
            }
        }
    }
`

export const updateEntityRequest = gql`
    ${entityDetails}

    mutation(
        $entityDefId: ID!
        $entityId: ID!
        $updatedState: [PropertyStateInput!]!
    ) {
        updateEntityRequest(
            entityDefId: $entityDefId
            entityId: $entityId
            updatedState: $updatedState
        ) {
            entity {
                # Fetch full entity so we can do optimistic updates
                ...EntityDetails
            }
        }
    }
`
