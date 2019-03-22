import { GraphQLScalarType } from 'graphql'
import { GraphQLError } from 'graphql/error'
import Primitive from './Primitive'

/**
 * NOTE: We call it LiteralPropertyValueScalar rather than just LiteralPropertyValue
 * because PropertyValue is a union type and union types can't use scalars directly.
 * So in the schema we have this:
 
     type LiteralPropertyValue {
        value: LiteralPropertyValueScalar
    }
 */
const LiteralPropertyValueScalar = new GraphQLScalarType({
    name: 'LiteralPropertyValueScalar',
    description: 'A literal property value such as a string, integer, or date',
    serialize(val) {
        return Primitive.serialize(val)
    },
    parseValue(val) {
        return Primitive.parseValue(val)
    },
    parseLiteral(ast) {
        try {
            Primitive.parseLiteral(ast)
        } catch (e) {
            throw new GraphQLError(
                `Query error: Expected a literal property value type but got a: ${
                    ast.kind
                }`
            )
        }
        return ast.value
    },
})

export default LiteralPropertyValueScalar
