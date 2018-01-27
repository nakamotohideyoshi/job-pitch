import styled from 'styled-components';
import media from 'utils/mediaquery';

export default styled.footer`
  padding: 50px 0;
  ${media.tablet`padding: 25px 0;`};
  background-color: #333;
  text-align: center;
  color: #999999;

  a {
    display: inline-block;
    color: #999999;
    cursor: pointer;

    &:hover {
      color: #fff !important;
    }
  }

  .menu a {
    margin: 5px 15px;
    &:hover {
      text-decoration: underline !important;
    }
  }

  .follow a {
    margin: 15px 10px 0 10px;
  }

  .company {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: 20px;

    img {
      width: 25px;
      margin-right: 15px;
    }

    span {
      margin-left: 15px;
    }
  }
`;
