import { keyBy } from 'lodash'

// Convert entity definition result from GraphQL to a format that's more easily usable in the client
export function convertEntityDefResult(entityDef) {
    return {
        ...entityDef,
        properties: keyBy(entityDef.properties, 'id'),
        // adminUiSettings: convertAdminUiSettings(entityDef.adminUiSettings),
    }
}

// export function convertAdminUiSettings(settings) {
//     return {
//         ...settings,
//         propertiesToShowOnListScreen: keyBy(
//             settings.propertiesToShowOnListScreen,
//             'id'
//         ),
//         propertiesToShowOnEditForm: keyBy(
//             settings.propertiesToShowOnEditForm,
//             'id'
//         ),
//     }
// }
