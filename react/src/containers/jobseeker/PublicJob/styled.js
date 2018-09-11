import styled from 'styled-components';
import colors from 'utils/colors';
import media from 'utils/mediaquery';

export default styled.div`
  .ant-alert {
    margin-top: 20px;
  }

  .content {
    margin: 40px 0;

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

      .sub-name {
        margin-bottom: 1em;
        font-size: 18px;
        font-weight: 300;
        line-height: 1.2em;
        color: ${colors.text3};
      }

      ul {
        list-style: none;
        padding: 0;
        color: ${colors.text3};
        li {
          margin-bottom: 10px;
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
      max-width: 200px;
      width: 100%;
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
  }
`;
