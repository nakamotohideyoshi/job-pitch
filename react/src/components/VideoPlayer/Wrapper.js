import styled from 'styled-components';
import { Modal } from 'reactstrap';
import media from 'utils/mediaquery';

export default styled(Modal)`
  .modal-body {
    padding: 2rem;
    ${media.tablet`padding: 1rem;`};
  }

  .videoContainer {
    position: relative;

    video {
      width: 100%;
      background-color: #000;
    }
  }
`;
