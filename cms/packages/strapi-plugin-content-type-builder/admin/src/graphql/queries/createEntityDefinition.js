import gql from 'graphql-tag'

export const createEntityDefinition = gql`
    mutation($entityDef: EntityDefinitionInput!) {
        createEntityDefinition(entityDef: $entityDef) {
            entityDef {
                id
            }
        }
    }
`