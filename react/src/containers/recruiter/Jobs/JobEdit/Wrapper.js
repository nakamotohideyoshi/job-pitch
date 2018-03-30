import styled from 'styled-components';
import media from 'utils/mediaquery';

export default styled.div`
  .fa-question-circle {
    color: #ff9300;
  }

  .btn-play {
    position: absolute;
    top: 4px;
    left: 160px;
  }

  ${media.mobile`
    .status-field {
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
`;
