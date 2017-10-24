import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './LogoImage.scss';

export default class LogoImage extends Component {

  static propTypes = {
    image: PropTypes.string,
    size: PropTypes.number,
  }

  static defaultProps = {
    image: '',
    size: 80,
  }

  render() {
    const size = `${this.props.size}px`;
    return (
      <div
        className="logo-image"
        style={{
          width: size,
          height: size,
          minWidth: size,
          minHeight: size,
          backgroundImage: `url(${this.props.image})`,
        }}
      />
    );
  }
}
