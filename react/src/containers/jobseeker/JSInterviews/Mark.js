import styled from 'styled-components';

export default styled.div`
  position: absolute;
  top: 15px;
  left: -24px;
  width: 100px;
  line-height: 20px;
  font-size: 13px;
  background-color: #888;
  color: #fff !important;
  text-align: center;
  box-shadow: 0px 0px 15px rgba(0, 0, 0, 0.3);
  transform: rotate(-45deg);

  &:before,
  &:after {
    content: ' ';
    display: block;
    width: 100%;
    height: 0;
  }

  &:before {
    border-top: 1px solid #888;
    border-bottom: 1px dashed #ccc;
  }
  &:after {
    border-top: 1px dashed #ccc;
    border-bottom: 1px solid #888;
  }
`;
