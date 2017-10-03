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

export function getWorkplaceLogo(workplace, thumb) {
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
  return getWorkplaceLogo(location_data, thumb);
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
  return jobSeeker.pitches[0].thumbnail;
}

export function getJobSeekerFullName(jobSeeker) {
  return `${jobSeeker.first_name} ${jobSeeker.last_name}`;
}

export function getItemByName(array, name) {
  return array.filter(item => item.name === name)[0];
}

export function getApplicationStatusByName(name) {
  return ApiClient.shared().applicationStatuses.filter(item => item.name === name)[0];
}

export function getSexById(id) {
  return ApiClient.shared().sexes.filter(item => item.id === id)[0];
}

export function getJobStatus(job) {
  const i = _.findIndex(ApiClient.shared().jobStatuses, { id: job.status });
  return ApiClient.shared().jobStatuses[i].name;
}

// export function getTempJobSeekers() {
//   const data = `[
//     {
//       "id": 1,
//       "user": 6,
//       "profile": 1,
//       "pitches": [
//           {
//               "id": 165,
//               "video": "http://s3-eu-west-1.amazonaws.com/mjp-android-encoded/https%3Awww.sclabs.co.uk/encoded/97fe92cf-9968-4523-93e8-414a5760cbaa.165.20170822105903-240043.mp4",
//               "thumbnail": "http://s3-eu-west-1.amazonaws.com/mjp-android-encoded/https%3Awww.sclabs.co.uk/encoded/97fe92cf-9968-4523-93e8-414a5760cbaa.165.20170822105903-240043-thumbs-00001.png"
//           }
//       ],
//       "email": "yj1@hotmail.com",
//       "first_name": "AAA",
//       "last_name": "VVVV",
//       "email_public": true,
//       "telephone": "11",
//       "telephone_public": true,
//       "mobile": "22",
//       "mobile_public": true,
//       "age": 11,
//       "age_public": true,
//       "sex_public": true,
//       "nationality_public": true,
//       "description": "Description",
//       "active": true,
//       "cv": "https://www.sclabs.co.uk/media/cv/2017/08/22/cv_file_uPLlzhA.jpg",
//       "has_references": true,
//       "truth_confirmation": true,
//       "created": "2016-07-18T07:21:34.122941Z",
//       "updated": "2017-08-22T10:28:19.025431Z",
//       "sex": 2,
//       "nationality": 4
//     },
//     {
//       "id": 3,
//       "user": 6,
//       "profile": 1,
//       "pitches": [
//           {
//               "id": 165,
//               "video": "http://s3-eu-west-1.amazonaws.com/mjp-android-encoded/https%3Awww.sclabs.co.uk/encoded/97fe92cf-9968-4523-93e8-414a5760cbaa.165.20170822105903-240043.mp4",
//               "thumbnail": "http://s3-eu-west-1.amazonaws.com/mjp-android-encoded/https%3Awww.sclabs.co.uk/encoded/97fe92cf-9968-4523-93e8-414a5760cbaa.165.20170822105903-240043-thumbs-00001.png"
//           }
//       ],
//       "email": "yj1@hotmail.com",
//       "first_name": "AA",
//       "last_name": "VCC",
//       "email_public": true,
//       "telephone": "11",
//       "telephone_public": true,
//       "mobile": "22",
//       "mobile_public": true,
//       "age": 11,
//       "age_public": true,
//       "sex_public": true,
//       "nationality_public": true,
//       "description": "Description",
//       "active": true,
//       "cv": "https://www.sclabs.co.uk/media/cv/2017/08/22/cv_file_uPLlzhA.jpg",
//       "has_references": true,
//       "truth_confirmation": true,
//       "created": "2016-07-18T07:21:34.122941Z",
//       "updated": "2017-08-22T10:28:19.025431Z",
//       "sex": 2,
//       "nationality": 4
//     }
//   ]`;
//   return JSON.parse(data);
// }

