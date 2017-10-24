import _ from 'lodash';
import cookie from 'js-cookie';
import ApiClient from 'helpers/ApiClient';

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

/* cookie data */

// export function get

export function getCookie(key) {
  return cookie.get(key);
}

export function setCookie(key, value) {
  if (value !== undefined) {
    cookie.set(key, value);
  } else {
    cookie.remove(key);
  }
}

export function getShared(key) {
  return cookie.get(`${getCookie('email')}_${key}`);
}

export function setShared(key, value) {
  key = `${getCookie('email')}_${key}`;
  if (value !== undefined) {
    cookie.set(key, value);
  } else {
    cookie.remove(key);
  }
}

/* logo image */

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


/* date time */

export function getTimeString(date) {
  const options = {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };
  return date.toLocaleTimeString('en-us', options);
}


/* distance */

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}

export function getDistanceFromLatLon(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);  // deg2rad below
  const dLon = deg2rad(lon2 - lon1);
  const a = (Math.sin(dLat / 2) * Math.sin(dLat / 2)) +
    (Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2));
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

export function getJobFullName(job) {
  return `${job.location_data.business_data.name} / ${job.location_data.name}`;
}

export function getJobSeekerImg(jobSeeker) {
  if (!jobSeeker || jobSeeker.pitches.length === 0) {
    return noImg;
  }
  return jobSeeker.pitches[0].thumbnail || noImg;
}

export function getJobSeekerFullName(jobSeeker) {
  return `${jobSeeker.first_name} ${jobSeeker.last_name}`;
}

export function getItemByName(array, name) {
  return array.filter(item => item.name === name)[0];
}

export function getSexById(id) {
  return ApiClient.shared().sexes.filter(item => item.id === id)[0];
}

export function getApplicationStatusByName(name) {
  return ApiClient.shared().applicationStatuses.filter(item => item.name === name)[0];
}

export function getJobStatusByName(name) {
  return ApiClient.shared().jobStatuses.filter(item => item.name === name)[0];
}

export function getSectorById(id) {
  return ApiClient.shared().sectors.filter(item => item.id === id)[0];
}

export function getContractById(id) {
  return ApiClient.shared().contracts.filter(item => item.id === id)[0];
}

export function getHoursById(id) {
  return ApiClient.shared().hours.filter(item => item.id === id)[0];
}

export function getTempProducts() {
  const data = `[
    { "product_code": "product1", "tokens": 10, "price": 20 },
    { "product_code": "product2", "tokens": 20, "price": 30 },
    { "product_code": "product3", "tokens": 30, "price": 40 }
  ]`;
  return JSON.parse(data);
}
