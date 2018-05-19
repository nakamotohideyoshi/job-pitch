import React from 'react';
import { connect } from 'react-redux';
import { Menu, Modal } from 'antd';
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

const Wrapper = styled(Menu)`
  /* &.ant-menu {
    display: flex;
    flex-direction: column;

    .ant-menu-item {
      display: inline-block;
      padding: 0;
      margin: 0;

      .SocialMediaShareButton {
        display: inline-block;
        svg {
          margin: 0;
        }
      }
    }
  } */
`;

const Item = Menu.Item;

class ShareMenu extends React.PureComponent {
  render() {
    const url = 'dddd';
    return (
      <Wrapper>
        <Item>
          <EmailShareButton url={url}>
            <EmailIcon round={false} size={32} />
          </EmailShareButton>
        </Item>
        <Item>
          <LinkedinShareButton url={url}>
            <LinkedinIcon round={false} size={32} />
          </LinkedinShareButton>
        </Item>
        <Item>
          <GooglePlusShareButton url={url}>
            <GooglePlusIcon round={false} size={32} />
          </GooglePlusShareButton>
        </Item>
        <Item>
          <FacebookShareButton url={url}>
            <FacebookIcon round={false} size={32} />
          </FacebookShareButton>
        </Item>
        <Item>
          <TwitterShareButton url={url}>
            <TwitterIcon round={false} size={32} />
          </TwitterShareButton>
        </Item>
      </Wrapper>
    );
  }
}

export default connect(state => ({
  status: state.auth.status
}))(ShareMenu);
