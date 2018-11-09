import React from 'react';
import PropTypes from 'prop-types';
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

const Loading = ({ className, ...props }) => (
  <Wrapper className={className}>
    <Spin {...props} />
  </Wrapper>
);

Loading.propTypes = {
  className: PropTypes.string,
  size: PropTypes.string
};

Loading.defaultProps = {
  className: null,
  size: 'small'
};

export default Loading;
