import React from 'react';
import { Select, Spin } from 'antd';
import styled from 'styled-components';

const Wrapper = styled(Select)`
  flex: 1;
  margin-right: 20px;
`;

export default ({ loading, placeholder, children, ...props }) => {
  return (
    <Wrapper
      {...props}
      showSearch
      placeholder={loading ? <Spin size="small" /> : placeholder}
      filterOption={(input, option) => option.props.children[1].toLowerCase().indexOf(input.toLowerCase()) >= 0}
    >
      {children}
    </Wrapper>
  );
};
