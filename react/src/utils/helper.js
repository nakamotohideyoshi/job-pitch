import { message } from 'antd';
import DATA from './data';

/**
|--------------------------------------------------
| logo image
|--------------------------------------------------
*/

const defaultLogo = require('assets/default_logo.jpg');

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

/**
|--------------------------------------------------
| pitch
|--------------------------------------------------
*/

export function getPitch(object) {
  if (!object) return null;

  const pitches = object.pitches || object.videos;
  if (!pitches || !pitches.length) return null;

  for (let i = 0; i < pitches.length; i++) {
    const pitch = pitches[i];
    if (pitch.video) {
      return pitch;
    }
  }

  return null;
}

/**
|--------------------------------------------------
| name
|--------------------------------------------------
*/

export function getFullBWName(job) {
  return `${job.location_data.business_data.name} / ${job.location_data.name}`;
}

export function getFullJSName(jobSeeker) {
  return `${jobSeeker.first_name} ${jobSeeker.last_name}`;
}

/**
|--------------------------------------------------
| distance
|--------------------------------------------------
*/

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

/**
|--------------------------------------------------
| get item
|--------------------------------------------------
*/

export function getItemByID(objects, id) {
  return (objects || []).filter(item => item.id === id)[0];
}

export function getNameByID(key, id) {
  return (getItemByID(DATA[key], id) || {}).name;
}

/**
|--------------------------------------------------
| localstorage
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

export function addObj(objects, obj) {
  if (Array.isArray(objects)) {
    const newObject = objects.slice(0);
    newObject.push(obj);
    return newObject;
  }
  return objects;
}

export function updateObj(object, updateInfo) {
  if (Array.isArray(object)) {
    return object.map(item => (item.id === updateInfo.id ? updateObj(item, updateInfo) : item));
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

export function sort(arr, key) {
  arr.sort((a, b) => {
    let a1 = a[key];
    let b1 = b[key];
    if (typeof a1 === 'string') {
      a1 = a1.toUpperCase();
      b1 = b1.toUpperCase();
      if (a1 < b1) {
        return -1;
      }
      if (a1 > b1) {
        return 1;
      }
      return 0;
    }

    return 0;
  });
}

/**
|--------------------------------------------------
| form
|--------------------------------------------------
*/

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

/**
|--------------------------------------------------
| url params
|--------------------------------------------------
*/

export function str2int(str) {
  const val = parseInt(str, 10);
  return isNaN(val) ? undefined : val;
}

// export function parseUrlParams(str) {
//   if (str[0] === '?') {
//     str = str.slice(1);
//   }

//   const params = {};
//   if (str !== '') {
//     str.split('&').forEach(str => {
//       const arr = str.split('=');
//       params[arr[0]] = arr[1];
//     });
//   }

//   return params;
// }

/* form helper */
