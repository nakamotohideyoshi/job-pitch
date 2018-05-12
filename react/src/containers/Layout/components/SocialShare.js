import React from 'react';
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

const Wrapper = styled.div`
  position: fixed;
  display: flex;
  left: -32px;
  width: 0;
  height: 100vh;
  align-items: center;
  transition left 0.3s;
  &.show {
    left: 0;
  }

  > span {
    padding: 4px 6px;
    border-bottom-right-radius: 4px;
    border-top-right-radius: 4px;
    background-color: #333333;
    color: rgba(255, 255, 255, 0.7);
    cursor: pointer;
  }

  > ul {
    list-style: none;
    margin: 0;
    padding: 0;

    .SocialMediaShareButton {
      outline: none;
      cursor: pointer;
    }
  }
`;

class SocialShare extends React.Component {
  state = {
    show: false
  };

  clickToggle = () => {
    const show = !this.state.show;
    this.setState({ show });
  };

  render() {
    const { url } = this.props;
    return (
      <Wrapper className={this.state.show ? 'show' : ''}>
        <ul>
          <li>
            <FacebookShareButton url={url}>
              <FacebookIcon size={32} round={false} />
            </FacebookShareButton>
          </li>
          <li>
            <GooglePlusShareButton url={url}>
              <GooglePlusIcon size={32} round={false} />
            </GooglePlusShareButton>
          </li>
          <li>
            <LinkedinShareButton url={url}>
              <LinkedinIcon size={32} round={false} />
            </LinkedinShareButton>
          </li>
          <li>
            <TwitterShareButton url={url}>
              <TwitterIcon size={32} round={false} />
            </TwitterShareButton>
          </li>
          <li>
            <EmailShareButton url={url}>
              <EmailIcon size={32} round={false} />
            </EmailShareButton>
          </li>
        </ul>
        <span onClick={this.clickToggle}>
          <Icons.ShareAlt />
        </span>
      </Wrapper>
    );
  }
}

export default SocialShare;
