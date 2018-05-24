import { css } from 'styled-components';

const sizes = {
  wide: 1119,
  desktop: 991,
  tablet: 767,
  mobile: 575,
  phone: 375
};

const media = Object.keys(sizes).reduce((accumulator, label) => {
  const emSize = sizes[label] / 16;
  accumulator[label] = (...args) => css`
    @media (max-width: ${emSize}em) {
      ${css(...args)};
    }
  `;
  return accumulator;
}, {});

const media1 = Object.keys(sizes).reduce((accumulator, label) => {
  const emSize = (sizes[label] + 1) / 16;
  accumulator[`not${label}`] = (...args) => css`
    @media (min-width: ${emSize}em) {
      ${css(...args)};
    }
  `;
  return accumulator;
}, {});

export default Object.assign({}, media, media1);
