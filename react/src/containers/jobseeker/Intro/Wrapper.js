import styled from 'styled-components';
import { Modal } from 'antd';
import media from 'utils/mediaquery';

export default styled(Modal)`
  .ant-modal-body {
    padding: 40px 40px 20px 40px;

    .ant-carousel {
      .slick-slide {
        padding-bottom: 20px;

        > div {
          display: flex;
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
          background-color: #ff9300;
        }
      }
    }

    .skip-container {
      text-align: right;
      padding: 8px 0;
    }
  }
`;
