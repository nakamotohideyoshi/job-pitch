import React from 'react';
import styled from 'styled-components';
import { Modal, Input, Button } from 'antd';

const Wrapper = styled(Modal)`
  .ant-input-group-addon {
    cursor: pointer;
  }

  .ant-form-explain {
    margin-top: 8px;
  }
`;

export default ({ url, onClose }) => {
  let inputRef;
  const copyLink = () => {
    inputRef.input.select();
    document.execCommand('Copy');
  };
  return (
    <Wrapper visible title="Share Link" footer={null} onCancel={() => onClose()}>
      <Input
        readOnly
        addonAfter={<div onClick={copyLink}>Copy link</div>}
        defaultValue={url}
        ref={ref => {
          inputRef = ref;
        }}
      />
      <div className="ant-form-explain">
        Share this link to your job on your website, in an email, or anywhere else.
      </div>
    </Wrapper>
  );
};
