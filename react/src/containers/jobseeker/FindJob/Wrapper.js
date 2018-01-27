import { Main } from 'components';

export default Main.extend`
  .row {
    > div {
      margin-top: 15px;
    }
  }

  .search-bar {
    max-width: 200px;
    width: 100%;
    margin-left: 15px;
  }
`;
