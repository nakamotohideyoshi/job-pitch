import localForage from 'localforage';
import { SDATA } from './data';
import { FormComponent } from 'components';

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

export function getDistanceFromLatLon(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1); // deg2rad below
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
}

export function getDistanceFromLatLonEx(lat1, lon1, lat2, lon2) {
  const d = getDistanceFromLatLon(lat1, lon1, lat2, lon2) * 1000;
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

export function getJobseekerImg(jobSeeker) {
  if (!jobSeeker || jobSeeker.pitches.length === 0) {
    return noImg;
  }
  return jobSeeker.pitches[0].thumbnail || noImg;
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
  return SDATA[key].filter(item => item.name === name)[0].id;
}

export function getNameByID(key, id) {
  return (SDATA[key].filter(item => item.id === id)[0] || {}).name;
}

export function getJobStatusByName(name) {
  return SDATA.jobStatuses.filter(status => status.name === name)[0].id;
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
  localForage.setItem(`${SDATA.user.email}_${key}`, value);
}

export function loadData(key) {
  return localForage.getItem(`${SDATA.user.email}_${key}`);
}

/**
|--------------------------------------------------
| clone
|--------------------------------------------------
*/

export function cloneObj(object, updateInfo) {
  if (Array.isArray(object)) {
    return object.map(item => (item.id === updateInfo.id ? cloneObj(item, updateInfo) : item));
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

export function routePush(to, { history, confirm }) {
  if (FormComponent.modified) {
    confirm('Confirm', 'You did not save your changes.', [
      { outline: true },
      {
        label: 'Ok',
        color: 'green',
        onClick: () => {
          FormComponent.modified = false;
          history.push(to);
        }
      }
    ]);
  } else {
    history.push(to);
  }
}

export function str2int(str) {
  const val = parseInt(str, 10);
  return isNaN(val) ? undefined : val;
}
