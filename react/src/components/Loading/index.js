import React from 'react';
import styled from 'styled-components';
import { Spin } from 'antd';

const Wrapper = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  align-items: center;
`;

export default ({ className, ...props }) => (
  <Wrapper className={className}>
    <Spin {...props} />
  </Wrapper>
);
