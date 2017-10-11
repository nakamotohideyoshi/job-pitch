import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { browserHistory } from 'react-router';
import { connect } from 'react-redux';
import Modal from 'react-bootstrap/lib/Modal';
import Button from 'react-bootstrap/lib/Button';
import NotificationSystem from 'react-notification-system';
import { Loading, Header, Footer } from 'components';
import ApiClient from 'helpers/ApiClient';
import * as utils from 'helpers/utils';
import * as commonActions from 'redux/modules/common';
import styles from './MainLayout.scss';

const homeMenus = [
  { id: 1, label: 'About', to: '/resources/about' },
  { id: 2, label: 'Help', to: '/resources/help' },
  { id: 3, label: 'Terms & Conditions', to: '/resources/terms' },
  { id: 10, label: 'Login', to: '/login', kind: 'right' },
];

const recruiterMenus = [
  { id: 1, label: 'Applications', to: '/recruiter/applications', permission: 1 },
  { id: 2, label: 'Jobs', to: '/recruiter/jobs', permission: 0 },
  { id: 3, label: 'Credit', to: '/recruiter/credits', permission: 1 },
  { id: 4, label: 'Messages', to: '/recruiter/messages', permission: 1 },
];

const jobseekerMenus = [
  {
    id: 1,
    label: 'Applications',
    permission: 2,
    menuData: [
      { id: 10, label: 'Find Job', to: '/jobseeker/find', permission: 2 },
      { id: 11, label: 'My Applications', to: '/jobseeker/myapplications', permission: 2 },
    ],
  },
  {
    id: 2,
    label: 'Profile',
    menuData: [
      { id: 20, label: 'My Profile', to: '/jobseeker/profile', permission: 0 },
      { id: 21, label: 'Record Pitch', to: '/jobseeker/record', permission: 1 },
      { id: 22, label: 'Job Profile', to: '/jobseeker/jobprofile', permission: 1 },
    ],
  },
  { id: 4, label: 'Messages', to: '/jobseeker/messages', permission: 2 },
];

const AuthPaths = [
  'select', 'password', 'recruiter', 'jobseeker'
];

@connect(
  state => ({
    permission: state.common.permission,
    alert: state.common.alert,
  }),
  { ...commonActions }
)
export default class MainLayout extends Component {
  static propTypes = {
    location: PropTypes.object.isRequired,
    permission: PropTypes.number.isRequired,
    setPermission: PropTypes.func.isRequired,
    alert: PropTypes.object,
    alertShow: PropTypes.func.isRequired,
    alertHide: PropTypes.func.isRequired,
    children: PropTypes.any.isRequired,
  };

  static defaultProps = {
    alert: null,
    pageInfo: null,
  }

  constructor(props) {
    super(props);
    this.state = {
      globalLoading: true,
    };
    this.api = ApiClient.shared();
  }

