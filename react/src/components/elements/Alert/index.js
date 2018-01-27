import React from 'react';
import { Alert } from 'reactstrap';

const COLORS = {
  success: 'success',
  info: 'info',
  warning: 'warning',
  danger: 'danger'
};

const ICONS = {
  success: 'fa-check-circle',
  info: 'fa-info-circle',
  warning: 'fa-exclamation-triangle',
  danger: 'fa-times-circle'
};

export default class extends React.PureComponent {
  render() {
    const { type, children } = this.props;
    return (
      <Alert color={COLORS[type]}>
        {ICONS[type] && <i className={`fa ${ICONS[type]} fa-lg`} />}
        {children}
      </Alert>
    );
  }
}
