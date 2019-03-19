import gql from 'graphql-tag'

export const entityDefDetails = gql`
    fragment EntityDefDetails on EntityDefinition {
        id
        label
        pluralLabel
        description
        templateEntityDefinition {
            id
            label
        }
        isAbstract
        properties {
            id
            label
            dataType
            readOnly
            inheritedFrom {
                label
            }
        }
    }
`
