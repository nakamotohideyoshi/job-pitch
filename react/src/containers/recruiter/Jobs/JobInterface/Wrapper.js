import styled from 'styled-components';

export default styled.div`
  position: relative;
  min-height: 346px;

  h4 {
    margin-bottom: 25px;
  }

  .buttons {
    display: flex;
    flex-direction: column;
    align-items: center;

    .btn {
      width: 80%;
      max-width: 440px;
      margin: 10px 0;
    }
  }

  span {
    color: #959595;
  }
`;
