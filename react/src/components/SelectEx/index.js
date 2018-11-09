import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Select, Spin } from 'antd';

const Wrapper = styled(Select)`
  flex: 1;
  margin-right: 20px;
`;

const SelectEx = ({ loading, placeholder, children, ...props }) => {
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

SelectEx.propTypes = {
  loading: PropTypes.any, // PropTypes.bool
  placeholder: PropTypes.string,
  children: PropTypes.any
};

SelectEx.defaultProps = {
  loading: false,
  placeholder: null,
  children: null
};

export default SelectEx;
