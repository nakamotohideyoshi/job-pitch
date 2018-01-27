import styled, { css } from 'styled-components';
import media from 'utils/mediaquery';

export default styled.div`
  display: inline-block;
  padding: 45px;
  ${media.tablet`padding: 25px;`};
  border: 1px solid #d8d8d8;
  background-color: #fff;

  ${props =>
    props.block &&
    css`
      width: 100%;
    `};
`;
