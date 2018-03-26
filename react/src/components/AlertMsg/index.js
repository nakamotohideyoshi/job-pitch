import styled from 'styled-components';

export default styled.div`
  /* position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0; */
  position: relative;
  padding: 60px 0;

  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  span {
    text-align: center;
    color: #8c8c8c;
    white-space: pre-line;

    & + a {
      margin-top: 10px;
    }
  }

  a {
    color: #00b6a4;

    svg {
      margin-right: 8px;
    }
  }
`;
