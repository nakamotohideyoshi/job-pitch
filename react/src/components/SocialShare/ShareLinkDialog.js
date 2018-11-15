import React from 'react';
import PropTypes from 'prop-types';
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

const ShareLinkDialog = ({ url, ...rest }) => {
  let inputRef;

  const copyLink = () => {
    inputRef.input.select();
    document.execCommand('Copy');
  };

  return (
    <StyledModal title="Share Link" footer={null} {...rest}>
      <Input
        readOnly
        addonAfter={<div onClick={copyLink}>Copy link</div>}
        defaultValue={url}
        ref={ref => {
          inputRef = ref;
        }}
      />
      <div className="ant-form-explain">Share this link on your website, in an email, or anywhere else.</div>
    </StyledModal>
  );
};

ShareLinkDialog.propTypes = {
  url: PropTypes.string.isRequired
};

export default ShareLinkDialog;
