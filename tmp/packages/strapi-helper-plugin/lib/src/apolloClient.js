import ApolloClient from 'apollo-client'
import { InMemoryCache } from 'apollo-cache-inmemory'
// import { ApolloLink } from 'apollo-link'
import { HttpLink } from 'apollo-link-http'
import { restoreApolloClientState } from 'hooks/useApolloStateUpdate'

const cache = new InMemoryCache()

const client = new ApolloClient({
    cache,
    link: new HttpLink({
        uri: process.env.GRAPHQL_SERVER_URI,
    }),
    resolvers: {},
})

const defaultState = {}
restoreApolloClientState(client, defaultState)

export default client
