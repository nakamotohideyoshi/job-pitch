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

  .map {
    position: relative;
    width: 100%;
    padding-top: 50%;
    margin-top: 10px;

    > div {
      position: absolute;
      width: 100%;
      height: 100%;
      top: 0;
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

export const WithPublic = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
`;
