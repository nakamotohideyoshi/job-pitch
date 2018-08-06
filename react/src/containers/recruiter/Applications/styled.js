import styled from 'styled-components';
import media from 'utils/mediaquery';
import colors from 'utils/colors';

export default styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;

  .content {
    flex: 1;
    position: relative;
    margin-bottom: 40px;
    min-height: 100px;

    .ant-list-item {
      position: relative;
      padding-left: 12px;
      padding-right: 12px;
      overflow: hidden;

      .ant-list-item-content {
        flex: initial;

        .ant-list-item-meta-title {
          font-size: 16px;
        }

        .ant-list-item-meta-description {
          margin-right: 10px;
        }

        .properties {
          font-size: 12px;
          span {
            display: inline-block;
          }
        }
      }

      .ant-list-item-action {
        span {
          width: 30px;
          height: 30px;
          display: inline-flex;
          justify-content: center;
          align-items: center;
          border-radius: 50%;
          &:hover {
            box-shadow: 0px 0 4px 0px rgba(0, 0, 0, 0.15);
          }
        }
      }

      &.loading {
        pointer-events: none;

        .mask {
          background-color: rgba(255, 255, 255, 0.5);
          z-index: 1;
        }
      }

      &:hover {
        cursor: pointer;
        background-color: ${colors.lightGreen};
      }

      &.disabled * {
        color: #ccc;
        img {
          opacity: 0.5;
        }
      }
    }
  }

  form {
    margin: 40px auto;
    max-width: 700px;
    width: 100%;
    padding: 0 15px;

    .ant-form-item-label svg {
      color: #ff9300;
      cursor: pointer;
    }

    .subimt-field {
      margin-top: 15px;

      .ant-btn {
        width: 150px;
        margin-right: 15px;
        margin-bottom: 8px;
      }
    }

    ${media.notmobile`
      .ant-form-item {
        .ant-form-item-label {
          width: 120px;
          vertical-align: top;
        }

        .ant-form-item-control-wrapper {
          display: inline-block;
          width: calc(100% - 120px);
          vertical-align: top;
        }
      }
    `};
  }
`;

export const Mark = styled.div`
  position: absolute;
  top: 15px;
  left: -24px;
  width: 100px;
  line-height: 20px;
  font-size: 13px;
  background-color: #888;
  color: #fff;
  text-align: center;
  box-shadow: 0px 0px 15px rgba(0, 0, 0, 0.3);
  transform: rotate(-45deg);

  &:before,
  &:after {
    content: ' ';
    display: block;
    width: 100%;
    height: 0;
  }

  &:before {
    border-top: 1px solid #888;
    border-bottom: 1px dashed #ccc;
  }
  &:after {
    border-top: 1px dashed #ccc;
    border-bottom: 1px solid #888;
  }
`;
