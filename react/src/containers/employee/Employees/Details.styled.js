import styled from 'styled-components';
import media from 'utils/mediaquery';
import colors from 'utils/colors';

export default styled.div`
  h2 {
    font-size: 1.75em;
    margin-bottom: 1em;
  }

  .logo {
    position: relative;
    ${media.tablet` margin-bottom: 24px;`};
    padding-top: 100%;
    border: 1px solid #ebebeb;

    span {
      position: absolute;
      top: 0%;
      left: 0%;
    }
  }

  .info {
    ${media.desktop`margin-bottom: 24px;`};

    .name {
      margin-bottom: 0.25em;
      font-size: 24px;
      font-weight: 300;
      line-height: 1.2em;
      color: ${colors.text2};
    }

    ul {
      list-style: none;
      padding: 0;
      color: ${colors.text3};
      li {
        margin-bottom: 10px;
        font-weight: 100;
      }
    }
  }

  h4 {
    margin-bottom: 15px;
  }

  .map {
    position: relative;
    width: 100%;
    padding-top: 40%;
    margin-top: 20px;

    > div {
      position: absolute;
      width: 100%;
      height: 100%;
      top: 0;
    }
  }
`;
