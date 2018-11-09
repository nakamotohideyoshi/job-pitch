import React from 'react';
import PropTypes from 'prop-types';

const NoLabelField = ({ children, className, ...rest }) => (
  <div className={`ant-form-item ${className}`} {...rest}>
    <div className="ant-form-item-label" />
    <div className="ant-form-item-control-wrapper">{children}</div>
  </div>
);

NoLabelField.propTypes = {
  children: PropTypes.any,
  className: PropTypes.string
};

NoLabelField.defaultProps = {
  children: null,
  className: ''
};

export default NoLabelField;
