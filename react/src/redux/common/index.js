import { createAction, handleActions } from 'redux-actions';
import * as C from 'redux/constants';
import * as helper from 'utils/helper';

// ------------------------------------
// Actions
// ------------------------------------

export const addBanner = createAction(C.ADD_BANNER);
export const removeBanner = createAction(C.REMOVE_BANNER);
export const showFooter = createAction(C.SHOW_FOOTER);

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

    [C.SHOW_FOOTER]: (state, { payload }) => ({
      ...state,
      visibleFooter: payload
    }),

    [C.LOGOUT]: () => initialState
  },
  initialState
);
