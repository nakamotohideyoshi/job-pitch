import styled from 'styled-components';
import { Container } from 'reactstrap';

export default styled(Container)`
  h2 {
    margin-bottom: 25px;
  }

  .board {
    margin-top: 20px;
    text-align: center;

    .product {
      position: relative;
      display: inline-flex;
      flex-direction: column;
      justify-content: center;
      border: 2px solid #ddd;
      margin: 30px;
      font-weight: 700;
      border-radius: 5px;
      width: 200px;
      height: 250px;

      .credits {
        font-size: 23px;
      }

      .price {
        color: #00b6a4;
        font-size: 38px;
        margin-bottom: 30px;
      }

      button {
        margin: 0 30px;
      }
    }

    .product:hover {
      border: 2px solid #00b6a4;
    }

    .mask {
      position: absolute;
      width: 100%;
      height: 100%;
      top: 0;
      left: 0;
      background-color: rgba(0, 0, 0, 0.5);
    }

    .loading:hover {
      border: 2px solid #ddd;
    }
  }
`;
