import styled, { css } from 'styled-components';

export default styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;

  .sidebar {
    position: absolute;
    width: 300px;
    top: 0;
    bottom: 0;
    ${({ tablet, open }) => css`
      left: ${tablet && !open ? '-300px' : '0'};
    `};
    z-index: 1;
    transition: left 0.3s;
  }

  .body {
    position: absolute;
    ${({ tablet }) => css`
      left: ${tablet ? '0' : '300px'};
    `};
    right: 0;
    top: 0;
    bottom: 0;
    display: flex;
    flex-direction: column;

    .header {
      border-bottom: 1px solid #e0e0e0;

      svg {
        float: left;
        width: 19px;
        height: auto;
        margin: 28px 20px;
        cursor: pointer;
      }

      .ant-list-item {
        padding: 15px !important;

        .ant-avatar {
          width: 48px;
          height: 48px;
          border-radius: 50%;
        }

        .ant-list-item-meta-title span {
          color: #ff9300;
          cursor: pointer;
        }

        .ant-list-item-meta-description span {
          color: #595959;
          cursor: pointer;
        }
      }
    }

    .content {
      flex: 1;
      overflow-y: auto;
    }

    .mask {
      position: absolute;
      left: 0;
      right: 0;
      top: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.5);
    }
  }
`;
