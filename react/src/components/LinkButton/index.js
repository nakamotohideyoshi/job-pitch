import styled, { css } from 'styled-components';
import colors from 'utils/colors';

export default styled.a`
  cursor: pointer;
  color: ${colors.green} !important;

  ${props => props.underline && css``};

  svg {
    margin-right: 8px;
  }
`;
