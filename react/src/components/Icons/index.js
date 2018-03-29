import React from 'react';
import { Icon } from 'antd';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import faSyncAlt from '@fortawesome/fontawesome-free-solid/faSyncAlt';
import faCheckSquare from '@fortawesome/fontawesome-free-regular/faCheckSquare';
import faStar from '@fortawesome/fontawesome-free-solid/faStar';

const Video = props => (
  <svg
    aria-hidden="true"
    data-prefix="far"
    data-icon="video"
    role="img"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 576 512"
    className="svg-inline--fa fa-video fa-w-18"
    {...props}
  >
    <path
      fill="currentColor"
      d="M528 64h-12.118a48 48 0 0 0-33.941 14.059L384 176v-64c0-26.51-21.49-48-48-48H48C21.49 64 0 85.49 0 112v288c0 26.51 21.49 48 48 48h288c26.51 0 48-21.49 48-48v-64l97.941 97.941A48 48 0 0 0 515.882 448H528c26.51 0 48-21.49 48-48V112c0-26.51-21.49-48-48-48zM336 400H48V112h288v288zm192 0h-12.118L384 268.118v-24.235L515.882 112H528v288z"
      className=""
    />
  </svg>
);

const Play = props => (
  <svg
    aria-hidden="true"
    data-prefix="far"
    data-icon="play-circle"
    role="img"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 512 512"
    className="svg-inline--fa fa-play-circle fa-w-16"
    {...props}
  >
    <path
      fill="currentColor"
      d="M371.7 238l-176-107c-15.8-8.8-35.7 2.5-35.7 21v208c0 18.4 19.8 29.8 35.7 21l176-101c16.4-9.1 16.4-32.8 0-42zM504 256C504 119 393 8 256 8S8 119 8 256s111 248 248 248 248-111 248-248zm-448 0c0-110.5 89.5-200 200-200s200 89.5 200 200-89.5 200-200 200S56 366.5 56 256z"
      className=""
    />
  </svg>
);

const Upload = props => <Icon type="upload" {...props} />;

const Refresh = props => <FontAwesomeIcon icon={faSyncAlt} {...props} />;
const Check = props => <FontAwesomeIcon icon={faCheckSquare} {...props} />;
const Star = props => <FontAwesomeIcon icon={faStar} {...props} />;

export default {
  Video,
  Play,
  Upload,
  Refresh,
  Check,
  Star
};
