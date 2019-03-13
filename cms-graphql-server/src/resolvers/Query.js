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

export const Query = {
    async entityDefinitions(_, { where, page, pageSize }) {
        if (page || pageSize) {
            throw Error(
                'entityDefinitions query does not yet support pagination'
            )
        }
        const entityDefFiles = (await fs.readdir(entityDefsDir)).filter(
            filename => filename.match(/\.json$/)
        )
        const allEntityDefs = await Promise.all(
            entityDefFiles.map(async filename => {
                const entityDefId = path.parse(filename).name
                return await loadEntityDef(entityDefId)
            })
        )
        // Filter by `where` conditions
        const conditions = where
        const results = conditions
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
            results,
            totalCount: entityDefFiles.length,
        }
    },

    entityDefinition(_, { id }) {
        return loadEntityDef(id)
    },

    async entities(_, { where }) {
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

async function loadEntityDef(id) {
    const entityDef = JSON.parse(
        await fs.readFile(path.join(entityDefsDir, id + '.json'), 'utf8')
    )
    // businessId is always the first property...we could store it too but that seems redundant, so we just add it here...
    entityDef.properties.unshift({
        __typename: 'LiteralPropertyDefinition',
        id: 'businessId',
        label: 'ID',
        dataType: 'string',
        readOnly: false,
    })
    return entityDef
}
