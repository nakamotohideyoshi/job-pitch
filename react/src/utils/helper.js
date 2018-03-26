import { message } from 'antd';
import DATA from './data';
// import { FormComponent } from 'components';

// import cookie from 'js-cookie';
// import ApiClient from 'utils/ApiClient';

/* nitification system */

let notifSystem;
export function setNotifSystem(ns) {
  notifSystem = ns;
}
export function clearNotifs() {
  if (notifSystem) {
    notifSystem.clearNotifications();
  }
}
export function successNotif(msg) {
  if (notifSystem) {
    notifSystem.addNotification({ message: msg, level: 'success' });
  }
}
export function errorNotif(msg) {
  if (notifSystem) {
    notifSystem.addNotification({ message: msg, level: 'error' });
  }
}

// /* logo image */

const defaultLogo = require('assets/default_logo.jpg');
const noImg = require('assets/no_img.png');

function getImage(imageInfo, original) {
  return original ? imageInfo.image : imageInfo.thumbnail;
}

export function getBusinessLogo(business, original) {
  if (!business || !business.images) {
    return defaultLogo;
  }
  const { images } = business;
  if (images.length > 0) {
    return getImage(images[0], original);
  }
  return defaultLogo;
}

export function getWorkplaceLogo(workplace, original) {
  if (!workplace || !workplace.images) {
    return defaultLogo;
  }
  const { images, business_data } = workplace;
  if (images.length > 0) {
    return getImage(images[0], original);
  }
  return getBusinessLogo(business_data, original);
}

export function getJobLogo(job, original) {
  if (!job || !job.images) {
    return defaultLogo;
  }
  const { images, location_data } = job;
  if (images.length > 0) {
    return getImage(images[0], original);
  }
  return getWorkplaceLogo(location_data, original);
}

// /* date time */

// export function getTimeString(date) {
//   const options = {
//     month: 'short',
//     day: 'numeric',
//     hour: '2-digit',
//     minute: '2-digit'
//   };
//   return date.toLocaleTimeString('en-us', options);
// }

// /* distance */

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}

export function getDistanceFromLatLon(p1, p2) {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(p2.latitude - p1.latitude); // deg2rad below
  const dLon = deg2rad(p2.longitude - p1.longitude);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(p1.latitude)) * Math.cos(deg2rad(p1.latitude)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
}

export function getDistanceFromLatLonEx(p1, p2) {
  const d = getDistanceFromLatLon(p1, p2) * 1000;
  if (d < 1000) {
    return `${Math.floor(d)} m`;
  }
  if (d < 10000) {
    return `${Math.floor(d / 100) / 10} Km`;
  }
  return `${Math.floor(d / 1000)} m`;
}

/* name */

export function getFullBWName(job) {
  return `${job.location_data.business_data.name} / ${job.location_data.name}`;
}

export function getFullJSName(jobSeeker) {
  return `${jobSeeker.first_name} ${jobSeeker.last_name}`;
}

/**
|--------------------------------------------------
| get item
|--------------------------------------------------
*/

export function getIDByName(key, name) {
  return DATA[key].filter(item => item.name === name)[0].id;
}

export function getNameByID(key, id) {
  return (DATA[key].filter(item => item.id === id)[0] || {}).name;
}

export function getJobStatusByName(name) {
  return DATA.jobStatuses.filter(status => status.name === name)[0].id;
}

export function getItemByID(objects, id) {
  return objects.filter(item => item.id === id)[0];
}

/**
|--------------------------------------------------
| cache data
|--------------------------------------------------
*/

export function saveData(key, value) {
  const k = `${DATA.email}_${key}`;
  if (value === null || value === undefined) {
    localStorage.removeItem(k);
  } else {
    localStorage.setItem(k, value);
  }
}

export function loadData(key) {
  const value = localStorage.getItem(`${DATA.email}_${key}`);
  return JSON.parse(value);
}

/**
|--------------------------------------------------
| clone
|--------------------------------------------------
*/

export function cloneObj(object, updateInfo) {
  if (Array.isArray(object)) {
    const newObject = object.filter(item => item.id !== updateInfo.id);
    newObject.push(updateInfo);
    return newObject;
  }
  if (typeof object === 'object') {
    return Object.assign({}, object, updateInfo);
  }
  return object;
}

export function removeObj(object, id) {
  if (Array.isArray(object)) {
    return object.filter(item => item.id !== id);
  }
  return object;
}

/**
|--------------------------------------------------
| check form modify
|--------------------------------------------------
*/

// export function routePush(to, { history, confirm }) {
//   if (FormComponent.modified) {
//     confirm('Confirm', 'You did not save your changes.', [
//       { outline: true },
//       {
//         label: 'Ok',
//         color: 'green',
//         onClick: () => {
//           FormComponent.modified = false;
//           history.push(to);
//         }
//       }
//     ]);
//   } else {
//     history.push(to);
//   }
// }

export function str2int(str) {
  const val = parseInt(str, 10);
  return isNaN(val) ? null : val;
}

export function getPitch(jobseeker) {
  if (!jobseeker) return null;

  const { pitches } = jobseeker;
  if (!pitches || !pitches.length) return null;

  for (let i = 0; i < pitches.length; i++) {
    const pitch = pitches[i];
    if (pitch.video) {
      return pitch;
    }
  }

  return null;
}

export function parseUrlParams(str) {
  if (str[0] === '?') {
    str = str.slice(1);
  }

  const params = {};
  if (str !== '') {
    str.split('&').forEach(str => {
      const arr = str.split('=');
      params[arr[0]] = arr[1];
    });
  }

  return params;
}

/* form helper */

export function setErrors(form, errors, values) {
  Object.keys(errors).forEach(key => {
    if (values[key]) {
      form.setFields({
        [key]: {
          value: values[key],
          errors: [new Error(errors[key][0])]
        }
      });
    } else {
      errors[key].forEach(msg => message.error(msg));
    }
  });
}

export function getBase64(img, callback) {
  const reader = new FileReader();
  reader.addEventListener('load', () => callback(reader.result));
  reader.readAsDataURL(img);
}
