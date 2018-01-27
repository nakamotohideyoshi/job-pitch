import styled from 'styled-components';
import media from 'utils/mediaquery';

export default styled.div`
  position: relative;
  min-height: 349px;

  h4 {
    margin-bottom: 25px;
  }

  .logo-container {
    display: inline-block;
    margin-right: 45px;
  }

  .right-container {
    display: inline-block;
    width: calc(100% - 295px);
    float: right;
    ${media.tablet`
      display: block;
      width: initial;
      float: initial;
    `};
  }

  .credit {
    span {
      display: inline-block;
      margin: 6px 0;
    }
    .btn {
      margin-left: 20px;
    }
  }

  .btn-lg {
    width: 140px;
    margin-top: 20px;
  }

  .btn-lg.btn-outline-gray {
    margin-left: 20px;
  }
`;
