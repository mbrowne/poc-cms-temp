import fsModule from 'fs'
import path from 'path'
import config from '~/config'
import {
    prepareEntityDefForStorage,
    graphqlInputToBackendEntity,
    graphqlInputToBackendAssociations,
    backendEntityToGraphqlEntity,
} from './cms/utils'
import { entityRepository, associationRepository } from './cms/repositories'
const fs = fsModule.promises

const entityDefsDir = path.join(
    config.PROJECT_ROOT,
    'data',
    'entity-definitions'
)

// {
//     "initialState": [
//       {
//         "propertyId": "tagSubject",
//         "associationsValue": [
//           {
//             "destinationEntityId": "1234"
//           }
//         ]
//       }
//     ]
// }

export const Mutation = {
    createEntityDefinition(_, { entityDef }) {
        return saveEntityDefinition(entityDef)
    },

    updateEntityDefinition(_, { id, entityDef }) {
        return saveEntityDefinition(entityDef, id)
    },

    async createEntityRequest(_, args) {
        const entity = await graphqlInputToBackendEntity(args)

        // console.log('entity: ', entity)
        const id = await entityRepository.save(entity)

        const { associations } = await graphqlInputToBackendAssociations(
            id,
            args
        )
        await associationRepository.saveMultiple(associations)

        const moderationStatus = {
            entity: backendEntityToGraphqlEntity({ ...entity, id }),
            errorMessage: null,
        }
        return moderationStatus
    },

    async updateEntityRequest(_, args) {
        const existingEntity = await entityRepository.getById(args.entityId)
        const entity = await graphqlInputToBackendModel(args, existingEntity)
        // console.log('entity: ', entity)
        await entityRepository.save(entity)
        const moderationStatus = {
            entity: backendEntityToGraphqlEntity(entity),
            errorMessage: null,
        }
        return moderationStatus
    },

    async deleteEntityRequest(_, { entityId /*, entityDefId */ }) {
        const deletedEntity = await entityRepository.delete(entityId)
        console.log(`Successfully deleted entity ID '${entityId}'`)
        const moderationStatus = {
            entity: deletedEntity,
            errorMessage: null,
        }
        return moderationStatus
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
        // TEMP
        // ignore association and static assets properties until UI supports them
        // (to avoid overwriting changes manually made to the JSON)
        const nonLiteralProps = existingEntityDef.properties.filter(
            p => p.__typename !== 'LiteralProperty'
        )
        // const nonLiteralProps = {}
        // for (const p of nonLiteralPropsArray) {
        //     nonLiteralProps[p.id] = p
        // }

        // @NB in the real system we might not handle updates this way.
        // This always keeps all old properties unless they're overwritten.
        const updates = prepareEntityDefForStorage(entityDefInput)

        // TEMP
        updates.properties = [
            ...updates.properties.filter(
                p => p.__typename === 'LiteralProperty'
            ),
            ...nonLiteralProps,
        ]

        entityDef = {
            ...existingEntityDef,
            ...updates,
        }
        // entityDef = {
        //     ...existingEntityDef,
        //     ...prepareEntityDefForStorage(entityDefInput),
        // }
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
