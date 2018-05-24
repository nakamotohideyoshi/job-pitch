import styled from 'styled-components';
import colors from 'utils/colors';
import media from 'utils/mediaquery.js';

export default styled.div`
  .logo {
    position: relative;
    ${media.tablet` margin-bottom: 24px;`};
    padding-top: 100%;
    background-color: #eee;

    span {
      position: absolute;
      top: 8%;
      bottom: 8%;
      left: 8%;
      right: 8%;
      background-size: contain;
      background-repeat: no-repeat;
      background-position: center;
    }
  }

  .info {
    ${media.desktop` margin-bottom: 24px;`};

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
        margin-bottom: 16px;
        font-weight: 100;
        svg {
          margin-right: 0.5em;
          width: 20px;
          font-size: 16px;
        }
      }
    }
  }

  .social-icons {
    margin-bottom: 24px;
  }

  button {
    display: block;
    width: 200px;
  }

  button + button {
    margin-top: 16px;
  }

  .ant-divider {
    margin: 40px 0;
  }

  .job-resource {
    position: relative;
    padding-top: 33%;
    cursor: pointer;
    > span {
      position: absolute;
      top: 0;
      bottom: 0;
      left: 0;
      right: 0;
      display: flex;
      justify-content: center;
      align-items: center;
      background-size: cover;
      background-position: center;
      svg {
        width: 8%;
        height: auto;
        color: #fff;
        opacity: 0.3;
        transition: opacity 0.3s;
      }

      &:hover {
        svg {
          opacity: 1;
        }
      }
    }
  }

  .ant-carousel,
  .description,
  .map {
    margin-top: 18px;
  }

  .map {
    position: relative;
    width: 100%;
    padding-top: 33%;

    > div {
      position: absolute;
      width: 100%;
      height: 100%;
      top: 0;
    }
  }
`;
