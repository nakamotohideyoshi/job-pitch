import styled, { css } from 'styled-components';

export default styled.span`
  ${props =>
    css`
      display: inline-block;
      ${props.size ? `width: ${props.size}; height: ${props.size}` : ''};
      ${props.padding && `padding: ${props.padding};`};
      ${props.circle && `border-radius: 50%;`};
      background-size: contain;
      background-position: center;
      background-repeat: no-repeat;
      background-origin: content-box;
      ${props.src ? `background-image: url(${props.src})` : 'background-color: #f0f0f0'};
    `};
`;
