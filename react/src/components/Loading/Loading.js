import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styles from './Loading.scss';

export default class Loading extends Component {
  static propTypes = {
    size: PropTypes.string,
    color: PropTypes.string,
    backgroundColor: PropTypes.string,
  }

  static defaultProps = {
    size: '40px',
    color: '#00b6a4',
    backgroundColor: null,
  }

  render() {
    const { color, backgroundColor, size } = this.props;
    const colorStyle = { backgroundColor: color };
    return (
      <div className={styles.container}>
        {
          backgroundColor &&
          <div
            className={styles.background}
            style={{ backgroundColor }}
          ></div>
        }
        <div
          className={styles.content}
          style={{ width: size, height: size }}
        >
          <div><div style={colorStyle}></div></div>
          <div><div style={colorStyle}></div></div>
          <div><div style={colorStyle}></div></div>
          <div><div style={colorStyle}></div></div>
          <div><div style={colorStyle}></div></div>
          <div><div style={colorStyle}></div></div>
          <div><div style={colorStyle}></div></div>
          <div><div style={colorStyle}></div></div>
          <div><div style={colorStyle}></div></div>
          <div><div style={colorStyle}></div></div>
          <div><div style={colorStyle}></div></div>
          <div><div style={colorStyle}></div></div>
        </div>
      </div>
    );
  }
}
