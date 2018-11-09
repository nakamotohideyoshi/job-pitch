import { createAction, handleActions } from 'redux-actions';

import * as helper from 'utils/helper';
import * as C from 'redux/constants';

// ------------------------------------
// Actions
// ------------------------------------

export const addBannerAction = createAction(C.ADD_BANNER);
export const removeBannerAction = createAction(C.REMOVE_BANNER);

// ------------------------------------
// Reducer
// ------------------------------------

const initialState = {
  banners: [],
  visibleFooter: true
};

export default handleActions(
  {
    [C.ADD_BANNER]: (state, { payload }) => ({
      ...state,
      banners: helper.updateItem(state.banners, payload, true)
    }),

    [C.REMOVE_BANNER]: (state, { payload }) => ({
      ...state,
      banners: helper.removeItem(state.banners, payload)
    }),

    [C.LOGOUT]: () => initialState
  },
  initialState
);
