import styled from 'styled-components';
import { Container } from 'reactstrap';

export default styled(Container)`
  align-items: center;

  .content {
    display: inline-block;
    width: 300px;

    .btn {
      margin: 15px 0;
      width: 100%;
    }
  }
`;
