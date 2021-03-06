import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Upload, Button, message } from 'antd';

import * as helper from 'utils/helper';
import { Icons, Logo } from 'components';

const Wrapper = styled.div`
  display: flex;

  .logo {
    line-height: 0;
    padding: 8px;
    margin-right: 15px;
    border-radius: 4px;
    border: 1px solid #d9d9d9;
  }

  .buttons {
    display: flex;
    flex-direction: column;

    .btn-upload {
      padding: 0;
      label {
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 0 15px;
        cursor: pointer;
      }
      input {
        display: none;
      }
    }

    .ant-btn {
      margin-bottom: 8px;
    }
  }
`;

class ImageSelector extends React.Component {
  removeLogo = () => {
    this.props.onChange();
  };

  setLogo = ({ file }) => {
    if (file.type !== 'image/png' && file.type !== 'image/jpeg') {
      message.error('You can only upload JPG or PNG file!');
      return;
    }

    helper.getBase64(file, url => {
      this.props.onChange(file, url);
    });
  };

  render() {
    const { url, removable } = this.props;

    return (
      <Wrapper>
        <div className="logo">
          <Logo src={url} size="150px" />
        </div>
        <div className="buttons">
          <Upload showUploadList={false} beforeUpload={() => false} onChange={this.setLogo}>
            <Button>
              <Icons.Hdd /> Select File
            </Button>
          </Upload>

          {removable && (
            <Button type="danger" onClick={this.removeLogo}>
              Remove
            </Button>
          )}
        </div>
      </Wrapper>
    );
  }
}

ImageSelector.propTypes = {
  onChange: PropTypes.func.isRequired,
  url: PropTypes.string,
  removable: PropTypes.any, // PropTypes.bool
  circle: PropTypes.any // PropTypes.bool
};

ImageSelector.defaultProps = {
  url: null,
  removable: false,
  circle: false
};

export default ImageSelector;
