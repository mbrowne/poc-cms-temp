import gql from 'graphql-tag'

// Returns an array of entities to pick from when selecting entities for association properties
export const associationSelectOptions = gql`
    query($where: EntityFilters!) {
        entities(where: $where) {
            totalCount
            results {
                id
                displayName
            }
        }
    }
`
