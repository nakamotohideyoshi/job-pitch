import styled from 'styled-components';
import colors from 'utils/colors';
import media from 'utils/mediaquery';

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
      margin-bottom: 1em;
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
        margin-bottom: 8px;
        font-weight: 100;
        svg {
          margin-right: 0.5em;
          width: 20px;
          font-size: 16px;
        }
      }
    }
  }

  button {
    display: block;
    width: 200px;
  }

  button + button {
    margin-top: 16px;
  }

  .ant-tabs {
    margin-top: 20px;

    .ant-tabs-nav .ant-tabs-tab {
      color: inherit !important;
    }

    .ant-tabs-tabpane {
      padding: 0 15px;
    }
  }

  .pitch-video {
    margin: 18px 0 2em 2em;
    width: 50%;
    float: right;
    ${media.desktop`
      width: 100%;
    `};
  }

  .check-label {
    display: flex;
    margin-top: 30px;

    svg {
      min-width: 0.875em;
      margin-right: 0.25em;
      color: #ff9300;
    }
  }

  .check-label + .check-label {
    margin-top: 0.5em;
  }
`;
