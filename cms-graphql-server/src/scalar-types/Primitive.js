import { GraphQLScalarType } from 'graphql'
import { Kind } from 'graphql/language'
import { GraphQLError } from 'graphql/error'
import assertErr from 'assert-err'

const primitiveAstKinds = [Kind.STRING, Kind.INT, Kind.FLOAT, Kind.BOOLEAN]

const Primitive = new GraphQLScalarType({
    name: 'Primitive',
    description: 'A primitive value such as a string, integer, or date',
    serialize(val) {
        return JSON.stringify(val)
    },
    parseValue(val) {
        return JSON.parse(val)
    },
    parseLiteral(ast) {
        assertErr(
            primitiveAstKinds.includes(ast.kind),
            GraphQLError,
            `Query error: Expected a primitive value type but got a: ${
                ast.kind
            }`,
            [ast]
        )
        return ast.value
    },
})

export default Primitive
