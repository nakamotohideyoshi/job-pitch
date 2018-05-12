import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import styled, { css } from 'styled-components';
import { Modal, Input } from 'antd';
import { Icons } from 'components';

const LinkIcon = styled.div`
  ${({ round, size }) => css`
    display: inline-flex;
    background: #e0e0e0;
    width: ${size}px;
    height: ${size}px;
    justify-content: center;
    align-items: center;
    ${round && 'border-radius: 50%;'};
  `};
`;

const StyledModal = styled(Modal)`
  .ant-input-group-addon {
    cursor: pointer;
  }

  .ant-form-explain {
    margin-top: 8px;
  }
`;

class ShareLink extends React.Component {
  state = {
    showDialog: false
  };

  copyLink = () => {
    this.inputRef.input.select();
    document.execCommand('Copy');
  };

  openDialog = () => {
    this.setState({ showDialog: true });
  };

  closeDialog = () => {
    this.setState({ showDialog: false });
  };

  render() {
    const { url, round, size, title, comment } = this.props;
    return (
      <Fragment>
        <LinkIcon round={round} size={size} onClick={this.openDialog}>
          <Icons.Link />
        </LinkIcon>
        <StyledModal visible={this.state.showDialog} title={title} footer={null} onCancel={this.closeDialog}>
          <Input
            readOnly
            addonAfter={<div onClick={this.copyLink}>Copy link</div>}
            defaultValue={url}
            ref={ref => {
              this.inputRef = ref;
            }}
          />
          <div className="ant-form-explain">{comment}</div>
        </StyledModal>
      </Fragment>
    );
  }
}

ShareLink.propTypes = {
  url: PropTypes.string.isRequired,
  round: PropTypes.bool,
  size: PropTypes.number,
  title: PropTypes.string,
  comment: PropTypes.string
};

ShareLink.defaultProps = {
  round: true,
  size: 32,
  title: 'Share Link',
  comment: 'Share this link on your website, in an email, or anywhere else.'
};

export default ShareLink;
