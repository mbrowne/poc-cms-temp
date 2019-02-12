import gql from 'graphql-tag'

export const entityDefinition = gql`
    query($id: ID!) {
        entityDef: entityDefinition(id: $id) {
            id
            label
            pluralName
            # templateEntityDefinition {
            #     id
            #     properties
            #         ...
            # }
            isAbstract
            properties {
              id
              label
              dataType
            }
        }
    }
`