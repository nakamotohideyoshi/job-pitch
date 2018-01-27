import { Main } from 'components';

export default Main.extend`
  position: relative;
  min-height: 450px;

  .splash {
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    background-size: cover;
    background-position: center;
    transition: opacity 2000ms ease;
  }

  .content {
    position: absolute;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    top: 0;
    text-align: center;

    .title {
      line-height: 40px;
      padding: 0 15px;
      margin-bottom: 30px;
      color: white;
      font-size: 30px;
    }
  }

  .appButtonImg {
    height: 50px;
    margin: 10px;
  }
`;
