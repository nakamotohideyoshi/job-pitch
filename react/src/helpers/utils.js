import _ from 'lodash';

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


/* logo image */

const defaultLogo = require('assets/default_logo.jpg');
const noImg = require('assets/no_img.png');

function getImage(imageInfo, isThumb) {
  const { image, thumbnail } = imageInfo;
  return isThumb ? thumbnail : image;
}

export function getBusinessLogo(business, thumb) {
  if (!business || !business.images) {
    return defaultLogo;
  }
  const { images } = business;
  if (images.length > 0) {
    return getImage(images[0], thumb);
  }
  return defaultLogo;
}

export function getWorkPlaceLogo(workplace, thumb) {
  if (!workplace || !workplace.images) {
    return defaultLogo;
  }
  const { images, business_data } = workplace;
  if (images.length > 0) {
    return getImage(images[0], thumb);
  }
  return getBusinessLogo(business_data, thumb);
}

export function getJobLogo(job, thumb) {
  if (!job || !job.images) {
    return defaultLogo;
  }
  const { images, location_data } = job;
  if (images.length > 0) {
    return getImage(images[0], thumb);
  }
  return getWorkPlaceLogo(location_data, thumb);
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
  return `${job.location_data.business_data.name}, ${job.location_data.name}`;
}

export function getJobSeekerImg(jobSeeker) {
  if (!jobSeeker || jobSeeker.pitches.length === 0) {
    return noImg;
  }
  return jobSeeker.pitches[0].thumbnail;
}

export function getJobSeekerFullName(jobSeeker) {
  return `${jobSeeker.first_name} ${jobSeeker.last_name}`;
}

export function getItemById(array, id) {
  return array.filter(item => item.id === id)[0];
}

export function getItemByName(array, name) {
  return array.filter(item => item.name === name)[0];
}

export function getJobStatus(job, jobStatuses) {
  const i = _.findIndex(jobStatuses, { id: job.status });
  return jobStatuses[i].name;
}
