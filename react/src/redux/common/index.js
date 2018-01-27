import { CONFIRM } from './constants';

/**
|--------------------------------------------------
| confirm
|--------------------------------------------------
*/

export function confirm(title, message, buttons) {
  return {
    type: CONFIRM,
    confirmInfo: title ? { title, message, buttons } : null
  };
}
