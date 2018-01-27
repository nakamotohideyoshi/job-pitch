import { Main } from 'components';

export default Main.extend`
  display: flex;
  flex-direction: column;
  align-items: center;
  position: absolute;
  top: 0;
  width: 100%;
  height: 100vh;
  margin: 0;
  text-align: center;
  z-index: 2;

  img {
    margin-top: 100px;
  }

  h1 {
    margin-top: 40px;
    padding: 0 15px;
  }

  div {
    padding: 0 15px;
  }

  a {
    color: #00b6a4 !important;
  }

  p {
    margin-top: 80px;
  }
`;
