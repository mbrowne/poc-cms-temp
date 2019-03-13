import { entityRepository, associationRepository } from './repositories'
import { keyBy } from 'lodash'
import invariant from 'invariant'

// const propTypes = [
//     'literalProperty',
//     'associationProperty',
//     'staticAssetProperty',
// ]

// Transform the input data into the format we want to save in the JSON file
export function prepareEntityDefForStorage(inputObj) {
    if (!inputObj.properties) {
        return inputObj
    }
    const properties = inputObj.properties
        .filter(propInput => propInput.id !== 'businessId')
        .map(propInput => {
            // New approach: use `typename` field of PropertyInput type
            const { typename, ...propFields } = propInput
            return {
                __typename: typename,
                ...propFields,
            }

            // Old approach:
            // const hasPropTypeInput = propTypes.some(propType =>
            //     propInput.hasOwnProperty(propType)
            // )
            // if (!hasPropTypeInput) {
            //     const propType = 'LiteralPropertyDefinition'
            //     return {
            //         __typename: propType,
            //         ...propInput,
            //     }
            // } else {
            //     throw Error('TODO')
            // }
        })
    return { ...inputObj, properties }
}

// Transform input to the createEntityRequest or updateEntityRequest mutation
// to a representation of the entity matching our domain model for the backend
export function graphqlInputToBackendEntity(
    entityInput,
    existingBackendEntity = null
) {
    const { entityDefId } = entityInput
    // const entityDef = await Query.entityDefinition({}, { id: entityDefId })

    // If the entityInStorage argument was passed, then we we're updating an existing entity
    if (existingBackendEntity) {
        const { updatedState } = entityInput
        const entity = { ...existingBackendEntity }
        return buildBackendEntity(entity, updatedState)
    }

    const { initialState } = entityInput
    const entity = {
        id: null,
        entityDefId,
        state: {},
    }
    return buildBackendEntity(entity, initialState)
}

// Note: This only handles literal properties. Associations are handled elsewhere.
function buildBackendEntity(entity, stateInput) {
    const { ...state } = entity.state
    for (const propState of stateInput.filter(ps =>
        ps.hasOwnProperty('literalValue')
    )) {
        state[propState.propertyId] = propState.literalValue
    }
    return {
        ...entity,
        state,
    }
}

export function graphqlInputToBackendAssociations(
    sourceEntityId,
    entityInput,
    existingAssociations = []
) {
    invariant(
        typeof sourceEntityId === 'string',
        'sourceEntityId must be a string (not a MongoDB ObjectID or anything else)'
    )
    const { entityDefId } = entityInput
    // This function works the same way for creates and updates, with the exception that existingAssociations
    // is always an empty array when creating a new entity.
    const stateInput = entityInput.initialState || entityInput.updatedState
    const updatedAssocPropStates = stateInput.filter(ps =>
        // In order to indicate that all associations for a given property should be deleted, the graphql
        // input must explicitly set `associationsValue` to an empty array (to avoid ambiguity or accidental deletions).
        // That's why we use Array.isArray() here instead of just checking for existence of `associationsValue`.
        Array.isArray(ps.associationsValue)
    )
    const updatedAssocPropIds = updatedAssocPropStates.map(p => p.propertyId)

    // The combination of the source entity ID, association name, and destination entity ID
    // uniquely identifies the association
    const createUniqueKeyForAssoc = assoc => {
        const sourceEntityId = assoc.items.find(
            item => item.direction === 'source'
        ).entityId
        const destinationEntityId = assoc.items.find(
            item => item.direction === 'destination'
        ).entityId
        return `${sourceEntityId}.${
            assoc.associationDef.name
        }.${destinationEntityId}`
    }

    // create a map that can be used to compare existing associations with the current updates, so we know which
    // associations to delete (if any)
    const existingAssociationsMap = {}
    for (const existingAssoc of existingAssociations) {
        // we only care about associations for properties that are included in updatedState;
        // associations corresponding to properties that aren't being updated at all should be left alone
        const associationPropId = existingAssoc.associationDef.name
        if (updatedAssocPropIds.includes(associationPropId)) {
            existingAssociationsMap[
                createUniqueKeyForAssoc(existingAssoc)
            ] = existingAssoc
        }
    }

    const newAndUpdatedAssociationsMap = {}

    for (const propState of updatedAssocPropStates) {
        for (const assocInput of propState.associationsValue) {
            // For this POC, we're just storing Association Definitions as properties (like they are on the frontend),
            // so we don't have a real unique association definition ID.
            // So we generate a fake one here.
            const associationDefId = `'${
                propState.propertyId
            }' on '${entityDefId}'`
            const assoc = {
                // Note: This is not the full AssociationDefinition, just the properties we need to store for the purposes of this POC
                associationDef: {
                    id: associationDefId,
                    name: propState.propertyId,
                },
                items: [
                    {
                        direction: 'source',
                        entityId: sourceEntityId,
                    },
                    {
                        direction: 'destination',
                        entityId: assocInput.destinationEntityId,
                    },
                ],
            }
            const key = createUniqueKeyForAssoc(assoc)
            const existingAssoc = existingAssociationsMap[key]
            if (existingAssoc) {
                assoc.id = existingAssoc.id
            }
            newAndUpdatedAssociationsMap[key] = assoc
        }
    }

    const oldAssociationIdsToDelete = []
    for (const key in existingAssociationsMap) {
        if (!newAndUpdatedAssociationsMap.hasOwnProperty(key)) {
            oldAssociationIdsToDelete.push(existingAssociationsMap[key].id)
        }
    }

    return {
        associations: Object.values(newAndUpdatedAssociationsMap),
        oldAssociationIdsToDelete,
    }
}

export async function backendEntityToGraphqlEntity(backendEntity) {
    const literalState = Object.entries(backendEntity.state).map(
        ([propertyId, value]) => ({
            propertyId,
            value: {
                __typename: 'LiteralPropertyValue',
                value,
            },
        })
    )

    const getDestinationEntityId = backendAssoc =>
        backendAssoc.items.find(item => item.direction === 'destination')
            .entityId

    const backendAssociations = await associationRepository.findBySourceEntityId(
        backendEntity.id
    )

    // associations to be returned, indexed by property ID
    const assocMap = {}
    for (const backendAssoc of backendAssociations) {
        const propertyId = backendAssoc.associationDef.name
        let associationsForThisProp = assocMap[propertyId]
        if (!associationsForThisProp) {
            associationsForThisProp = []
            assocMap[propertyId] = associationsForThisProp
        }
        associationsForThisProp.push(backendAssoc)
    }

    // get all associated entities and map by ID
    const associatedEntityIds = backendAssociations.map(assoc =>
        getDestinationEntityId(assoc)
    )

    const allAssociatedEntities = await entityRepository.getMultipleById(
        associatedEntityIds
    )
    const associatedEntitiesById = keyBy(allAssociatedEntities, 'id')

    // convert assocMap to an array of PropertyState objects
    const assocState = Object.entries(assocMap).map(
        ([propertyId, backendAssociations]) => {
            return {
                propertyId,
                value: {
                    __typename: 'Associations',
                    associations: backendAssociations.map(backendAssoc => ({
                        id: backendAssoc.id,
                        destinationEntity:
                            associatedEntitiesById[
                                getDestinationEntityId(backendAssoc)
                            ],
                    })),
                },
            }
        }
    )

    return {
        ...backendEntity,
        state: [...literalState, ...assocState],
    }
}
