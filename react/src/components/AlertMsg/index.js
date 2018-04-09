import styled, { css } from 'styled-components';
import colors from 'utils/colors';

export default styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  /* position: relative; */
  /* padding: 60px 0; */

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
