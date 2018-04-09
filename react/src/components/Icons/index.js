import React from 'react';
import { Icon } from 'antd';
import styled, { css } from 'styled-components';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import faSyncAlt from '@fortawesome/fontawesome-free-solid/faSyncAlt';
import faCheckSquare from '@fortawesome/fontawesome-free-regular/faCheckSquare';
import faStar from '@fortawesome/fontawesome-free-solid/faStar';
import faQuestionCircle from '@fortawesome/fontawesome-free-regular/faQuestionCircle';
import faSearch from '@fortawesome/fontawesome-free-solid/faSearch';
import faCog from '@fortawesome/fontawesome-free-solid/faCog';
import faSignOutAlt from '@fortawesome/fontawesome-free-solid/faSignOutAlt';
import faAngleLeft from '@fortawesome/fontawesome-free-solid/faAngleLeft';
import faAngleRight from '@fortawesome/fontawesome-free-solid/faAngleRight';
import faTimesCircle from '@fortawesome/fontawesome-free-solid/faTimesCircle';

const SVG = styled.svg`
  width: 1em;
  height: 1em;
  ${({ size }) =>
    size === 'xs' &&
    css`
      font-size: 0.75em;
    `};
  ${({ size }) =>
    size === 'sm' &&
    css`
      font-size: 0.875em;
    `};
  ${({ size }) =>
    size === 'lg' &&
    css`
      font-size: 1.33333em;
    `};
  ${({ size }) =>
    size === '2x' &&
    css`
      font-size: 2em;
    `};
  ${({ size }) =>
    size === '3x' &&
    css`
      font-size: 3em;
    `};
`;

const Video = props => (
  <SVG viewBox="0 0 576 512" {...props}>
    <path
      fill="currentColor"
      d="M528 64h-12.118a48 48 0 0 0-33.941 14.059L384 176v-64c0-26.51-21.49-48-48-48H48C21.49 64 0 85.49 0 112v288c0 26.51 21.49 48 48 48h288c26.51 0 48-21.49 48-48v-64l97.941 97.941A48 48 0 0 0 515.882 448H528c26.51 0 48-21.49 48-48V112c0-26.51-21.49-48-48-48zM336 400H48V112h288v288zm192 0h-12.118L384 268.118v-24.235L515.882 112H528v288z"
    />
  </SVG>
);

const Play = props => (
  <SVG viewBox="0 0 512 512" {...props}>
    <path
      fill="currentColor"
      d="M371.7 238l-176-107c-15.8-8.8-35.7 2.5-35.7 21v208c0 18.4 19.8 29.8 35.7 21l176-101c16.4-9.1 16.4-32.8 0-42zM504 256C504 119 393 8 256 8S8 119 8 256s111 248 248 248 248-111 248-248zm-448 0c0-110.5 89.5-200 200-200s200 89.5 200 200-89.5 200-200 200S56 366.5 56 256z"
    />
  </SVG>
);

const Send = props => (
  <SVG viewBox="0 0 512 512" {...props}>
    <path
      fill="currentColor"
      d="M476 3.2L12.5 270.6c-18.1 10.4-15.8 35.6 2.2 43.2L121 358.4l287.3-253.2c5.5-4.9 13.3 2.6 8.6 8.3L176 407v80.5c0 23.6 28.5 32.9 42.5 15.8L282 426l124.6 52.2c14.2 6 30.4-2.9 33-18.2l72-432C515 7.8 493.3-6.8 476 3.2z"
    />
  </SVG>
);

const Upload = props => <Icon type="upload" {...props} />;

const Refresh = props => <FontAwesomeIcon icon={faSyncAlt} {...props} />;
const Check = props => <FontAwesomeIcon icon={faCheckSquare} {...props} />;
const Star = props => <FontAwesomeIcon icon={faStar} {...props} />;
const QuestionCircle = props => <FontAwesomeIcon icon={faQuestionCircle} {...props} />;
const Search = props => <FontAwesomeIcon icon={faSearch} {...props} />;
const Settings = props => <FontAwesomeIcon icon={faCog} {...props} />;
const SignOut = props => <FontAwesomeIcon icon={faSignOutAlt} {...props} />;
const AngleRight = props => <FontAwesomeIcon icon={faAngleLeft} {...props} />;
const AngleLeft = props => <FontAwesomeIcon icon={faAngleRight} {...props} />;
const TimeCircle = props => <FontAwesomeIcon icon={faTimesCircle} {...props} />;

export default {
  Video,
  Play,
  Upload,
  Refresh,
  Check,
  Star,
  Search,
  QuestionCircle,
  Settings,
  SignOut,
  AngleRight,
  AngleLeft,
  TimeCircle,
  Send
};
