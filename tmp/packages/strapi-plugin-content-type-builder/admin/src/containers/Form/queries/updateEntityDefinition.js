import gql from 'graphql-tag'

export const updateEntityDefinition = gql`
    mutation($entityDef: EntityDefinitionInput!) {
        updateEntityDefinition(entityDef: $entityDef) {
            entityDef {
                id
            }
        }
    }
`