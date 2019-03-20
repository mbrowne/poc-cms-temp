import gql from 'graphql-tag'
import { entityDefSummary } from '../fragments'

export const entityDefinitions = gql`
    ${entityDefSummary}

    query {
        entityDefs: entityDefinitions {
            results {
                ...EntityDefSummary
            }
        }
    }
`
