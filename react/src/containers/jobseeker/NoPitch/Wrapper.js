import { Main } from 'components';

export default Main.extend`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 60px;

  > div {
    white-space: pre-line;
    text-align: center;
    padding-top: 20px;
  }

  > a {
    margin-top: 15px;
    color: #00b6a4;
    font-size: 16px;
  }
`;
