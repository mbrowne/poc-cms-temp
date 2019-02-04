import Koa from 'koa'
import { ApolloServer } from 'apollo-server-koa'
import typeDefs from './schema'
import * as resolvers from './resolvers'

const PORT = process.env.PORT || 8000

const server = new ApolloServer({ typeDefs, resolvers })

const app = new Koa()
server.applyMiddleware({ app })

app.listen({ port: PORT }, () =>
    console.log(
        `🚀 Server ready at http://localhost:${PORT}${server.graphqlPath}`
    )
)
