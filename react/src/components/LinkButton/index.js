import PropTypes from 'prop-types';
import styled, { css } from 'styled-components';
import colors from 'utils/colors';

const LinkButton = styled.a`
  cursor: pointer;
  color: ${colors.green} !important;

  ${props => props.underline && css``};

  svg {
    margin-right: 8px;
  }
`;

LinkButton.propTypes = {
  underline: PropTypes.any // PropTypes.bool
};

LinkButton.defaultProps = {
  underline: false
};

export default LinkButton;
