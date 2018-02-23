import styled from 'styled-components';
import { Container } from 'reactstrap';

export default styled(Container)`
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
