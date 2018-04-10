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

const Bell = props => (
  <SVG viewBox="0 0 448 512" {...props}>
    <path
      fill="currentColor"
      d="M425.403 330.939c-16.989-16.785-34.546-34.143-34.546-116.083 0-83.026-60.958-152.074-140.467-164.762A31.843 31.843 0 0 0 256 32c0-17.673-14.327-32-32-32s-32 14.327-32 32a31.848 31.848 0 0 0 5.609 18.095C118.101 62.783 57.143 131.831 57.143 214.857c0 81.933-17.551 99.292-34.543 116.078C-25.496 378.441 9.726 448 66.919 448H160c0 35.346 28.654 64 64 64 35.346 0 64-28.654 64-64h93.08c57.19 0 92.415-69.583 44.323-117.061zM224 472c-13.234 0-24-10.766-24-24h48c0 13.234-10.766 24-24 24zm157.092-72H66.9c-16.762 0-25.135-20.39-13.334-32.191 28.585-28.585 51.577-55.724 51.577-152.952C105.143 149.319 158.462 96 224 96s118.857 53.319 118.857 118.857c0 97.65 23.221 124.574 51.568 152.952C406.278 379.661 397.783 400 381.092 400z"
    />
  </SVG>
);

const Bars = props => (
  <SVG viewBox="0 0 448 512" {...props}>
    <path
      fill="currentColor"
      d="M442 114H6a6 6 0 0 1-6-6V84a6 6 0 0 1 6-6h436a6 6 0 0 1 6 6v24a6 6 0 0 1-6 6zm0 160H6a6 6 0 0 1-6-6v-24a6 6 0 0 1 6-6h436a6 6 0 0 1 6 6v24a6 6 0 0 1-6 6zm0 160H6a6 6 0 0 1-6-6v-24a6 6 0 0 1 6-6h436a6 6 0 0 1 6 6v24a6 6 0 0 1-6 6z"
    />
  </SVG>
);

const Upload = props => <Icon type="upload" {...props} />;
// const Upload = props => <Icon type="menu-unfold" {...props} />;

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
  Send,
  Bars
};
