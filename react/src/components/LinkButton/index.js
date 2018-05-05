import styled, { css } from 'styled-components';

export default styled.a`
  cursor: pointer;
  color: #00b6a4 !important;

  ${props => props.underline && css``};

  svg {
    margin-right: 8px;
  }
`;
