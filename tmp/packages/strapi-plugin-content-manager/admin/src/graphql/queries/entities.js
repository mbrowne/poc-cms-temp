import gql from 'graphql-tag'

export const entities = gql`
    query($entityDefId: ID!, $entityFilters: EntityFilters!) {
        entities(where: $entityFilters) {
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
                }
            }
        }
    }
`
