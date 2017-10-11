const ALERT_SHOW = 'mjp/common/ALERT_SHOW';
const ALERT_HIDE = 'mjp/common/ALERT_HIDE';
const SET_PERMISSION = 'mjp/common/SET_PERMISSION';
const SET_VALUE = 'mjp/common/SET_VALUE';

const initialState = {
  shared: {},
  permission: 0,
};

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case ALERT_SHOW:
      return {
        ...state,
        alert: action.alert,
      };
    case ALERT_HIDE:
      return {
        ...state,
        alert: null,
      };
    case SET_PERMISSION:
      return {
        ...state,
        permission: action.permission,
      };
    case SET_VALUE:
      const { key, value } = action;
      return {
        ...state,
        shared: { ...state.shared, [key]: value },
      };
    default:
      return state;
  }
}

// alert

export function alertShow(title, message, buttons, cancel = true) {
  return { type: ALERT_SHOW, alert: { title, message, buttons, cancel } };
}

export function alertHide() {
  return { type: ALERT_HIDE };
}

// set permission

export function setPermission(permission) {
  return { type: SET_PERMISSION, permission };
}

// shared data

export function setData(key, value) {
  return { type: SET_VALUE, key, value };
}
