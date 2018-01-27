import styled from 'styled-components';
import { Link } from 'react-router-dom';

export default styled(Link)`
  display: inline-block;
  width: 250px;
  margin: 0 15px 25px 15px;
  padding: 6px 0;
  color: #fff !important;
  border: 1px solid white;
  border-radius: 250px;
  transition: background-color 0.5s ease 0s;
  text-decoration: none !important;

  background-color: ${props => (props.recruiter ? 'rgba(0, 182, 164, 0.5)' : 'rgba(255, 147, 0, 0.5)')};
  &:hover {
    background-color: ${props => (props.recruiter ? 'rgba(0, 182, 164, 1)' : 'rgba(255, 147, 0, 1)')};
  }

  span {
    display: block;
    &:first-child {
      font-size: 16px;
    }
    &:last-child {
      font-size: 24px;
    }
  }
`;
