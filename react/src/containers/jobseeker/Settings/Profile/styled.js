import styled from 'styled-components';
import { Form } from 'antd';
import media from 'utils/mediaquery';
import colors from 'utils/colors';

export default styled(Form)`
  max-width: 700px;
  width: 100%;

  .with-public {
    display: inline-block;
    width: calc(100% - 90px);
  }

  .public-check {
    display: inline-block;
    padding-top: 8px;
    ${media.mobile`padding-top: 38px;`};
    float: right;
  }

  .ant-input-disabled {
    background-color: #fafafa;
  }

  .ant-input-number {
    width: 100%;
  }

  .i-question-circle {
    color: ${colors.yellow};
  }

  .btn-cv-view {
    margin-bottom: 12px;
  }

  .btn-play {
    position: absolute;
    top: 4px;
    left: 160px;
  }

  .ant-checkbox-wrapper + .ant-checkbox-wrapper {
    margin-left: 0;
    margin-top: 12px;
  }

  .record-info {
    margin-top: 7px;
    line-height: initial;
    color: #8c8c8c;

    a {
      color: #595959;
      text-decoration: underline;
    }
  }

  .btn-save {
    width: 100px;
  }

  .ant-btn + .ant-btn {
    margin-left: 20px;
    width: 100px;
  }

  ${media.mobile`
    .ant-form-item:first-child {
      .ant-form-item-label {
        display: inline-block;
        width: 50px;
        padding-bottom: 5px;
      }
      .ant-form-item-control-wrapper {
        display: inline-block;
        width: calc(100% - 50px);
      }
    }
  `};

  ${media.notmobile`
    .ant-form-item {
      .ant-form-item-label {
        width: 210px;
        vertical-align: top;
      }

      .ant-form-item-control-wrapper {
        display: inline-block;
        width: calc(100% - 210px);
      }
    }
  `};
`;
