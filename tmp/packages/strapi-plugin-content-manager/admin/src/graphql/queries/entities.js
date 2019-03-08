import gql from 'graphql-tag'

export const entities = gql`
    query($entityDefId: ID!, $where: EntityFilters!) {
        entities(where: $where) {
            totalCount
            results {
                id
            }
        }

        entityDef: entityDefinition(id: $entityDefId) {
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
                readOnly
            }
            adminUiSettings {
                propertiesToShowOnListScreen {
                    id
                    label
                    dataType
                }
            }
        }
    }
`
