import styled, { css } from 'styled-components';

const Loading = styled.span`
  &:before {
    content: '';
    box-sizing: border-box;
    position: absolute;
    top: 50%;
    left: 50%;
    border-radius: 50%;

    ${props =>
      css`
        width: ${props.size || 40}px;
        height: ${props.size || 40}px;
        margin-top: -${(props.size || 40) / 2}px;
        margin-left: -${(props.size || 40) / 2}px;
        border-top: 2px solid ${props.color || `#00b6a4`};
      `};

    border-right: 2px solid transparent;

    animation: spinner 0.8s linear infinite;
  }

  @keyframes spinner {
    to {
      transform: rotate(360deg);
    }
  }
`;

export default Loading;
