import gql from 'graphql-tag'

export const entityDefDetails = gql`
    fragment EntityDefDetails on EntityDefinition {
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
        # ...entityDefDetails
    }
`
