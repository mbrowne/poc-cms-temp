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
loadAllEntityDefs()
    .then(defs => {
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
    })
    .catch(e => {
        console.error(e)
    })

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
        const { entityDefId } = where
        const templateDef = templateEntityDefsById[entityDefId]
        // Do other entity definitions inherit from this one?
        if (templateDef) {
            // If yes, fetch entities for all child types
            // TODO
        }

        const results = []
        for (const backendEntity of await entityRepository.find(where)) {
            results.push(await backendEntityToGraphqlEntity(backendEntity))
        }

        // const results = (await entityRepository.find(where)).map(
        //     backendEntityToGraphqlEntity
        // )
        return {
            results,
            totalCount: results.length,
        }

        // const totalCount = 0
        // return {
        //     results: [],
        //     totalCount,
        // }
    },

    async entity(_, { entityId /*, entityDefId */ }) {
        const result = await entityRepository.getById(entityId)
        return result ? await backendEntityToGraphqlEntity(result) : null
    },
}

async function loadAllEntityDefs() {
    const entityDefFiles = (await fs.readdir(entityDefsDir)).filter(filename =>
        filename.match(/\.json$/)
    )
    return await Promise.all(
        entityDefFiles.map(async filename => {
            const entityDefId = path.parse(filename).name
            return await loadEntityDef(entityDefId)
        })
    )
}

async function loadEntityDef(id) {
    const entityDef = JSON.parse(
        await fs.readFile(path.join(entityDefsDir, id + '.json'), 'utf8')
    )
    if (entityDef.templateEntityDefinitionId) {
        entityDef.templateEntityDefinition = await loadEntityDef(
            entityDef.templateEntityDefinitionId
        )
    }
    return entityDef
}
