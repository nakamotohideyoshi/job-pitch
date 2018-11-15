import React from 'react';
import { connect } from 'react-redux';
import { withRouter, Link } from 'react-router-dom';
import {
  FacebookShareButton,
  GooglePlusShareButton,
  LinkedinShareButton,
  TwitterShareButton,
  EmailShareButton,
  FacebookIcon,
  TwitterIcon,
  GooglePlusIcon,
  LinkedinIcon,
  EmailIcon
} from 'react-share';
import { Popover, Avatar, Button, Modal, Menu, Dropdown } from 'antd';
import { Icons } from 'components';

import DATA from 'utils/data';
import * as helper from 'utils/helper';
import { logoutAction } from 'redux/auth';
import titleImage from 'assets/title.png';

import JsMenu from './menus/JsMenu';
import RcMenu from './menus/RcMenu';
import HrMenu from './menus/HrMenu';
import EmMenu from './menus/EmMenu';
import HeaderLayout, { ShareMenu, UserMenu } from './Header.styled';

const confirm = Modal.confirm;
const MenuItem = Menu.Item;

/* eslint-disable react/prop-types */
class Header extends React.Component {
  state = {
    visibleUserMenu: false
  };

  handleVisibleChange = visibleUserMenu => {
    this.setState({ visibleUserMenu });
  };

  onSettings = () => {
    this.props.history.push(DATA.isJobseeker ? '/jobseeker/settings' : '/recruiter/settings');
  };

  onSignOut = () => {
    this.handleVisibleChange(false);
    confirm({
      title: 'Are you sure you want to log out?',
      okText: 'Log Out',
      maskClosable: true,
      onOk: () => {
        this.props.logoutAction();
      }
    });
  };

  ShareMenu = () => {
    let shareUrl = 'https://www.myjobpitch.com/';
    if (DATA.isJobseeker) {
      shareUrl = 'https://www.myjobpitch.com/candidates/';
    } else if (DATA.isRecruiter) {
      shareUrl = 'https://www.myjobpitch.com/recruiters/';
    }

    return (
      <ShareMenu>
        <MenuItem>
          <EmailShareButton url={shareUrl}>
            <EmailIcon round={false} size={32} />
          </EmailShareButton>
        </MenuItem>
        <MenuItem>
          <LinkedinShareButton url={shareUrl}>
            <LinkedinIcon round={false} size={32} />
          </LinkedinShareButton>
        </MenuItem>
        <MenuItem>
          <GooglePlusShareButton url={shareUrl}>
            <GooglePlusIcon round={false} size={32} />
          </GooglePlusShareButton>
        </MenuItem>
        <MenuItem>
          <FacebookShareButton url={shareUrl}>
            <FacebookIcon round={false} size={32} />
          </FacebookShareButton>
        </MenuItem>
        <MenuItem>
          <TwitterShareButton url={shareUrl}>
            <TwitterIcon round={false} size={32} />
          </TwitterShareButton>
        </MenuItem>
      </ShareMenu>
    );
  };

  DropMenu = () => {
    const { jobseeker, jobprofile, avatar, businesses, location } = this.props;
    const path1 = location.pathname.split('/')[1];
    const name = helper.getFullName(jobseeker) || (businesses[0] || {}).name || 'noname';

    const hideSettings = businesses.length === 0 && !jobprofile;

    return (
      <UserMenu>
        <div className="info">
          <Avatar src={avatar} size={50} />
          <div>
            <h4 className="single-line">{name}</h4>
            <div className="single-line">{DATA.email}</div>
          </div>
        </div>

        <div className="buttons">
          {!hideSettings && (path1 === 'jobseeker' || path1 === 'recruiter') && (
            <Button onClick={this.onSettings}>Settings</Button>
          )}
          <Button onClick={this.onSignOut}>Log Out</Button>
        </div>
      </UserMenu>
    );
  };

  getMenu = () => {
    const path1 = this.props.location.pathname.split('/')[1];
    if (path1 === 'jobseeker') return <JsMenu />;
    if (path1 === 'recruiter') return <RcMenu />;
    if (path1 === 'hr') return <HrMenu />;
    if (path1 === 'employee') return <EmMenu />;
    return null;
  };

  render() {
    const { user, avatar } = this.props;

    const menu = this.getMenu();

    return (
      <HeaderLayout className="shadow">
        <div className="container">
          {menu && <Icons.Bars />}

          <Link to="/">
            <div className="title-logo">
              <img src={titleImage} alt="" />
            </div>
          </Link>

          {menu && <div className="left-menu">{menu}</div>}

          {user && (
            <div className="right-menu">
              <Dropdown overlay={<this.ShareMenu />} trigger={['click']} overlayStyle={{ position: 'fixed' }}>
                <div>
                  <Icons.ShareAlt />
                </div>
              </Dropdown>

              <Popover
                placement="bottomRight"
                visible={this.state.visibleUserMenu}
                onVisibleChange={this.handleVisibleChange}
                content={<this.DropMenu />}
                trigger="click"
                overlayStyle={{ position: 'fixed' }}
              >
                <div>
                  <Avatar src={avatar} size="small" />
                </div>
              </Popover>
            </div>
          )}
        </div>
      </HeaderLayout>
    );
  }
}

export default withRouter(
  connect(
    state => {
      const { user, jobseeker, jobprofile } = state.auth;
      const avatar = helper.getAvatar(jobseeker);
      return {
        user,
        jobseeker,
        jobprofile,
        avatar,
        businesses: state.businesses.businesses
      };
    },
    { logoutAction }
  )(Header)
);
