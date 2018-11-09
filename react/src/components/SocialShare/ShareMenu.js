import React from 'react';
import PropTypes from 'prop-types';
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

import { Icons, ShareLinkDialog } from 'components';

const LinkIcon = styled.span`
  display: inline-flex;
  justify-content: center;
  align-items: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #e0e0e0;
`;

const Wrapper = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  height: 32px;

  li > * {
    float: left;
    margin-right: 2px;
    outline: none;
    cursor: pointer;

    transition: all 0.3s;
    &:hover {
      opacity: 0.6;
    }
  }
`;

class ShareMenu extends React.Component {
  state = {
    visibleLinkDialog: false
  };

  openLinkDialog = visibleLinkDialog => this.setState({ visibleLinkDialog });

  render() {
    const { url, ...rest } = this.props;
    return (
      <Wrapper {...rest}>
        <li>
          <EmailShareButton url={url}>
            <EmailIcon round size={32} />
          </EmailShareButton>
        </li>
        <li>
          <LinkedinShareButton url={url}>
            <LinkedinIcon round size={32} />
          </LinkedinShareButton>
        </li>
        <li>
          <GooglePlusShareButton url={url}>
            <GooglePlusIcon round size={32} />
          </GooglePlusShareButton>
        </li>
        <li>
          <FacebookShareButton url={url}>
            <FacebookIcon round size={32} />
          </FacebookShareButton>
        </li>
        <li>
          <TwitterShareButton url={url}>
            <TwitterIcon round size={32} />
          </TwitterShareButton>
        </li>
        <li>
          <LinkIcon onClick={() => this.openLinkDialog(true)}>
            <Icons.Link />
          </LinkIcon>
          <ShareLinkDialog url={url} visible={this.state.visibleLinkDialog} onCancel={() => this.openLinkDialog()} />
        </li>
      </Wrapper>
    );
  }
}

ShareMenu.propTypes = {
  url: PropTypes.string.isRequired
};

export default ShareMenu;
