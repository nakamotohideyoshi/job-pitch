import React, { Component } from 'react';
import PropTypes from 'prop-types';
import OverlayTrigger from 'react-bootstrap/lib/OverlayTrigger';
import Popover from 'react-bootstrap/lib/Popover';
import styles from './HelpIcon.scss';

export default class HelpIcon extends Component {
  static propTypes = {
    label: PropTypes.string.isRequired,
  }

  popoverHover = (
    <Popover id="popover-help">
      {this.props.label}
    </Popover>
  );

  render() {
    return (
      <OverlayTrigger
        className={styles.root}
        trigger={['hover']}
        placement="bottom"
        overlay={this.popoverHover}>
        <i className={[styles.icon, 'fa fa-question'].join(' ')} />
      </OverlayTrigger>
    );
  }
}
