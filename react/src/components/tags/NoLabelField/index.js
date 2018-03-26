import React from 'react';

export default ({ children, className }) => (
  <div className={`ant-form-item ${className}`}>
    <div className="ant-form-item-label" />
    <div className="ant-form-item-control-wrapper">{children}</div>
  </div>
);
