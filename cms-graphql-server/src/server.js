import Koa from 'koa'
import { ApolloServer } from 'apollo-server-koa'
import morgan from 'koa-morgan'
import typeDefs from './schema'
import * as resolvers from './resolvers'
import { initMongo } from './mongoDatabase'

const PORT = process.env.PORT || 8000

const server = new ApolloServer({ typeDefs, resolvers })

const app = new Koa()

app.use(
    morgan('common', {
        // immediate means to output on request instead of response
        immediate: true,
    })
)

server.applyMiddleware({ app })

initMongo()
    .then(() => {
        app.listen({ port: PORT }, () => {
            console.log(
                `🚀 Server ready at http://localhost:${PORT}${
                    server.graphqlPath
                }`
            )
        })
    })
    .catch(e => {
        console.error(e)
    })
