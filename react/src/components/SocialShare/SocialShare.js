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
import { Icons } from 'components';
import ShareLink from './ShareLink';

const Wrapper = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;

  li > div {
    float: left;
    margin-right: 5px;
    outline: none;
    cursor: pointer;

    transition all 0.3s;
    &:hover {
      opacity: 0.6;
    }
  }
`;

const SocialShare = ({ url, shareLink, round, size }) => {
  return (
    <Wrapper>
      <li>
        <EmailShareButton url={url}>
          <EmailIcon round={round} size={size} />
        </EmailShareButton>
      </li>
      <li>
        <LinkedinShareButton url={url}>
          <LinkedinIcon round={round} size={size} />
        </LinkedinShareButton>
      </li>
      <li>
        <GooglePlusShareButton url={url}>
          <GooglePlusIcon round={round} size={size} />
        </GooglePlusShareButton>
      </li>
      <li>
        <FacebookShareButton url={url}>
          <FacebookIcon round={round} size={size} />
        </FacebookShareButton>
      </li>
      <li>
        <TwitterShareButton url={url}>
          <TwitterIcon round={round} size={size} />
        </TwitterShareButton>
      </li>
      {shareLink && (
        <li>
          <ShareLink url={url} round={round} size={size} />
        </li>
      )}
    </Wrapper>
  );
};

SocialShare.propTypes = {
  url: PropTypes.string.isRequired,
  shareLink: PropTypes.bool,
  round: PropTypes.bool,
  size: PropTypes.number
};

SocialShare.defaultProps = {
  shareLink: true,
  round: true,
  size: 32
};

export default SocialShare;