// export function getTempApplications() {
//   const data = `[
//     {
//       "id": 391,
//       "job_data": {
//           "id": 113,
//           "location_data": {
//               "id": 125,
//               "jobs": [
//                   113
//               ],
//               "longitude": 135.5021651834249,
//               "latitude": 34.69373791184302,
//               "images": [],
//               "business_data": {
//                   "id": 5,
//                   "users": [
//                       7
//                   ],
//                   "locations": [
//                       122,
//                       124,
//                       125,
//                       4,
//                       121
//                   ],
//                   "images": [],
//                   "name": "r1 com1",
//                   "created": "2016-07-18T08:09:05.766989Z",
//                   "updated": "2017-08-22T18:43:53.316547Z",
//                   "tokens": 69
//               },
//               "active_job_count": 1,
//               "name": "Gh",
//               "description": "Th",
//               "address": "",
//               "place_id": "",
//               "place_name": "1 Chome-3-20 Nakanoshima",
//               "postcode_lookup": "",
//               "email": "yr1@hotmail.com",
//               "email_public": true,
//               "telephone": "",
//               "telephone_public": true,
//               "mobile": "",
//               "mobile_public": true,
//               "created": "2017-05-02T18:19:58.648536Z",
//               "updated": "2017-05-02T18:19:58.648564Z",
//               "business": 5
//           },
//           "images": [],
//           "title": "Gh",
//           "description": "Gh",
//           "created": "2017-05-02T18:20:16.287928Z",
//           "updated": "2017-05-02T18:20:16.287962Z",
//           "sector": 3,
//           "location": 125,
//           "contract": 1,
//           "hours": 1,
//           "status": 2
//       },
//       "job_seeker": {
//           "id": 29,
//           "user": 42,
//           "profile": 22,
//           "pitches": [
//               {
//                   "id": 32,
//                   "video": "http://s3-eu-west-1.amazonaws.com/mjp-android-encoded/https%3Aec2-52-31-145-95.eu-west-1.compute.amazonaws.com/encoded/dcb48c5c-1c9e-4f26-8604-f0785cbcdf56.32.VID_20160808_044912-626891.mp4",
//                   "thumbnail": "http://s3-eu-west-1.amazonaws.com/mjp-android-encoded/https%3Aec2-52-31-145-95.eu-west-1.compute.amazonaws.com/encoded/dcb48c5c-1c9e-4f26-8604-f0785cbcdf56.32.VID_20160808_044912-626891-thumbs-00001.png"
//               }
//           ],
//           "email": "kkk1@hotmail.com",
//           "first_name": "DD",
//           "last_name": "a",
//           "email_public": true,
//           "telephone": "",
//           "telephone_public": true,
//           "mobile": "",
//           "mobile_public": true,
//           "age": null,
//           "age_public": true,
//           "sex_public": true,
//           "nationality_public": true,
//           "description": "aa",
//           "active": true,
//           "cv": "https://www.sclabs.co.uk/media/cv/2017/08/22/cv_file_uPLlzhA.jpg",
//           "has_references": true,
//           "truth_confirmation": true,
//           "created": "2016-08-08T08:45:46.251649Z",
//           "updated": "2016-08-08T08:47:38.939756Z",
//           "sex": null,
//           "nationality": null
//       },
//       "messages": [
//           {
//               "id": 462,
//               "system": true,
//               "content": "r1 com1 has expressed an interest in your profile for the following job:Job title: GhSector: Kitchen StaffContract: TemporaryHours: Temporary  Hours",
//               "read": false,
//               "created": "2017-06-28T16:53:36.095882Z",
//               "application": 392,
//               "from_role": 1
//           },
//           {
//               "id": 525,
//               "system": false,
//               "content": "Add",
//               "read": false,
//               "created": "2017-08-22T10:43:01.347537Z",
//               "application": 392,
//               "from_role": 1
//           },
//           {
//               "id": 526,
//               "system": false,
//               "content": "See",
//               "read": false,
//               "created": "2017-08-22T10:43:05.636866Z",
//               "application": 392,
//               "from_role": 1
//           }
//       ],
//       "shortlisted": false,
//       "created": "2017-06-28T16:53:36.089062Z",
//       "updated": "2017-06-28T16:53:36.089096Z",
//       "job": 113,
//       "created_by": 1,
//       "deleted_by": null,
//       "status": 1
//     },
//     {
//       "id": 392,
//       "job_data": {
//           "id": 113,
//           "location_data": {
//               "id": 125,
//               "jobs": [
//                   113
//               ],
//               "longitude": 135.5021651834249,
//               "latitude": 34.69373791184302,
//               "images": [],
//               "business_data": {
//                   "id": 5,
//                   "users": [
//                       7
//                   ],
//                   "locations": [
//                       122,
//                       124,
//                       125,
//                       4,
//                       121
//                   ],
//                   "images": [],
//                   "name": "r1 com1",
//                   "created": "2016-07-18T08:09:05.766989Z",
//                   "updated": "2017-08-22T18:43:53.316547Z",
//                   "tokens": 69
//               },
//               "active_job_count": 1,
//               "name": "Gh",
//               "description": "Th",
//               "address": "",
//               "place_id": "",
//               "place_name": "1 Chome-3-20 Nakanoshima",
//               "postcode_lookup": "",
//               "email": "yr1@hotmail.com",
//               "email_public": true,
//               "telephone": "",
//               "telephone_public": true,
//               "mobile": "",
//               "mobile_public": true,
//               "created": "2017-05-02T18:19:58.648536Z",
//               "updated": "2017-05-02T18:19:58.648564Z",
//               "business": 5
//           },
//           "images": [],
//           "title": "Gh",
//           "description": "Gh",
//           "created": "2017-05-02T18:20:16.287928Z",
//           "updated": "2017-05-02T18:20:16.287962Z",
//           "sector": 3,
//           "location": 125,
//           "contract": 1,
//           "hours": 1,
//           "status": 2
//       },
//       "job_seeker": {
//           "id": 29,
//           "user": 42,
//           "profile": 22,
//           "pitches": [
//               {
//                   "id": 32,
//                   "video": "http://s3-eu-west-1.amazonaws.com/mjp-android-encoded/https%3Aec2-52-31-145-95.eu-west-1.compute.amazonaws.com/encoded/dcb48c5c-1c9e-4f26-8604-f0785cbcdf56.32.VID_20160808_044912-626891.mp4",
//                   "thumbnail": "http://s3-eu-west-1.amazonaws.com/mjp-android-encoded/https%3Aec2-52-31-145-95.eu-west-1.compute.amazonaws.com/encoded/dcb48c5c-1c9e-4f26-8604-f0785cbcdf56.32.VID_20160808_044912-626891-thumbs-00001.png"
//               }
//           ],
//           "email": "kkk1@hotmail.com",
//           "first_name": "a",
//           "last_name": "a",
//           "email_public": true,
//           "telephone": "",
//           "telephone_public": true,
//           "mobile": "",
//           "mobile_public": true,
//           "age": null,
//           "age_public": true,
//           "sex_public": true,
//           "nationality_public": true,
//           "description": "aa",
//           "active": true,
//           "cv": "https://www.sclabs.co.uk/media/cv/2017/08/22/cv_file_uPLlzhA.jpg",
//           "has_references": true,
//           "truth_confirmation": true,
//           "created": "2016-08-08T08:45:46.251649Z",
//           "updated": "2016-08-08T08:47:38.939756Z",
//           "sex": null,
//           "nationality": null
//       },
//       "messages": [
//           {
//               "id": 462,
//               "system": true,
//               "content": "r1 com1 has expressed an interest in your profile for the following job:Job title: GhSector: Kitchen StaffContract: TemporaryHours: Temporary  Hours",
//               "read": false,
//               "created": "2017-06-28T16:53:36.095882Z",
//               "application": 392,
//               "from_role": 1
//           },
//           {
//               "id": 525,
//               "system": false,
//               "content": "Add",
//               "read": false,
//               "created": "2017-08-22T10:43:01.347537Z",
//               "application": 392,
//               "from_role": 1
//           },
//           {
//               "id": 526,
//               "system": false,
//               "content": "See",
//               "read": false,
//               "created": "2017-08-22T10:43:05.636866Z",
//               "application": 392,
//               "from_role": 1
//           }
//       ],
//       "shortlisted": false,
//       "created": "2017-06-28T16:53:36.089062Z",
//       "updated": "2017-06-28T16:53:36.089096Z",
//       "job": 113,
//       "created_by": 1,
//       "deleted_by": null,
//       "status": 2
//     },
//     {
//         "id": 430,
//         "job_data": {
//             "id": 113,
//             "location_data": {
//                 "id": 125,
//                 "jobs": [
//                     113
//                 ],
//                 "longitude": 135.5021651834249,
//                 "latitude": 34.69373791184302,
//                 "images": [],
//                 "business_data": {
//                     "id": 5,
//                     "users": [
//                         7
//                     ],
//                     "locations": [
//                         122,
//                         124,
//                         125,
//                         4,
//                         121
//                     ],
//                     "images": [],
//                     "name": "r1 com1",
//                     "created": "2016-07-18T08:09:05.766989Z",
//                     "updated": "2017-08-22T18:43:53.316547Z",
//                     "tokens": 69
//                 },
//                 "active_job_count": 1,
//                 "name": "Gh",
//                 "description": "Th",
//                 "address": "",
//                 "place_id": "",
//                 "place_name": "1 Chome-3-20 Nakanoshima",
//                 "postcode_lookup": "",
//                 "email": "yr1@hotmail.com",
//                 "email_public": true,
//                 "telephone": "",
//                 "telephone_public": true,
//                 "mobile": "",
//                 "mobile_public": true,
//                 "created": "2017-05-02T18:19:58.648536Z",
//                 "updated": "2017-05-02T18:19:58.648564Z",
//                 "business": 5
//             },
//             "images": [],
//             "title": "Gh",
//             "description": "Gh",
//             "created": "2017-05-02T18:20:16.287928Z",
//             "updated": "2017-05-02T18:20:16.287962Z",
//             "sector": 3,
//             "location": 125,
//             "contract": 1,
//             "hours": 1,
//             "status": 2
//         },
//         "job_seeker": {
//             "id": 79,
//             "user": 207,
//             "profile": 63,
//             "pitches": [
//                 {
//                     "id": 102,
//                     "video": "http://s3-eu-west-1.amazonaws.com/mjp-android-encoded/https%3Awww.sclabs.co.uk/encoded/a10a6bdb-769b-4b84-8840-9a42ccf8778b.102.photo0-124174.mp4",
//                     "thumbnail": "http://s3-eu-west-1.amazonaws.com/mjp-android-encoded/https%3Awww.sclabs.co.uk/encoded/a10a6bdb-769b-4b84-8840-9a42ccf8778b.102.photo0-124174-thumbs-00001.png"
//                 }
//             ],
//             "email": "nj33@hotmail.com",
//             "first_name": "Ff",
//             "last_name": "Fff",
//             "email_public": true,
//             "telephone": "",
//             "telephone_public": true,
//             "mobile": "",
//             "mobile_public": true,
//             "age": null,
//             "age_public": true,
//             "sex_public": true,
//             "nationality_public": true,
//             "description": "Ghh",
//             "active": true,
//             "cv": null,
//             "has_references": true,
//             "truth_confirmation": true,
//             "created": "2017-03-17T21:33:20.395989Z",
//             "updated": "2017-03-28T03:03:41.311354Z",
//             "sex": null,
//             "nationality": null
//         },
//         "messages": [
//             {
//                 "id": 522,
//                 "system": true,
//                 "content": "r1 com1 has expressed an interest in your profile for the following job:Job title: GhSector: Kitchen StaffContract: TemporaryHours: Temporary  Hours",
//                 "read": false,
//                 "created": "2017-08-22T10:31:20.490218Z",
//                 "application": 430,
//                 "from_role": 1
//             },
//             {
//                 "id": 524,
//                 "system": true,
//                 "content": "The recruiter has withdrawn their interest",
//                 "read": false,
//                 "created": "2017-08-22T10:38:18.746801Z",
//                 "application": 430,
//                 "from_role": 1
//             }
//         ],
//         "shortlisted": true,
//         "created": "2017-08-22T10:31:20.483174Z",
//         "updated": "2017-08-22T10:38:18.743961Z",
//         "job": 113,
//         "created_by": 1,
//         "deleted_by": 1,
//         "status": 2
//     }
//   ]`;
//   return JSON.parse(data);
// }

