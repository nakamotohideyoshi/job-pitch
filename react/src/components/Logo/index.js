import PropTypes from 'prop-types';
import styled, { css } from 'styled-components';

const Logo = styled.span`
  ${props =>
    css`
      display: inline-block;
      width: ${props.size};
      height: ${props.size};
      ${props.padding && `padding: ${props.padding};`};
      /* ${props.circle && `border-radius: 50%;`}; */
      background-size: contain;
      background-position: center;
      background-repeat: no-repeat;
      background-origin: content-box;
      ${props.src ? `background-image: url(${props.src})` : 'background-color: #f0f0f0'};
    `};
`;

Logo.propTypes = {
  size: PropTypes.string.isRequired,
  padding: PropTypes.string,
  circle: PropTypes.any, // PropTypes.bool
  src: PropTypes.string
};

Logo.defaultProps = {
  padding: null,
  circle: false,
  src: null
};

export default Logo;
