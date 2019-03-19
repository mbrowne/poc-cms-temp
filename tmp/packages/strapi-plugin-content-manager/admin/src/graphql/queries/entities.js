import gql from 'graphql-tag'
import { entityDefDetails } from '../fragments'

export const entities = gql`
    ${entityDefDetails}

    query($entityDefId: ID!, $where: EntityFilters!) {
        entities(where: $where) {
            totalCount
            results {
                id
                state {
                    propertyId
                    value {
                        ... on LiteralPropertyValue {
                            value
                        }
                        ... on Associations {
                            associations {
                                destinationEntity {
                                    id
                                    displayName
                                }
                            }
                        }
                    }
                }
            }
        }

        entityDef: entityDefinition(id: $entityDefId) {
            ...EntityDefDetails
        }
    }
`
