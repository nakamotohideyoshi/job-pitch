import { Main } from 'components';

export default Main.extend`
  .tab-container {
    flex: 1;
    display: flex;
    flex-direction: column;

    .nav {
      margin-top: 30px;
      border-bottom-color: #a0a0a0;

      .nav-item {
        a {
          display: inline-block;
          padding: 7px 20px;
          border: none;
          border-bottom: 4px solid transparent;
          font-size: 12px;
          font-weight: 500;
          text-decoration: none;
        }

        &.active {
          a {
            color: #00b6a4;
            border-bottom-color: #00b6a4;
          }
        }
      }
    }

    .tab-content {
      flex: 1;
      min-height: 200px;
    }
  }
`;
