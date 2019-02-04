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
    createEntityDefinition(_, { entityDef }) {
        return saveEntityDefinition(entityDef, 'create')
    },

    updateEntityDefinition(_, { entityDef }) {
        return saveEntityDefinition(entityDef, 'update')
    },
}

async function saveEntityDefinition(
    entityDefInput,
    mode = 'create' /* 'create' | 'update' */
) {
    const jsonPath = path.join(entityDefsDir, entityDefInput.id + '.json')
    let existingEntityDef
    try {
        const fileData = await fs.readFile(jsonPath, 'utf8')
        if (mode === 'create') {
            throw Error(
                `Entity definition with ID '${
                    entityDefInput.id
                }' already exists`
            )
        }
        existingEntityDef = JSON.parse(fileData)
    } catch (e) {
        if (mode === 'update') {
            throw Error(
                `Entity definition with ID '${entityDefInput.id}' not found`
            )
        }
    }

    let entityDef
    if (mode === 'create') {
        entityDef = prepareEntityDefForStorage(entityDefInput)
    } else {
        // @NB in the real system we might not handle updates this way.
        // This always keeps all old properties unless they're overwritten.
        entityDef = {
            ...existingEntityDef,
            ...prepareEntityDefForStorage(entityDefInput),
        }
    }

    await fs.writeFile(
        jsonPath,
        JSON.stringify(entityDef, undefined, 2),
        'utf8'
    )

    const createdOrUpdated = mode === 'create' ? 'Created' : 'Updated'
    console.info(`${createdOrUpdated} entity definition successfully`)

    const moderationStatus = {
        entityDef,
        errorMessage: null,
    }
    return moderationStatus
}
