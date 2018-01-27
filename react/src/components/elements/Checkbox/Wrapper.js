import styled from 'styled-components';

export default styled.div`
  display: inline-flex;
  position: relative;
  height: auto;
  margin: 7px 0;

  > input {
    display: none;
  }

  > label {
    cursor: pointer;
    margin: 0;
    padding-left: 20px;
    font-weight: initial;

    > span {
      position: absolute;
      width: 19px;
      height: 19px;
      top: 0;
      left: 0;
      background: #fff;
      border: 1px solid #ced4da;
      border-radius: 3px;
    }
    > span:before {
      opacity: 0;
      content: '';
      position: absolute;
      width: 11px;
      height: 7px;
      top: 4px;
      left: 3px;
      border: 3px solid #000;
      border-top: none;
      border-right: none;
      transform: rotate(-45deg);
    }

    > div {
      margin-left: 5px;
      margin-top: -1px;
    }
  }

  > input[type='checkbox']:checked + label {
    > span {
      border: 1px solid #ced4da;
    }
    > span:before {
      opacity: 1;
    }
  }
`;
