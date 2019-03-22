'use strict'

// Post-install script written by artnet.
// (Inspired by the official strapi setup, but written mostly from scratch.)

// Node.js core
const path = require('path')
const fs = require('fs')

// Public node modules.
const _ = require('lodash')
const shell = require('shelljs')

// Define files/dir paths
const pluginsDirPath = path.join(process.cwd(), 'plugins')

console.log('🔸  Creating symlinks...')

// Create plugins directory if it doesn't already exist
try {
    fs.mkdirSync(pluginsDirPath)
} catch (e) {
    if (e.code !== 'EEXIST') {
        throw e
    }
}

// Set up standard plugins
const standardPlugins = [
    'content-manager',
    'content-type-builder',
    'email',
    'settings-manager',
    'upload',
    'users-permissions',
]

// Create symlinks if they don't already exist
for (const pluginName of standardPlugins) {
    try {
        fs.symlinkSync(
            `../../strapi-plugin-${pluginName}`,
            `${pluginsDirPath}/${pluginName}`
        )
    } catch (e) {
        if (e.code !== 'EEXIST') {
            throw e
        }
    }
}

console.log('✅  Success')
