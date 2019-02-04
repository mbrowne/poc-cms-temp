import gql from 'graphql-tag'

export default gql`
    mutation($entityDef: EntityDefinitionInput!) {
        createEntityDefinition(entityDef: $entityDef) {
            entityDef {
                id
            }
        }
    }
`