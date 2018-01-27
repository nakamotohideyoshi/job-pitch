import styled from 'styled-components';
import { Modal } from 'reactstrap';

export default styled(Modal)`
  &.modal-dialog {
    max-width: inherit;
    height: 100%;
    margin: 0;

    .modal-content {
      justify-content: center;
      align-items: center;
      width: 100%;
      height: 100%;
      background-color: transparent;
      border: none;

      .progress {
        max-width: 300px;
        width: 80%;
        background-color: rgba(0, 0, 0, 0.2);
      }

      label {
        color: #fff;
      }
    }
  }
`;
