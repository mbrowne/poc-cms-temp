'use strict'

// Node.js core
const path = require('path')
const fs = require('fs')

// Public node modules.
const _ = require('lodash')
const shell = require('shelljs')

// Define files/dir paths
const pluginsDirPath = path.join(process.cwd(), 'plugins')

// artnet added - BEGIN

console.log('🔸  Creating symlinks...')

// try {
//     fs.symlinkSync('../strapi', './node_modules/strapi')
// } catch (e) {
//     if (e.code !== 'EEXIST') {
//         throw e
//     }
// }

// Create plugins directory
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

// Set up standard hooks
const standardHooks = ['mongoose']

for (const hookName of standardHooks) {
    const pkgName = `strapi-hook-${hookName}`
    try {
        fs.symlinkSync(
            `../../${pkgName}`,
            `./node_modules/${pkgName}`
        )
    } catch (e) {
        if (e.code !== 'EEXIST') {
            throw e
        }
    }
}

console.log('✅  Success')

// artnet added - END

// The rest of this file is mostly just copied and pasted from packages/strapi/utils/post-install.js

const installCmd = 'yarn install --production --ignore-scripts'

try {
    // Check if path is existing.
    fs.accessSync(pluginsDirPath, fs.constants.R_OK | fs.constants.W_OK)

    const plugins = fs.readdirSync(pluginsDirPath).filter(x => x[0] !== '.')

    // Install dependencies for each plugins
    _.forEach(plugins, plugin => {
        const pluginPath = path.join(pluginsDirPath, plugin)

        console.log(`🔸  Plugin - ${_.upperFirst(plugin)}`)
        console.log('📦  Installing packages...')

        try {
            shell.cd(pluginPath)
            const install = shell.exec(installCmd, { silent: true })

            if (install.stderr && install.code !== 0) {
                console.error(install.stderr)
                process.exit(1)
            }

            console.log('✅  Success')
            console.log('')
        } catch (err) {
            console.log(err)
        }
    })
} catch (e) {
    if (e.code === 'ENOENT') {
        console.log('✅  Success')
        console.log('')
    } else {
        console.log(e)
    }
}


