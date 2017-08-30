import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link, browserHistory } from 'react-router';
import { connect } from 'react-redux';
import cookie from 'js-cookie';
import Modal from 'react-bootstrap/lib/Modal';
import Button from 'react-bootstrap/lib/Button';
import Collapse from 'react-bootstrap/lib/Collapse';
import NotificationSystem from 'react-notification-system';
import { Loading } from 'components';
import * as utils from 'helpers/utils';
import * as commonActions from 'redux/modules/common';
import * as authActions from 'redux/modules/auth';
import styles from './MainLayout.scss';

const titleImage = require('assets/title.png');

const recruiterMenus = [
  { id: 1, label: 'Find Talent', icon: 'fa-search', to: '/recruiter/find', permission: 1 },
  { id: 2, label: 'Applications', icon: 'fa-id-badge', to: '/recruiter/applications', permission: 1 },
  { id: 3, label: 'Connections', icon: 'fa-handshake-o', to: '/recruiter/connections', permission: 1 },
  { id: 4, label: 'My Shortlist', icon: 'fa-tags', to: '/recruiter/shortlist', permission: 1 },
  { id: 5, label: 'Messages', icon: 'fa-comment-o', to: '/recruiter/messages', permission: 1 },
  { id: 6, label: 'Add Credit', icon: 'fa-credit-card', to: '/recruiter/credits', permission: 1 },
  { id: 7, label: 'Add or Edit Jobs', icon: 'fa-briefcase', to: '/recruiter/businesses', permission: 0 },
  { id: 8, label: 'Change Password', icon: 'fa-key', to: '/password', permission: 0 },
  { id: 9,
    label: 'Help',
    icon: 'fa-question-circle-o',
    submenu: [
      { id: 10, label: 'About', to: '/main_about', permission: 0 },
      { id: 11, label: 'How it works', to: '/recruiter/how', permission: 0 },
      { id: 12, label: 'T&C', to: '/main_terms', permission: 0 },
      { id: 13, label: 'Privacy Policy', to: '/main_privacy', permission: 0 },
    ]
  },
  { id: 14, label: 'Contact Us', icon: 'fa-envelope-o', to: '/contactus', permission: 0 },
];

const jobseekerMenus = [
  { id: 1, label: 'Find Job', icon: 'fa-search', to: '/jobseeker/find', permission: 2 },
  { id: 2, label: 'Applications', icon: 'fa-id-badge', to: '/jobseeker/applications', permission: 2 },
  { id: 3, label: 'Messages', icon: 'fa-comment-o', to: '/jobseeker/messages', permission: 2 },
  { id: 5, label: 'Job Profile', icon: 'fa-pencil-square-o', to: '/jobseeker/jobprofile', permission: 1 },
  { id: 7, label: 'Record Pitch', icon: 'fa-microphone', to: '/jobseeker/record', permission: 1 },
  { id: 6, label: 'Profile', icon: 'fa-user-o', to: '/jobseeker/profile', permission: 0 },
  { id: 8, label: 'Change Password', icon: 'fa-key', to: '/password', permission: 0 },
  { id: 9,
    label: 'Help',
    icon: 'fa-question-circle-o',
    submenu: [
      { id: 10, label: 'About', to: '/main_about', permission: 0 },
      { id: 11, label: 'How it works', to: '/jobseeker/how', permission: 0 },
      { id: 12, label: 'T&C', to: '/main_terms', permission: 0 },
      { id: 13, label: 'Privacy Policy', to: '/main_privacy', permission: 0 },
    ]
  },
  { id: 14, label: 'Contact Us', icon: 'fa-envelope-o', to: '/contactus', permission: 0 },
];

