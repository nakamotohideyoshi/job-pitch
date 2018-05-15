import styled from 'styled-components';

export default styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 40px;

  > * {
    width: 100%;
  }

  > div {
    text-align: center;
  }

  .ant-btn {
    max-width: 350px;
    margin-top: 25px;
  }
`;
