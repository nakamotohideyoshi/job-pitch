import React from 'react';
import styled from 'styled-components';
import { Icons, SocialShare } from 'components';

const Wrapper = styled.div`
  position: fixed;
  display: flex;
  left: -32px;
  width: 0;
  height: 100vh;
  align-items: center;
  transition: left 0.3s;
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

  .SocialMediaShareButton {
    float: initial;
    margin: 0;
  }
`;

class SharePanel extends React.Component {
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
        <SocialShare url={url} shareLink={false} round={false} size={32} />
        <span onClick={this.clickToggle}>
          <Icons.ShareAlt />
        </span>
      </Wrapper>
    );
  }
}

export default SharePanel;
