import styled from 'styled-components';

export default styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;

  .row {
    > div {
      padding-bottom: 15px;
    }

    .card.closed {
      text-decoration: line-through;

      > div:first-child {
        opacity: 0.5;
      }
    }
  }

  .add {
    display: flex;
    justify-content: center;
    align-items: center;
    max-width: 250px;
    min-height: 260px;
    height: 100%;
    margin: auto;
    color: #888;
    border-style: dashed;
    cursor: pointer;
    text-align: center;
  }
`;
