import React from 'react';
import { Alert } from 'reactstrap';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import faCheckCircle from '@fortawesome/fontawesome-free-solid/faCheckCircle';
import faInfoCircle from '@fortawesome/fontawesome-free-solid/faInfoCircle';
import faExclamationTriangle from '@fortawesome/fontawesome-free-solid/faExclamationTriangle';
import faTimesCircle from '@fortawesome/fontawesome-free-solid/faTimesCircle';

const COLORS = {
  success: 'success',
  info: 'info',
  warning: 'warning',
  danger: 'danger'
};

const ICONS = {
  success: faCheckCircle,
  info: faInfoCircle,
  warning: faExclamationTriangle,
  danger: faTimesCircle
};

export default class extends React.PureComponent {
  render() {
    const { type, children } = this.props;
    return (
      <Alert color={COLORS[type]}>
        {ICONS[type] && <FontAwesomeIcon icon={ICONS[type]} size="lg" />}
        {children}
      </Alert>
    );
  }
}
