import styled, { css } from 'styled-components';

export default styled.div`
  position: relative;
  flex: 1;
  display: flex;
  height: 100%;

  ${props =>
    props.center &&
    css`
      flex-direction: column;
      justify-content: center;
      align-items: center;
    `};

  ${props =>
    props.height &&
    css`
      height: ${props.height}px;
    `};
`;
