import fs from 'fs'
import path from 'path'
import { parse } from 'graphql'

// read all .gql files in this directory and return their contents
// as an array of strings
const schemaDir = path.join(__dirname, 'schema')
const typeDefs = fs
    .readdirSync(schemaDir)
    .filter(filename => filename.match(/\.gql$/))
    .map(filename => {
        return fs.readFileSync(path.join(schemaDir, filename), 'utf8').trim()
    })
    .join('\n')

export default parse(typeDefs)
