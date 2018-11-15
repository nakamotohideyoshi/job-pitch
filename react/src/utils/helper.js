import { message } from 'antd';
import DATA from 'utils/data';

/**
|--------------------------------------------------
| job info
|--------------------------------------------------
*/

export function getBusinessLogo(business) {
  const { images } = business || {};

  if (!(images || []).length) {
    return require('assets/job_logo.jpg');
  }

  return images[0].thumbnail;
}

export function getWorkplaceLogo(workplace) {
  const { images, business_data } = workplace || {};

  if (!images) {
    return require('assets/job_logo.jpg');
  }

  return (images[0] || {}).thumbnail || getBusinessLogo(business_data);
}

export function getJobLogo(job) {
  const { images, location_data } = job || {};

  if (!images) {
    return require('assets/job_logo.jpg');
  }

  return (images[0] || {}).thumbnail || getWorkplaceLogo(location_data);
}

export function getJobSubName(job) {
  return `${job.location_data.business_data.name}, ${job.location_data.name}`;
}

/**
|--------------------------------------------------
| get pitch
|--------------------------------------------------
*/

export function getPitch(object) {
  if (!object) return undefined;

  const pitches = object.pitches || object.videos;
  return (pitches || []).filter(({ video }) => video)[0];
}

/**
|--------------------------------------------------
| get user info
|--------------------------------------------------
*/

export function getFullName(user) {
  if (!user) return undefined;

  return `${user.first_name} ${user.last_name}`;
}

export function getAvatar(user) {
  if (user) {
    if (user.profile_thumb) {
      return user.profile_thumb;
    }

    const pitch = getPitch(user);
    if (pitch) {
      return pitch.thumbnail;
    }
  }

  return require('assets/avatar.png');
}

/**
|--------------------------------------------------
| item
|--------------------------------------------------
*/

export function getItemById(objects, id) {
  return (objects || []).filter(item => item.id === id)[0];
}

export function getNameByID(objects, id) {
  return (getItemById(objects, id) || {}).name;
}

export function getIdByName(objects, name) {
  return ((objects || []).filter(item => item.name === name)[0] || {}).id;
}

export function updateItem(objects, newItem, addMode) {
  let items = objects || [];

  if (addMode) {
    if (!getItemById(items, newItem.id)) {
      items = items.slice(0);
      items.unshift(newItem);
      return items;
    }
  }

  return items.map(item => (item.id === newItem.id ? { ...item, ...newItem } : item));
}

export function removeItem(objects, id) {
  return (objects || []).filter(item => item.id !== id);
}

export function sort(objects, key) {
  objects.sort((a, b) => {
    let a1 = a[key];
    let b1 = b[key];

    if (typeof a1 === 'string') {
      a1 = a1.toUpperCase();
      b1 = b1.toUpperCase();
    }

    if (a1 < b1) return -1;
    if (a1 > b1) return 1;
    return 0;
  });
}

/**
|--------------------------------------------------
| localstorage
|--------------------------------------------------
*/

export function saveData(key, value) {
  const k = `${DATA.email}_${key}`;
  if (value) {
    localStorage.setItem(k, value);
  } else {
    localStorage.removeItem(k);
  }
}

export function loadData(key) {
  const value = localStorage.getItem(`${DATA.email}_${key}`);
  return value && JSON.parse(value);
}

/**
|--------------------------------------------------
| form
|--------------------------------------------------
*/

export function setErrors(form, errors, values) {
  Object.keys(errors).forEach(key => {
    const error = errors[key];
    if (values[key]) {
      form.setFields({
        [key]: {
          value: values[key],
          errors: [new Error(typeof error === 'string' ? error : error[0])]
        }
      });
    } else {
      error.forEach(msg => message.error(msg));
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

// export function parseUrlParams(data) {
//   const params = {};
//   let str = data[0] === '?' ? data.slice(1) : data;
//   if (str !== '') {
//     str.split('&').forEach(str => {
//       const arr = str.split('=');
//       params[arr[0]] = arr[1];
//     });
//   }

//   return params;
// }

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
| check string (email and phone number)
|--------------------------------------------------
*/

export function checkIfEmailInString(str) {
  const re = /(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))/;
  return re.test(str);
}

export function checkIfPhoneNumberInString(str) {
  return /\d{7,}/.test(str.replace(/[\s-]/g, ''));
}
