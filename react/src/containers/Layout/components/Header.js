import React, { Fragment } from 'react';
import { Layout, Dropdown, Menu } from 'antd';
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

import { Icons } from 'components';
import titleImage from 'assets/title.png';
import Popover, { MenuButton } from './Popover';
import UserMenu from './UserMenu';

const Wrapper = styled(Layout.Header)`
  position: fixed;
  width: 100%;
  z-index: 100;

  .title-logo {
    float: left;
    margin: 0 24px 0 10px;
  }

  .ant-menu {
    float: left;
    line-height: 50px;

    .ant-menu-item {
      padding: 0 16px;
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

export default ({ menu: MainMenu, url }) => {
  const ShareMenu = (
    <Menu style={{ display: 'inline-block', padding: 0 }}>
      <ShareMenuItem>
        <EmailShareButton url={url}>
          <EmailIcon round={false} size={32} />
        </EmailShareButton>
      </ShareMenuItem>
      <ShareMenuItem>
        <LinkedinShareButton url={url}>
          <LinkedinIcon round={false} size={32} />
        </LinkedinShareButton>
      </ShareMenuItem>
      <ShareMenuItem>
        <GooglePlusShareButton url={url}>
          <GooglePlusIcon round={false} size={32} />
        </GooglePlusShareButton>
      </ShareMenuItem>
      <ShareMenuItem>
        <FacebookShareButton url={url}>
          <FacebookIcon round={false} size={32} />
        </FacebookShareButton>
      </ShareMenuItem>
      <ShareMenuItem>
        <TwitterShareButton url={url}>
          <TwitterIcon round={false} size={32} />
        </TwitterShareButton>
      </ShareMenuItem>
    </Menu>
  );

  return (
    <Wrapper className="shadow1">
      <div className="container">
        {MainMenu && (
          <Responsive maxWidth={767}>{<Popover float="left" icon={Icons.Bars} menu={MainMenu} />}</Responsive>
        )}

        <div className="title-logo">
          <img src={titleImage} alt="" />
        </div>

        {MainMenu && (
          <Fragment>
            <Responsive minWidth={768}>
              <MainMenu theme="dark" mode="horizontal" />
            </Responsive>

            <Popover float="right" menu={UserMenu} icon={Icons.UserCircle} />

            {url && (
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
