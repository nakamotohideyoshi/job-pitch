import styled, { css } from 'styled-components';

export default styled.span`
  ${props =>
    css`
      display: inline-block;
      padding: 10%;
      ${props.size ? `width: ${props.size}; height: ${props.size}` : ''};
      background-size: contain;
      background-position: center;
      background-repeat: no-repeat;
      background-origin: content-box;
      ${props.src ? `background-image: url(${props.src})` : 'background-color: #f0f0f0'};
    `};
`;
