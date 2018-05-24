import React from 'react';
import styled from 'styled-components';
import { Modal } from 'antd';

const Wrapper = styled(Modal)`
  width: auto !important;
  margin-bottom: 40px !important;

  .ant-modal-header {
    padding: 40px 40px 0 40px;
    border-bottom: none;

    .ant-modal-title {
      font-size: 24px;
    }
  }

  .ant-modal-body {
    padding: 40px;
  }
`;

export default ({ children, ...rest }) => (
  <Wrapper className="container" footer={null} {...rest}>
    {children}
  </Wrapper>
);
