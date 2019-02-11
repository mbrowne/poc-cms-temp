/*
 *
 * ModelPage reducer
 *
 */

import { fromJS, Map, List } from 'immutable';
import { get, size, differenceBy, findIndex } from 'lodash';
import { storeData } from '../../utils/storeData';
/* eslint-disable new-cap */
import {
  ADD_ATTRIBUTE_RELATION_TO_CONTENT_TYPE,
  ADD_ATTRIBUTE_TO_CONTENT_TYPE,
  CANCEL_CHANGES,
  EDIT_CONTENT_TYPE_ATTRIBUTE,
  EDIT_CONTENT_TYPE_ATTRIBUTE_RELATION,
  DELETE_ATTRIBUTE,
  MODEL_FETCH_SUCCEEDED,
  POST_CONTENT_TYPE_SUCCEEDED,
  RESET_SHOW_BUTTONS_PROPS,
  SET_BUTTON_LOADER,
  SUBMIT_ACTION_SUCCEEDED,
  UNSET_BUTTON_LOADER,
  UPDATE_CONTENT_TYPE,
} from './constants';

const initialState = fromJS({
  didFetchModel: false,
  initialModel: Map({
    attributes: List(),
  }),
  model: Map({
    // TODO rename all remaining references to 'properties'
    attributes: List(),
    properties: List()
  }),
  postContentTypeSuccess: false,
  showButtons: false,
  modelLoading: true,
  showButtonLoader: false,
});

function modelPageReducer(state = initialState, action) {
  switch (action.type) {
    case ADD_ATTRIBUTE_RELATION_TO_CONTENT_TYPE:
      return state
        .updateIn(['model', 'attributes'], (list) => list.push(action.newAttribute, action.parallelAttribute))
        .set('showButtons', true);
    case ADD_ATTRIBUTE_TO_CONTENT_TYPE:
      return state
        .updateIn(['model', 'properties'], (list) => list.push(action.newAttribute))
        // .updateIn(['model', 'attributes'], (list) => list.push(action.newAttribute))
        .set('showButtons', true);
    case CANCEL_CHANGES:
      return state
        .set('showButtons', false)
        .set('model', state.get('initialModel'));
    case EDIT_CONTENT_TYPE_ATTRIBUTE: {
      if (action.shouldAddParralAttribute) {
        return state
          .set('showButtons', true)
          .updateIn(['model', 'properties', action.propPosition], () => action.modifiedProp)
          .updateIn(['model', 'properties'], (list) => list.splice(action.propPosition + 1, 0, action.parallelAttribute));
      }

      return state
        .set('showButtons', true)
        .updateIn(['model', 'properties', action.propPosition], () => action.modifiedProp);
    }
    case EDIT_CONTENT_TYPE_ATTRIBUTE_RELATION: {
      if (action.shouldRemoveParallelAttribute) {
        return state
          .set('showButtons', true)
          .updateIn(['model', 'attributes', action.attributePosition], () => action.modifiedAttribute)
          .updateIn(['model', 'attributes'], (list) => list.splice(action.parallelAttributePosition, 1));
      }
      return state
        .set('showButtons', true)
        .updateIn(['model', 'attributes', action.attributePosition], () => action.modifiedAttribute)
        .updateIn(['model', 'attributes', action.parallelAttributePosition], () => action.parallelAttribute);
    }
    case DELETE_ATTRIBUTE: {
      const contentTypeProperties = state.getIn(['model', 'properties']).toJS();
      contentTypeProperties.splice(action.position, 1);
      const updatedContentTypeProperties = contentTypeProperties;

      let showButtons = size(updatedContentTypeProperties) !== size(state.getIn(['initialModel', 'properties']).toJS())
        || size(differenceBy(state.getIn(['initialModel', 'properties']).toJS(), updatedContentTypeProperties, 'id')) > 0;

      if (get(storeData.getContentType(), 'id') === state.getIn(['initialModel', 'id'])) {
        showButtons = size(get(storeData.getContentType(), 'properties')) > 0;
      }

      if (action.shouldRemoveParallelAttribute) {
        const attributeKey = state.getIn(['model', 'properties', action.position]).strapiParams.key;

        return state
          .set('showButtons', showButtons)
          .updateIn(['model', 'properties'], (list) => list.splice(action.position, 1))
          .updateIn(['model', 'properties'], (list) => list.splice(findIndex(list.toJS(), ['id', attributeKey]), 1));
      }

      return state
        .set('showButtons', showButtons)
        .updateIn(['model', 'properties'], (list) => list.splice(action.position, 1));
    }
    case MODEL_FETCH_SUCCEEDED:
      // // TEMP
      // if (action.model.model.attributes) {
      //   for (const attr of action.model.model.attributes) {
      //     const { params } = attr
      //     delete attr.params
      //     attr.id = attr.name
      //     attr.strapiParams = params || {}
      //     attr.type = params.type
      //   }
      // }
      return state
        .set('didFetchModel', !state.get('didFetchModel'))
        .set('modelLoading', false)
        .set('model', Map(action.model.model))
        .set('initialModel', Map(action.model.model))
        .setIn(['model', 'properties'], List(action.model.model.properties))
        .setIn(['initialModel', 'properties'], List(action.model.model.properties));
    case POST_CONTENT_TYPE_SUCCEEDED:
      return state.set('postContentTypeSuccess', !state.get('postContentTypeSuccess'));
    case RESET_SHOW_BUTTONS_PROPS:
      return state.set('showButtons', false);
    case SET_BUTTON_LOADER:
      return state.set('showButtonLoader', true);
    case SUBMIT_ACTION_SUCCEEDED:
      return state.set('initialModel', state.get('model'));
    case UNSET_BUTTON_LOADER:
      return state.set('showButtonLoader', false);
    case UPDATE_CONTENT_TYPE:
      return state
        .set('model', Map(action.data))
        .set('initialModel', Map(action.data))
        .setIn(['model', 'attributes'], List(action.data.attributes))
        .setIn(['initialModel', 'attributes'], List(action.data.attributes));
    default:
      return state;
  }
}

export default modelPageReducer;
