import { useMutation } from 'react-apollo-hooks'
import * as queries from '../graphql/queries'

export function useDeleteEntityRequest() {
    const deleteEntityRequest = useMutation(queries.deleteEntityRequest)
    return async variables => {
        try {
            await deleteEntityRequest({
                variables,
                optimisticResponse: {
                    __typename: 'Mutation',
                    deleteEntityRequest: {
                        __typename: 'EntityModerationStatus',
                        entity: {
                            __typename: 'Entity',
                            id: variables.entityId,
                        },
                    },
                },
                // update cache so list screen is updated
                update: (proxy, { data: { deleteEntityRequest } }) => {
                    const { entityDefId } = variables
                    // read current cache data
                    const queryArgs = {
                        query: queries.entities,
                        variables: { entityDefId, where: { entityDefId } },
                    }
                    // This line was sometimes failing, but couldn't reproduce it to debug,
                    // so leaving as-is for now...
                    const data = proxy.readQuery(queryArgs)
                    // let data
                    // try {
                    //     data = proxy.readQuery(queryArgs)
                    //     console.log('data: ', data)
                    // } catch (e) {
                    //     console.log('e: ', e)
                    // }

                    // remove the entity from the results array
                    data.entities.results.splice(
                        data.entities.results.findIndex(
                            entity =>
                                entity.id === deleteEntityRequest.entity.id
                        ),
                        1
                    )
                    // write our data back to the cache
                    proxy.writeQuery({ ...queryArgs, data })
                },
            })
            strapi.notification.success('content-manager.success.record.delete')
        } catch (e) {
            console.error('Apollo error: ', e)
            strapi.notification.error('content-manager.error.record.delete')
        }
    }
}
