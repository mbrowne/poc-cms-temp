import gql from 'graphql-tag'

export const createEntityRequest = gql`
    mutation($entityDefId: ID!, $initialState: [PropertyStateInput!]!) {
        createEntityRequest(
            entityDefId: $entityDefId
            initialState: $initialState
        ) {
            entity {
                id
            }
        }
    }
`

export const updateEntityRequest = gql`
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
                id
            }
        }
    }
`
