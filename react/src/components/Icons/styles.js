import styled, { css } from 'styled-components';

const SIZE = {
  xs: '0.75em',
  sm: '0.875em',
  lg: '1.33333em',
  '2x': '2em',
  '3x': '3em',
  '4x': '4em'
};

export const SVG = styled.svg`
  display: inline-block;
  font-size: inherit;
  height: 1em;
  overflow: visible;
  vertical-align: -0.125em;

  ${({ size }) =>
    css`
      font-size: ${SIZE[size]};
    `};

  &.i-w-6 {
    width: 0.375em;
  }

  &.i-w-9 {
    width: 0.5625em;
  }
  &.i-w-10 {
    width: 0.625em;
  }
  &.i-w-14 {
    width: 0.875em;
  }
  &.i-w-16 {
    width: 1em;
  }
  &.i-w-18 {
    width: 1.125em;
  }
  &.i-w-20 {
    width: 1.25em;
  }
`;
