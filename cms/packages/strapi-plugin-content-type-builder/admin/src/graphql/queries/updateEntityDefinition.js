import gql from 'graphql-tag'

export const updateEntityDefinition = gql`
    mutation($id: ID!, $entityDef: EntityDefinitionInput!) {
        updateEntityDefinition(id: $id, entityDef: $entityDef) {
            entityDef {
                id
            }
        }
    }
`
