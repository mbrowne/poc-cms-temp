import gql from 'graphql-tag'

export const deleteEntityRequest = gql`
    mutation($entityDefId: ID!, $entityId: ID!) {
        deleteEntityRequest(entityDefId: $entityDefId, entityId: $entityId) {
            entity {
                id
            }
        }
    }
`
