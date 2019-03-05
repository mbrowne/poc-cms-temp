import gql from 'graphql-tag'

export const entityDefDetails = gql`
    fragment EntityDefDetails on EntityDefinition {
        id
        label
        pluralLabel
        description
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
`
