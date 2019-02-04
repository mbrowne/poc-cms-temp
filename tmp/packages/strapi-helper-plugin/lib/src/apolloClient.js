import ApolloClient from 'apollo-client'
import { InMemoryCache } from 'apollo-cache-inmemory'
// import { ApolloLink } from 'apollo-link'
import { HttpLink } from 'apollo-link-http'

const client = new ApolloClient({
    cache: new InMemoryCache(),
    link: new HttpLink({
        uri: process.env.GRAPHQL_SERVER_URI
    })
})

export default client
