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
            readOnly
            ... on AssociationDefinition {
                destinationItemDef {
                    cardinality
                    entityDef {
                        id
                    }
                }
            }
        }
        adminUiSettings {
            propertiesToShowOnListScreen {
                id
                label
                dataType
            }
            propertiesToShowOnEditForm {
                id
                label
                dataType
                ... on AssociationDefinition {
                    destinationItemDef {
                        cardinality
                        entityDef {
                            id
                        }
                    }
                }
            }
        }
    }
`
