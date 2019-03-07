import path from 'path'
import fsModule from 'fs'
import config from '~/config'
const fs = fsModule.promises

const entityDefsDir = path.join(
    config.PROJECT_ROOT,
    'data',
    'entity-definitions'
)

export const Query = {
    async entityDefinitions(_, { page, pageSize }) {
        if (page || pageSize) {
            throw Error(
                'entityDefinitions query does not yet support pagination'
            )
        }
        const entityDefFiles = (await fs.readdir(entityDefsDir)).filter(
            filename => filename.match(/\.json$/)
        )
        const results = await Promise.all(
            entityDefFiles.map(async filename => {
                const entityDefId = path.parse(filename).name
                return await loadEntityDef(entityDefId)
            })
        )

        return {
            results,
            totalCount: entityDefFiles.length,
        }
    },

    entityDefinition(_, { id }) {
        return loadEntityDef(id)
    },
}

async function loadEntityDef(id) {
    return JSON.parse(
        await fs.readFile(path.join(entityDefsDir, id + '.json'), 'utf8')
    )
}
