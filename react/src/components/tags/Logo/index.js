import styled, { css } from 'styled-components';

export default styled.div`
  ${props =>
    css`
      display: inline-block;
      width: ${props.size ? `${props.size}px` : '100%'};
      height: ${props.size ? `${props.size}px` : 'auto'};
      padding-top: ${props.size ? 0 : '100%'};
      background-size: cover;
      background-position: center;
      background-repeat: no-repeat;
      background-image: url(${props.src});
      border-radius: ${props.circle ? 50 : 0}%;
    `};
`;
