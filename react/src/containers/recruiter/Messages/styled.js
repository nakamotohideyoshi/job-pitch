import styled from 'styled-components';
import { Layout } from 'antd';

export default styled(Layout)`
  height: calc(100vh - 50px);

  .ant-layout-content {
    display: flex;
    flex-direction: column;

    .ant-list-item {
      padding: 15px !important;
      border-bottom: 1px solid #e0e0e0;

      .ant-list-item-meta-title span {
        color: #ff9300;
        cursor: pointer;
      }

      .ant-list-item-meta-description span {
        color: #595959;
        cursor: pointer;
      }
    }

    .content {
      flex: 1;
      overflow-y: auto;
    }
  }
`;
