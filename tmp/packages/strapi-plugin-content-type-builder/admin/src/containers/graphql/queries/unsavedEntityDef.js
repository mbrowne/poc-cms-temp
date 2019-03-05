import gql from 'graphql-tag'
import { entityDefDetails, entityDefUI } from '../fragments'

export const unsavedEntityDef = gql`
    ${entityDefDetails}
    ${entityDefUI}

    query {
        entityDefinitionBuilder @client {
            unsavedEntityDef {
                ...EntityDefDetails
            }

            entityDefUI {
                ...EntityDefUI
            }
        }
    }
`
