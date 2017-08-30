import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styles from './Loading.scss';

export default class Loading extends Component {
  static propTypes = {
    style: PropTypes.object,
  }

  static defaultProps = {
    style: {}
  }

  render() {
    return (
      <div className={styles.container} style={this.props.style}>
        <div className={styles.spinner}>
          <div className={styles.dot1}></div>
          <div className={styles.dot2}></div>
        </div>
      </div>
    );
  }
}
