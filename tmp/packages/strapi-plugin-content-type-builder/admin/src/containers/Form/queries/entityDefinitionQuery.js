import gql from 'graphql-tag'

export default gql`
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
        }
    }
`