  componentDidMount() {
    this.checkPath(this.props.location.pathname).then(
      () => this.setState({ globalLoading: false }),
      () => {}
    );
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.location.pathname !== this.props.location.pathname) {
      // utils.clearNotifs();
      this.setState({ contentLoading: true });
      this.checkPath(nextProps.location.pathname).then(
        () => this.setState({ globalLoading: false, contentLoading: false }),
        () => {}
      );
    }
  }

  /* check path */

  checkPath = pathname => {
    this.rootPath = pathname.split('/')[1];

    // non auth

    if (!this.api.isLoggedIn()) {
      if (this.rootPath !== 'resources' && AuthPaths.indexOf(this.rootPath) !== -1) {
        return this.redirect('/login');
      }

      this.menuData = homeMenus;
      return Promise.resolve();
    }

    if (!utils.getCookie('email')) {
      return this.logout().then(Promise.reject());
    }

    // auth

    if (this.rootPath !== 'resources' && AuthPaths.indexOf(this.rootPath) === -1) {
      return this.redirect('/select');
    }

    if (this.api.initialTokens) {
      return this.checkUser();
    }
    return this.api.loadData().then(
      () => this.checkUser()
    );
  }

  checkUser = () => this.api.getUser()
    .then(user => {
      this.menuData = [{
        id: 10,
        label: utils.getCookie('email'),
        kind: 'right',
        menuData: [
          { id: 11, label: 'Change Password', to: '/password' },
          { id: 12, label: 'Logout', func: this.confirmLogout },
        ],
      }];
      if (user.businesses.length > 0) {
        return this.checkRcruiter();
      }

      if (user.job_seeker) {
        return this.api.getJobSeekers(`${user.job_seeker}/`).then(
          jobSeeker => {
            this.api.jobSeeker = jobSeeker;
            return this.checkJobSeeker();
          }
        );
      }

      const userType = utils.getShared('usertype');
      if (userType === 'recruiter') {
        return this.checkRcruiter();
      }

      if (userType === 'jobseeker') {
        return this.checkJobSeeker();
      }

      if (this.rootPath !== 'select') {
        return this.redirect('/select');
      }

      return Promise.resolve();
    });

  checkRcruiter = () => {
    const { user } = this.api;

    this.menuData = this.menuData.concat(recruiterMenus);
    const permission = user.businesses.length > 0 ? 1 : 0;
    const currentItem = this.findMenuItem(this.menuData);
    if (currentItem && permission < currentItem.permission) {
      return this.redirect('/recruiter/jobs');
    }

    if (this.rootPath === 'select') {
      return this.redirect(permission === 0 ? '/recruiter/jobs' : '/recruiter/applications');
    }

    this.props.setPermission(permission);
    return Promise.resolve();
  }

  checkJobSeeker = () => {
    const { jobSeeker } = this.api;

    this.menuData = this.menuData.concat(jobseekerMenus);
    let permission = 0;
    if (jobSeeker) {
      permission = jobSeeker.profile ? 2 : 1;
    }
    const currentItem = this.findMenuItem(this.menuData);
    if (currentItem && permission < currentItem.permission) {
      return this.redirect(permission === 0 ? '/jobseeker/profile' : '/jobseeker/jobprofile');
    }

    if (this.rootPath === 'select') {
      if (permission === 0) {
        return this.redirect('/jobseeker/profile');
      }
      if (permission === 1) {
        return this.redirect('/jobseeker/jobprofile');
      }
      return this.redirect('/jobseeker/find');
    }

    this.props.setPermission(permission);
    return Promise.resolve();
  };

  redirect = (path) => {
    browserHistory.push(path);
    return Promise.reject();
  }

  findMenuItem = (menuItems) => {
    for (let i = 0; i < menuItems.length; i++) {
      const item = menuItems[i];
      if (item.submenu) {
        const subitem = this.findMenuItem(item.submenu);
        if (subitem) return subitem;
      } else if (this.props.location.pathname === item.to) {
        return item;
      }
    }
    return null;
  }

  /* logout */

  confirmLogout = () => {
    this.props.alertShow(
      'Confirm',
      'Are you sure you want to log out?',
      [
        { label: 'Cancel' },
        {
          label: 'Log Out',
          style: 'success',
          callback: () => this.logout()
        }
      ]
    );
  };

  logout = () => this.api.logout().then(
    () => {
      utils.setShared('usertype');
      utils.setShared('first-time');
      browserHistory.push('/login');
    }
  );

  /* alert */

  alertCallback = callback => {
    this.props.alertHide();
    if (callback) {
      callback();
    }
  }

  render() {
    const { globalLoading, contentLoading } = this.state;

    if (globalLoading) {
      return <Loading />;
    }

    const { children, alert, location, permission } = this.props;
    const { pathname } = location;

    return (
      <div className={styles.root}>

        <Header
          pathname={pathname}
          menuData={this.menuData}
          permission={permission}
        />

        <div className={styles.content}>
          { contentLoading ? <Loading /> : children }
        </div>

        {
          (pathname !== '/recruiter/messages' && pathname !== '/jobseeker/messages') && <Footer />
        }

        {
          alert && (
            <Modal
              show
              onHide={alert.cancel ? (() => this.alertCallback(alert.cancelCallback)) : (() => {})}>
              <Modal.Header closeButton={alert.cancel}>
                {
                  alert.title && (<Modal.Title>{alert.title}</Modal.Title>)
                }
              </Modal.Header>
              <Modal.Body>
                {
                  alert.message && (<p>{alert.message}</p>)
                }
              </Modal.Body>
              <Modal.Footer>
                {
                  alert.buttons.map(info => (
                    <Button
                      key={info.label}
                      bsStyle={info.style}
                      onClick={() => this.alertCallback(info.callback)}
                    >
                      {info.label}
                    </Button>
                  ))
                }
              </Modal.Footer>
            </Modal>
          )
        }

        <NotificationSystem ref={node => utils.setNotifSystem(node)} />

      </div>
    );
  }
}
