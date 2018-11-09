import styled from 'styled-components';
import { Modal } from 'antd';

import colors from 'utils/colors';

export default styled(Modal)`
  .ant-modal-body {
    padding: 40px 40px 20px 40px;

    .ant-carousel {
      .slick-slide {
        padding-bottom: 20px;

        .content {
          display: flex !important;
          flex-direction: column;
          text-align: center;
          height: 360px;

          > div {
            flex: 1;
            display: flex;
            justify-content: center;
            align-items: center;

            img {
              width: 150px;
              pointer-events: none;
            }
          }

          label {
            min-height: 60px;
          }
        }
      }

      .slick-disabled {
        cursor: initial !important;
      }

      .slick-prev,
      .slick-next {
        color: #888;
      }

      .slick-dots li {
        button {
          background-color: #000;
        }

        &.slick-active button {
          background-color: ${colors.yellow};
        }
      }
    }

    .skip-container {
      text-align: center;
      padding: 8px 0;
    }
  }
`;
