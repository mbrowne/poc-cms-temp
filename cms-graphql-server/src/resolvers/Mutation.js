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
    if (!inputObj.properties) {
        return inputObj
    }
    const properties = inputObj.properties.map(propInput => {
        // New approach: use `typename` field of PropertyInput type
        const { typename, ...propFields } = propInput
        return {
            __typename: typename,
            ...propFields,
        }

        // Old approach:
        // const hasPropTypeInput = propTypes.some(propType =>
        //     propInput.hasOwnProperty(propType)
        // )
        // if (!hasPropTypeInput) {
        //     const propType = 'LiteralProperty'
        //     return {
        //         __typename: propType,
        //         ...propInput,
        //     }
        // } else {
        //     throw Error('TODO')
        // }
    })
    return { ...inputObj, properties }
}

export const Mutation = {
    createEntityDefinition(_, { entityDef }) {
        return saveEntityDefinition(entityDef)
    },

    updateEntityDefinition(_, { id, entityDef }) {
        return saveEntityDefinition(entityDef, id)
    },
}

async function saveEntityDefinition(
    entityDefInput,
    existingEntityDefId = undefined
) {
    const mode = existingEntityDefId ? 'edit' : 'create'
    const jsonPathExisting = path.join(
        entityDefsDir,
        (existingEntityDefId || entityDefInput.id) + '.json'
    )
    let existingEntityDef
    try {
        const fileData = await fs.readFile(jsonPathExisting, 'utf8')
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
        if (!entityDefInput.properties) {
            throw Error('At least one property definition is required')
        }
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
        path.join(entityDefsDir, entityDefInput.id + '.json'),
        JSON.stringify(entityDef, undefined, 2),
        'utf8'
    )

    // @TODO ensure that case always matches before we get here so we don't need this check
    // (This will be necessary for the app to work correctly on case-sensitive file systems,
    // i.e. Linux)
    if (
        mode === 'edit' &&
        existingEntityDefId.toLowerCase() !== entityDef.id.toLowerCase()
    ) {
        // If the entity def ID was renamed, we also need to delete the old file
        await fs.unlink(jsonPathExisting)
    }

    const createdOrUpdated = mode === 'create' ? 'Created' : 'Updated'
    console.info(`${createdOrUpdated} entity definition successfully`)

    const moderationStatus = {
        entityDef,
        errorMessage: null,
    }
    return moderationStatus
}
