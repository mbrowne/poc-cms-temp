import gql from 'graphql-tag'

export const entityDefSummary = gql`
    fragment EntityDefSummary on EntityDefinition {
        id
        label
        pluralLabel
        description
        propertiesCount
    }
`
