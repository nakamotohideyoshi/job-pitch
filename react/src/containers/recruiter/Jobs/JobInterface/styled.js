import styled from 'styled-components';

export default styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 40px 0;

  > * {
    width: 100%;
  }

  > div {
    display: flex;
    justify-content: space-between;
    align-items: center;

    h3 {
      /* text-align: left; */
    }
  }

  .ant-btn {
    max-width: 350px;
    margin-top: 25px;
  }
`;
