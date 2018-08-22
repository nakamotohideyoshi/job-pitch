import React from 'react';
// import { Spin } from 'antd';
import styled, { css } from 'styled-components';

const Wrapper = styled.span`
  ${props =>
    css`
      display: inline-block;
      ${props.size ? `width: ${props.size}; height: ${props.size}` : ''};
      background-size: cover;
      background-position: center;
      background-repeat: no-repeat;
      ${props.src ? `background-image: url(${props.src})` : 'background-color: #f0f0f0'};
      border-radius: ${props.circle ? 50 : 0}%;
    `};
`;

export default class extends React.Component {
  state = {
    src: null
  };

  componentWillMount() {
    const { src } = this.props;
    if (src) {
      this.loadLogo(src);
    }
  }

  componentWillReceiveProps(nextProps) {
    const { src } = nextProps;
    if (src && src !== this.props.src) {
      this.loadLogo(src);
    }
  }

  componentWillUnmount() {
    this.image = null;
  }

  loadLogo = src => {
    this.image = new Image();
    this.image.onload = () => {
      if (this.image) {
        // this.setState({ src });
      }
    };
    this.image.src = src;
  };

  render() {
    const { size } = this.props;
    return <Wrapper size={size} src={this.props.src} className="logo" />;
    // const { src } = this.state;
    // return src ? (
    //   <Wrapper size={size} src={src} className={className} />
    // ) : (
    //   <Spin size="small">
    //     <Wrapper size={size} />
    //   </Spin>
    // );
  }
}
