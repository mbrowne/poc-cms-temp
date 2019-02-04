// import fs from 'fs'
import path from 'path'
import config from '~/config'

const entityDefsDir = path.join(
    config.PROJECT_ROOT,
    'data',
    'entity-definitions'
)

export const Query = {
    async entityDefinition(_, { id }) {
        return await import(path.join(entityDefsDir, id + '.json'))
    },
}
