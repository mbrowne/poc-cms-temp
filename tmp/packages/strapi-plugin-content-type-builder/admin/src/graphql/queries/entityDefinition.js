import gql from 'graphql-tag'
import { entityDefDetails, entityDefUI } from '../fragments'

export const entityDefinition = gql`
    ${entityDefDetails}
    ${entityDefUI}

    query($id: ID!) {
        entityDef: entityDefinition(id: $id) {
            ...EntityDefDetails
            hasChanges @client
        }

        entityDefinitionBuilder @client {
            entityDefUI {
                ...EntityDefUI
            }
        }
    }
`