// export function getTempProducts() {
//   const data = `[
//     { "product_code": "product1", "tokens": 10, "price": 20 },
//     { "product_code": "product2", "tokens": 20, "price": 30 },
//     { "product_code": "product3", "tokens": 30, "price": 40 }
//   ]`;
//   return JSON.parse(data);
// }

// export function getTempJobs() {
//   const data = `[
//     {
//       "id": 133,
//       "location_data": {
//           "id": 4,
//           "jobs": [
//               133,
//               107,
//               55
//           ],
//           "longitude": 135.49950409680605,
//           "latitude": 34.68035130928161,
//           "images": [
//               {
//                   "image": "https://www.sclabs.co.uk/media/location/2017/05/01/upload_21675-393319521.png",
//                   "id": 42,
//                   "thumbnail": "https://www.sclabs.co.uk/media/location/2017/05/01/upload_21675-393319521_thumbnail.png"
//               }
//           ],
//           "business_data": {
//               "id": 5,
//               "users": [
//                   7
//               ],
//               "locations": [
//                   122,
//                   124,
//                   125,
//                   4,
//                   121
//               ],
//               "images": [],
//               "name": "r1 com1",
//               "created": "2016-07-18T08:09:05.766989Z",
//               "updated": "2017-08-22T18:43:53.316547Z",
//               "tokens": 69
//           },
//           "active_job_count": 3,
//           "name": "r1c1 w1 fhf yfyfyf ufjfk ufufufu",
//           "description": "ddddd",
//           "address": "",
//           "place_id": "ChIJ4eIGNFXmAGAR5y9q5G7BW8U",
//           "place_name": "4 Chome-1-11 Kyūtarōmachi",
//           "postcode_lookup": "",
//           "email": "yr1@hotmail.com",
//           "email_public": true,
//           "telephone": "",
//           "telephone_public": true,
//           "mobile": "",
//           "mobile_public": true,
//           "created": "2016-07-18T08:09:07.347029Z",
//           "updated": "2017-05-01T16:44:01.838701Z",
//           "business": 5
//       },
//       "images": [],
//       "title": "newnewnew",
//       "description": "aa",
//       "created": "2017-09-15T09:01:44.221082Z",
//       "updated": "2017-09-15T09:01:44.221104Z",
//       "sector": 9,
//       "location": 4,
//       "contract": 1,
//       "hours": 1,
//       "status": 1
//   },
//   {
//       "id": 113,
//       "location_data": {
//           "id": 125,
//           "jobs": [
//               113
//           ],
//           "longitude": 135.5021651834249,
//           "latitude": 34.69373791184302,
//           "images": [],
//           "business_data": {
//               "id": 5,
//               "users": [
//                   7
//               ],
//               "locations": [
//                   122,
//                   124,
//                   125,
//                   4,
//                   121
//               ],
//               "images": [],
//               "name": "r1 com1",
//               "created": "2016-07-18T08:09:05.766989Z",
//               "updated": "2017-08-22T18:43:53.316547Z",
//               "tokens": 69
//           },
//           "active_job_count": 1,
//           "name": "Gh",
//           "description": "Th",
//           "address": "",
//           "place_id": "",
//           "place_name": "1 Chome-3-20 Nakanoshima",
//           "postcode_lookup": "",
//           "email": "yr1@hotmail.com",
//           "email_public": true,
//           "telephone": "",
//           "telephone_public": true,
//           "mobile": "",
//           "mobile_public": true,
//           "created": "2017-05-02T18:19:58.648536Z",
//           "updated": "2017-05-02T18:19:58.648564Z",
//           "business": 5
//       },
//       "images": [],
//       "title": "Gh",
//       "description": "Gh",
//       "created": "2017-05-02T18:20:16.287928Z",
//       "updated": "2017-05-02T18:20:16.287962Z",
//       "sector": 3,
//       "location": 125,
//       "contract": 1,
//       "hours": 1,
//       "status": 1
//   }
//   ]`;
//   return JSON.parse(data);
// }
