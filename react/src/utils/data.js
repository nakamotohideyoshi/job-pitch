const ABOUT = { href: 'https://www.myjobpitch.com/about/', label: 'About' };
const HELP = { href: 'https://www.myjobpitch.com/what-is-my-job-pitch/', label: 'Help' };
const TERMS = { href: 'https://www.myjobpitch.com/about/terms/', label: 'Terms & Conditions' };
const SIGNIN = { to: '/auth', label: 'Sign in' };

const SELECT = { to: '/select' };
const PASSWORD = { to: '/password', label: 'Change Password', icon: 'key' };
const SIGNOUT = { to: 'signout', label: 'Sign out', icon: 'log out' };

const RC_JOBS = { to: '/recruiter/jobs/', label: 'Jobs' };
const RC_FIND = {
  to: '/recruiter/applications/',
  label: 'Find Talent',
  permission: 1
};
const RC_MSGS = { to: '/recruiter/messages/', label: 'Messages', permission: 1 };
const RC_CREDIT = {
  to: '/recruiter/credits',
  label: 'Credit',
  icon: 'payment',
  permission: 1
};
const RC_APPS = { to: '/recruiter/apps', label: '' };

const JS_PROFILE = {
  to: '/jobseeker/profile',
  label: 'My Profile',
  icon: 'user circle outline'
};
const JS_PITCH = {
  to: '/jobseeker/record',
  label: 'Record Pitch',
  icon: 'unmute',
  permission: 1
};
const JS_JOBPROFILE = {
  to: '/jobseeker/jobprofile',
  label: 'Job Profile',
  icon: 'signup',
  permission: 1
};
const JS_FIND = { to: '/jobseeker/find', label: 'Find Job', permission: 2 };
const JS_APPLICATIONS = {
  to: '/jobseeker/applications',
  label: 'My Applications',
  permission: 2
};
const JS_MSGS = { label: 'Messages', to: '/jobseeker/messages/', permission: 2 };

const HOME_MENU = {
  left: [ABOUT, HELP, TERMS],
  right: [SIGNIN]
};

const SELECT_MENU = {
  redirect: [SELECT],
  left: [],
  right: [{ label: 'email', items: [PASSWORD, {}, SIGNOUT] }]
};

const RECRUITER_MENU = {
  redirect: [RC_JOBS, RC_FIND, RC_APPS],
  left: [RC_FIND, RC_JOBS, RC_MSGS],
  right: [
    {
      label: 'email',
      items: [RC_CREDIT, PASSWORD, {}, SIGNOUT]
    }
  ]
};

const JOBSEEKER_MENU = {
  redirect: [JS_PROFILE, JS_JOBPROFILE, JS_FIND],
  left: [JS_FIND, JS_APPLICATIONS, JS_MSGS],
  right: [
    {
      label: 'email',
      items: [JS_PROFILE, JS_PITCH, JS_JOBPROFILE, PASSWORD, {}, SIGNOUT]
    }
  ]
};

export const MENU_DATA = {
  none: HOME_MENU,
  select: SELECT_MENU,
  recruiter: RECRUITER_MENU,
  jobseeker: JOBSEEKER_MENU
};

export const SDATA = {
  searchRadius: [
    { id: 1, name: '1 mile' },
    { id: 2, name: '2 miles' },
    { id: 5, name: '5 miles' },
    { id: 10, name: '10 miles' },
    { id: 50, name: '50 miles' }
  ]
};
