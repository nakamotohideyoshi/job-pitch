import styled from 'styled-components';
import { Container } from 'components';

export default styled(Container)`
  .ant-list {
    margin-bottom: 40px;

    .ant-list-item {
      .ant-list-item-meta-title {
        font-size: 16px;
      }

      .ant-list-item-action {
        span:hover {
          color: #00b6a4;
        }
      }

      &:hover {
        cursor: pointer;

        .ant-list-item-meta-title {
          color: #00b6a4;
        }
      }
    }
  }
`;
