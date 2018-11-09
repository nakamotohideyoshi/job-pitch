import PropTypes from 'prop-types';
import styled, { css } from 'styled-components';
import colors from 'utils/colors';

const AlertMsg = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  left: 15px;
  right: 15px;
  padding: 70px 0;

  display: flex;
  flex-direction: column;
  justify-content: center;
  text-align: center;
  white-space: pre-line;
  color: ${colors.text3};
  ${props =>
    props.error &&
    css`
      color: ${colors.error};
    `};

  span + a {
    margin-top: 5px;
    margin-bottom: 10px;
  }

  a {
    color: ${colors.primary};

    svg {
      margin-right: 8px;
    }
  }
`;

AlertMsg.propTypes = {
  error: PropTypes.any // PropTypes.bool
};

AlertMsg.defaultProps = {
  error: false
};

export default AlertMsg;
