import path from 'path'
import fsModule from 'fs'
import config from '~/config'
import { entityRepository } from './cms/repositories'
import { backendEntityToGraphqlEntity } from './cms/utils'
const fs = fsModule.promises

const entityDefsDir = path.join(
    config.PROJECT_ROOT,
    'data',
    'entity-definitions'
)

// NB: Because we are loading entity defs here (for the purpose of resolving template entity types),
// if the inheritance structure is changed or a new template entity definition is added, the server
// will need to be restarted for the resolvers to pick up on it.
let templateEntityDefsById = {}
setTimeout(async () => {
    const defs = await loadAllEntityDefs()
    const childEntityDefs = defs.filter(def =>
        def.hasOwnProperty('templateEntityDefinition')
    )
    for (const def of childEntityDefs) {
        const templateDef = def.templateEntityDefinition
        if (!templateDef.childEntityDefs) {
            templateDef.childEntityDefs = {}
        }
        templateDef.childEntityDefs[def.id] = def
        templateEntityDefsById[templateDef.id] = templateDef
    }
}, 0)

export const Query = {
    async entityDefinitions(_, { where, page, pageSize }) {
        if (page || pageSize) {
            throw Error(
                'entityDefinitions query does not yet support pagination'
            )
        }
        const allEntityDefs = await loadAllEntityDefs()
        // Filter by `where` conditions
        const conditions = where
        const filtered = conditions
            ? allEntityDefs.filter(def => {
                  for (const [fieldName, val] of Object.entries(conditions)) {
                      if (def[fieldName] === val) {
                          return true
                      }
                  }
                  return false
              })
            : allEntityDefs

        return {
            results: filtered,
            totalCount: filtered.length,
        }
    },

    entityDefinition(_, { id }) {
        return loadEntityDef(id)
    },

    async entities(_, { where }) {
        const { entityDefId, ...queryConditions } = where
        const templateDef = templateEntityDefsById[entityDefId]
        // Do other entity definitions inherit from this one?
        if (templateDef) {
            // If yes, fetch entities for all child types
            queryConditions.entityDefId = Object.keys(
                templateDef.childEntityDefs
            )
        } else {
            queryConditions.entityDefId = entityDefId
        }

        const filtered = (await entityRepository.find(queryConditions)).map(
            backendEntityToGraphqlEntity
        )
        return {
            results: filtered,
            totalCount: filtered.length,
        }
    },

    async entity(_, { entityId /*, entityDefId */ }) {
        const result = await entityRepository.getById(entityId)
        return result ? await backendEntityToGraphqlEntity(result) : null
    },
}

// temporary cache - this allows us to ensure that the `templateEntityDefinition` property
// always points to the same object if it's the same entity definition
let loadedEntityDefs = {}

async function loadAllEntityDefs() {
    const entityDefFiles = (await fs.readdir(entityDefsDir)).filter(filename =>
        filename.match(/\.json$/)
    )

    // Loading entity defs one after another rather than using Promise.all()
    // so that caching logic (using `loadedEntityDefs`) works correctly
    const defs = []
    for (const filename of entityDefFiles) {
        const entityDefId = path.parse(filename).name
        defs.push(await loadEntityDef(entityDefId))
    }

    // const defs = await Promise.all(
    //     entityDefFiles.map(async filename => {
    //         const entityDefId = path.parse(filename).name
    //         return await loadEntityDef(entityDefId)
    //     })
    // )

    // clear the temporary cache
    loadedEntityDefs = {}
    return defs
}

async function loadEntityDef(id) {
    if (loadedEntityDefs.hasOwnProperty(id)) {
        return loadedEntityDefs[id]
    }

    const entityDef = JSON.parse(
        await fs.readFile(path.join(entityDefsDir, id + '.json'), 'utf8')
    )

    const { templateEntityDefinitionId } = entityDef
    if (templateEntityDefinitionId) {
        entityDef.templateEntityDefinition = await loadEntityDef(
            templateEntityDefinitionId
        )
    }

    loadedEntityDefs[id] = entityDef
    return entityDef
}
