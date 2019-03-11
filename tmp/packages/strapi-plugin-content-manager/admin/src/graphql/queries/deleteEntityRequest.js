import gql from 'graphql-tag'
// import { entityDetails } from '../../graphql/fragments'

export const deleteEntityRequest = gql`
    mutation($entityDefId: ID!, $entityId: ID!) {
        deleteEntityRequest(entityDefId: $entityDefId, entityId: $entityId) {
            entity {
                id
            }
        }
    }
`
