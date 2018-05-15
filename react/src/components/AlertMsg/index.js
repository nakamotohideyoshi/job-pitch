import styled, { css } from 'styled-components';
import colors from 'utils/colors';

export default styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  left: 15px;
  right: 15px;

  display: flex;
  flex-direction: column;
  justify-content: center;
  text-align: center;
  white-space: pre-line;
  color: ${colors.text3};
  ${props =>
    props.error &&
    css`
      color: ${colors.error};
    `};

  span + a {
    margin-top: 10px;
  }

  a {
    color: ${colors.primary};

    svg {
      margin-right: 8px;
    }
  }
`;
