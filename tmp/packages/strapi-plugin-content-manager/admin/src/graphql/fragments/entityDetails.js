import gql from 'graphql-tag'

export const entityDetails = gql`
    fragment EntityDetails on Entity {
        id
        state {
            propertyId
            value {
                ... on LiteralPropertyValue {
                    value
                }
            }
        }
    }
`
