import React from 'react';
import styled from 'styled-components';
import { Modal, Input } from 'antd';

const StyledModal = styled(Modal)`
  .ant-input-group-addon {
    cursor: pointer;
  }

  .ant-form-explain {
    margin-top: 8px;
  }
`;

export default ({ url, ...rest }) => {
  const copyLink = () => {
    this.inputRef.input.select();
    document.execCommand('Copy');
  };

  return (
    <StyledModal title="Share Link" footer={null} {...rest}>
      <Input
        readOnly
        addonAfter={<div onClick={copyLink}>Copy link</div>}
        defaultValue={url}
        ref={ref => {
          this.inputRef = ref;
        }}
      />
      <div className="ant-form-explain">Share this link on your website, in an email, or anywhere else.</div>
    </StyledModal>
  );
};
