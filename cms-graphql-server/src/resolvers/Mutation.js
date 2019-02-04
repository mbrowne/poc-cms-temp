import fsModule from 'fs'
import path from 'path'
import config from '~/config'
const fs = fsModule.promises

const entityDefsDir = path.join(
    config.PROJECT_ROOT,
    'data',
    'entity-definitions'
)

const propTypes = [
    'literalProperty',
    'associationProperty',
    'staticAssetProperty',
]

// Transform the input data into the format we want to save in the JSON file
function prepareEntityDefForStorage(inputObj) {
    const properties = inputObj.properties.map(propInput => {
        const hasPropTypeInput = propTypes.some(propType =>
            propInput.hasOwnProperty(propType)
        )
        if (!hasPropTypeInput) {
            const propType = 'LiteralProperty'
            return {
                __typename: propType,
                ...propInput,
            }
        } else {
            throw Error('TODO')
        }
    })
    return { ...inputObj, properties }
}

export const Mutation = {
    async createEntityDefinition(_, { entityDef: entityDefInput }) {
        const jsonPath = path.join(entityDefsDir, entityDefInput.id + '.json')
        let fileExists = false
        try {
            await fs.access(jsonPath)
            fileExists = true
        } catch (e) {}

        if (fileExists) {
            throw Error(
                `Entity definition with ID '${
                    entityDefInput.id
                }' already exists`
            )
        }

        const entityDef = prepareEntityDefForStorage(entityDefInput)
        await fs.writeFile(
            jsonPath,
            JSON.stringify(entityDef, undefined, 2),
            'utf8'
        )
        console.info('Created entity definition successfully')

        const moderationStatus = {
            entityDef,
            errorMessage: null,
        }
        return moderationStatus
    },
}
