import React, { Fragment } from 'react';
import { Link } from 'react-router-dom';
import Responsive from 'react-responsive';
import styled from 'styled-components';
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
import { Layout, Dropdown, Menu, Avatar } from 'antd';

import { Icons } from 'components';
import titleImage from 'assets/title.png';
import defaultAvatar from 'assets/avatar.png';
import Popover, { MenuButton } from './Popover';
import UserMenu from './UserMenu';

const Wrapper = styled(Layout.Header)`
  position: fixed;
  width: 100%;
  z-index: 100;

  .title-logo {
    float: left;
    margin: 0 20px 0 10px;
  }

  .ant-menu {
    float: left;
    line-height: 50px;

    .ant-menu-item {
      padding: 0 12px;
    }
  }
`;

const ShareMenuItem = styled(Menu.Item)`
  padding: 0 !important;
  height: 32px;
  .SocialMediaShareButton {
    outline: none;
    transition: opacity 0.3s;
    &:hover {
      opacity: 0.5;
    }
  }
`;

export default ({ menu: MainMenu, shareUrl, avatar }) => {
  const ShareMenu = (
    <Menu style={{ display: 'inline-block', padding: 0 }}>
      <ShareMenuItem>
        <EmailShareButton url={shareUrl}>
          <EmailIcon round={false} size={32} />
        </EmailShareButton>
      </ShareMenuItem>
      <ShareMenuItem>
        <LinkedinShareButton url={shareUrl}>
          <LinkedinIcon round={false} size={32} />
        </LinkedinShareButton>
      </ShareMenuItem>
      <ShareMenuItem>
        <GooglePlusShareButton url={shareUrl}>
          <GooglePlusIcon round={false} size={32} />
        </GooglePlusShareButton>
      </ShareMenuItem>
      <ShareMenuItem>
        <FacebookShareButton url={shareUrl}>
          <FacebookIcon round={false} size={32} />
        </FacebookShareButton>
      </ShareMenuItem>
      <ShareMenuItem>
        <TwitterShareButton url={shareUrl}>
          <TwitterIcon round={false} size={32} />
        </TwitterShareButton>
      </ShareMenuItem>
    </Menu>
  );

  return (
    <Wrapper className="shadow">
      <div className="container">
        {MainMenu && (
          <Responsive maxWidth={767}>{<Popover float="left" icon={Icons.Bars} menu={MainMenu} />}</Responsive>
        )}

        <Link to="/">
          <div className="title-logo">
            <img src={titleImage} alt="" />
          </div>
        </Link>

        {MainMenu && (
          <Fragment>
            <Responsive minWidth={768}>
              <MainMenu theme="dark" mode="horizontal" />
            </Responsive>

            <Popover float="right" menu={UserMenu} icon={<Avatar src={avatar || defaultAvatar} size="small" />} />

            {shareUrl && (
              <Dropdown
                overlay={ShareMenu}
                trigger={['click']}
                placement="bottomCenter"
                overlayStyle={{ position: 'fixed' }}
              >
                <MenuButton style={{ float: 'right' }}>
                  <Icons.ShareAlt />
                </MenuButton>
              </Dropdown>
            )}
          </Fragment>
        )}
      </div>
    </Wrapper>
  );
};
