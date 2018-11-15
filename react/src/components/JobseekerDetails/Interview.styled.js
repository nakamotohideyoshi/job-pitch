import styled from 'styled-components';
import media from 'utils/mediaquery';

export default styled.div`
  .ant-form-item {
    margin-bottom: 5px;
  }

  .ant-calendar-picker {
    width: 250px !important;
  }

  .controls {
    .ant-form-item-control-wrapper {
      ${media.nottablet`
        display: flex;
        flex-direction: column;
        align-items: flex-end;
      `};
    }
  }
`;
