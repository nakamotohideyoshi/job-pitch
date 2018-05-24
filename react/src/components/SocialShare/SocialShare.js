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
import ShareLink from './ShareLink';

const Wrapper = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  height: 32px;

  li > div {
    float: left;
    margin-right: 5px;
    outline: none;
    cursor: pointer;

    transition: all 0.3s;
    &:hover {
      opacity: 0.6;
    }
  }
`;

const SocialShare = ({ url, ...rest }) => {
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
        <ShareLink url={url} round size={32} />
      </li>
    </Wrapper>
  );
};

SocialShare.propTypes = {
  url: PropTypes.string.isRequired
};

export default SocialShare;
