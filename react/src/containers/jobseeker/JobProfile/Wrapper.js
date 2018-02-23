import styled from 'styled-components';
import { Container } from 'reactstrap';

export default styled(Container)`
  h2 {
    margin-bottom: 25px;
  }

  .map {
    position: relative;
    width: 100%;
    padding-top: 50%;
    margin-top: 10px;

    > div {
      position: absolute;
      width: 100%;
      height: 100%;
      top: 0;
    }
  }

  .btn-lg {
    width: 140px;
  }
`;
