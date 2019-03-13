import gql from 'graphql-tag'
// This loads apolloClient.js in strapi-helper-plugin
import client from 'apolloClient'

const entityDefsQuery = gql`
    {
        entityDefinitions(where: { isAbstract: false }) {
            results {
                id
                label
                pluralLabel
            }
        }
    }
`

// This method is executed before the load of the plugin
const bootstrap = async plugin => {
    try {
        const { data, errors } = await client.query({ query: entityDefsQuery })
        if (errors) {
            console.error('Apollo error(s): ', JSON.stringify(errors))
            strapi.notification.error('content-manager.error.model.fetch')
            return plugin
        }
        const entityDefs = data.entityDefinitions.results
        plugin.leftMenuSections = [
            {
                name: 'Data Entities',
                links: entityDefs.map(entityDef => ({
                    label:
                        entityDef.pluralLabel ||
                        entityDef.label ||
                        entityDef.id,
                    destination: entityDef.id,
                })),
            },
        ]
    } catch (e) {
        console.error('Apollo error: ', e)
        strapi.notification.error('content-manager.error.model.fetch')
    }
    return plugin
}

export default bootstrap