@connect(
  state => ({
    staticData: state.auth.staticData,
    permission: state.auth.permission,
    alert: state.common.alert,
  }),
  { ...authActions, ...commonActions }
)
export default class MainLayout extends Component {
  static propTypes = {
    location: PropTypes.object.isRequired,
    staticData: PropTypes.object.isRequired,
    getStaticData: PropTypes.func.isRequired,
    getUser: PropTypes.func.isRequired,
    permission: PropTypes.number.isRequired,
    setPermission: PropTypes.func.isRequired,
    getJobSeeker: PropTypes.func.isRequired,
    logout: PropTypes.func.isRequired,
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

    this.menuData = [];
    this.email = __CLIENT__ && localStorage.getItem('email');
    this.state = {
      // small: window.innerWidth < 768,
      // open: window.innerWidth >= 768,
      small: false,
      open: true,
      globalLoading: true,
    };
  }

  componentDidMount() {
    this.preprocess(true).then(permission => {
      this.props.setPermission(permission);
      this.setState({
        globalLoading: false,
      });
    }).catch(() => {});

    window.addEventListener('resize', this.updatedDimensions);
    this.updatedDimensions();
  }

  componentWillReceiveProps(nextProps) {
    if (!nextProps || nextProps.location.pathname !== this.props.location.pathname) {
      // utils.clearNotifs();
      this.preprocess(false).then(permission => {
        this.props.setPermission(permission);
        this.setState({
          globalLoading: false,
          loading: false,
        });
      }).catch(() => {});
    }
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.updatedDimensions);
  }

  updatedDimensions = () => {
    const small = window.innerWidth < 768;
    if (small !== this.state.small) {
      this.setState({
        small,
        open: !small,
      });
    }
  }

  toggleSidebar = () => {
    this.setState({ open: !this.state.open });
  };

  closeSidebar = () => this.setState({ open: false });

  /* check user */

  preprocess = first => {
    if (!first) {
      this.setState({ loading: true });
    }
    const token = cookie.get(__DEVELOPMENT__ ? 'token' : 'csrftoken');
    if (!token) {
      return this.redirect('/login');
    }
    const { getStaticData, staticData } = this.props;
    if (staticData.initialTokens) {
      return this.checkUser();
    }
    return getStaticData()
      .then(this.checkUser);
  }

  checkUser = () => this.props.getUser()
    .then(user => {
      const { getJobSeeker } = this.props;
      if (user.businesses.length > 0) {
        return this.checkRcruiter(user);
      }
      if (user.job_seeker) {
        return getJobSeeker(user.job_seeker).then(this.checkJobSeeker);
      }

      const userType = cookie.get('usertype');
      if (userType === 'recruiter') {
        return this.checkRcruiter(user);
      }
      if (userType === 'jobseeker') {
        return this.checkJobSeeker(null);
      }
      return this.redirect('/select');
    });

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

  checkRcruiter = user => {
    this.menuData = recruiterMenus;
    const currentItem = this.findMenuItem(this.menuData);
    const permission = user.businesses.length > 0 ? 1 : 0;
    if (!currentItem) {
      return this.redirect(permission === 0 ? '/recruiter/businesses' : '/recruiter/find', permission);
    }
    if (permission < currentItem.permission) {
      return this.redirect('/recruiter/businesses', permission);
    }
    return Promise.resolve(permission);
  }

  checkJobSeeker = jobSeeker => {
    this.menuData = jobseekerMenus;
    const currentItem = this.findMenuItem(this.menuData);
    let permission = 0;
    if (jobSeeker) {
      permission = jobSeeker.profile ? 2 : 1;
    }
    if (!currentItem) {
      if (permission === 0) {
        return this.redirect('/jobseeker/profile', permission);
      }
      if (permission === 1) {
        return this.redirect('/jobseeker/jobprofile', permission);
      }
      return this.redirect('/jobseeker/find', permission);
    }
    if (permission < currentItem.permission) {
      return this.redirect(permission === 0 ? '/jobseeker/profile' : '/jobseeker/jobprofile', permission);
    }
    return Promise.resolve(permission);
  };

  redirect = (path, permission = 0) => {
    if (this.props.location.pathname === path) {
      return Promise.resolve(permission);
    }
    browserHistory.push(path);
    return Promise.reject();
  }

  /* logout */

  logout = () => {
    this.props.alertShow(
      'Confirm',
      'Are you sure you want to log out?',
      'cancel',
      null,
      'Log Out',
      () => this.props.logout()
        .then(() => {
          if (__DEVELOPMENT__) {
            cookie.remove('token');
          } else {
            cookie.remove('csrftoken');
          }
          cookie.remove('usertype');
          browserHistory.push('/login');
        }),
    );
  };

  clickMenuItem = to => {
    if (to !== '') {
      browserHistory.push(to);
      if (this.state.small) {
        this.setState({
          open: false
        });
      }
    }
  }

  /* alert */

  alertCallback = callback => {
    this.props.alertHide();
    if (callback) {
      callback();
    }
  }

  /* render */

  renderMenuItem = item => {
    const openKey = `open${item.id}`;
    const isOpen = this.state[openKey];
    const disable = item.permission && item.permission > this.props.permission;
    let active = item.to === this.props.location.pathname ? styles.active : '';
    if (item.submenu && !isOpen) {
      if (this.findMenuItem(item.submenu)) {
        active = styles.active;
      }
    }

    return (
      <li key={item.id}>
        <Link
          className={`${active} ${disable ? styles.disable : ''}`}
          onClick={() => {
            if (item.submenu) {
              this.setState({ [openKey]: !isOpen });
            } else {
              this.clickMenuItem(disable ? '' : item.to);
            }
          }}
        >
          { item.icon && <i className={`fa ${item.icon}`} /> }
          <span>{ item.label }</span>
          { item.submenu && <i className={`fa ${isOpen ? 'fa-angle-up' : 'fa-angle-down'}`} /> }
        </Link>
        {
          item.submenu &&
          <Collapse in={isOpen}>
            <ul>
              { item.submenu.map(subitem => this.renderMenuItem(subitem)) }
            </ul>
          </Collapse>
        }
      </li>
    );
  }

  render() {
    const { alert, children, location } = this.props;
    const { small, open, globalLoading, loading } = this.state;
    const { pathname } = location;
    const isSelect = pathname === '/select';

    if (globalLoading) {
      return <Loading />;
    }

    return (
      <div className={`${styles.root} ${small ? styles.small : ''} ${open ? styles.open : ''}`}>
        <header className={styles.header}>
          {
            !isSelect && small && (<button
              type="button"
              className={styles.toggleButton}
              onClick={this.toggleSidebar
          }
            >
              <span className={styles.iconBar}></span>
              <span className={styles.iconBar}></span>
              <span className={styles.iconBar}></span>
            </button>)
          }
          <div className={styles.title}>
            <img src={titleImage} alt="" />
          </div>
          <div className={styles.email}>{this.email}</div>
          <button
            className="fa fa-sign-out btn-icon"
            onClick={this.logout}
          />
        </header>
        <div className={styles.main}>
          {
            !isSelect && (
              <div className={styles.sidebar} >
                <nav>
                  <ul>
                    { this.menuData.map(item => this.renderMenuItem(item)) }
                  </ul>
                </nav>
                <div className={styles.footer}>
                  <div>@ 2017 Sclabs Inc</div>
                </div>
              </div>
            )
          }
          <div className={styles.content}>
            { loading ? <Loading /> : children }
          </div>
          {
            small && open && (
              <button
                className={styles.mask}
                onClick={this.closeSidebar}
              />
            )
          }
        </div>

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
                  alert.cancelButton && (
                    <Button onClick={() => this.alertCallback(alert.cancelCallback)}>
                      {alert.cancelButton}
                    </Button>
                  )
                }
                {
                  alert.okButton && (
                    <Button
                      onClick={() => this.alertCallback(alert.okCallback)}
                      bsStyle="success">
                      {alert.okButton}
                    </Button>
                  )
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
