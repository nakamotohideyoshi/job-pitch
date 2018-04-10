import styled from 'styled-components';

export const Wrapper = styled.div`
  width: 100%;
  max-width: 600px;
`;

export const HelpContent = styled.div`
  font-size: 14px;
  color: #8c8c8c;
  text-align: center;
`;

export const VideoContent = styled.div`
  position: relative;
  margin-top: 15px;

  video {
    width: 100%;
    background-color: #000;
  }

  span {
    display: flex;
    justify-content: center;
    align-items: center;
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
  }
`;

export const ButtonContent = styled.div`
  margin-top: 20px;
  text-align: center;

  > div {
    display: inline-block;
  }

  button {
    width: 150px;
    margin: 0 10px;
    svg {
      margin-right: 10px;
    }
  }
`;
