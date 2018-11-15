import React from 'react';
import { connect } from 'react-redux';
import { Modal, Icon, Button } from 'antd';

import DATA from 'utils/data';
import { removeJobAction, updateJobAction } from 'redux/recruiter/jobs';

/* eslint-disable react/prop-types */
class DeleteDialog extends React.Component {
  deactivateJob = () => {
    const { job, updateJobAction, onCancel } = this.props;
    const { id, title } = job;
    updateJobAction({
      id,
      data: {
        status: DATA.JOB.CLOSED
      },
      successMsg: `${title} is closed`,
      failMsg: `There was an error closing ${title}`
    });
    onCancel();
  };

  removeJob = () => {
    const { job, removeJobAction, onCancel } = this.props;
    const { id, title } = job;
    removeJobAction({
      id,
      successMsg: `${title} is removed`,
      failMsg: `There was an error removing ${title}`
    });
    onCancel();
  };

  render() {
    const { job, removeJobAction, updateJobAction, onCancel, ...rest } = this.props;

    const isOpen = (job || {}).status === DATA.JOB.OPEN;
    let comment = 'Removing this job will permanently delete all related applications and messages.';
    if (isOpen) {
      comment = `${comment} If you just want to hide the job from the public, choose deactivate instead.`;
    }

    return (
      <Modal
        className="ant-modal-confirm ant-modal-confirm-confirm"
        closable={false}
        maskClosable={true}
        title={null}
        footer={null}
        onCancel={onCancel}
        {...rest}
      >
        <div className="ant-modal-confirm-body-wrapper">
          <div className="ant-modal-confirm-body">
            <Icon type="question-circle" />
            <div className="ant-modal-confirm-title">{comment}</div>
          </div>

          <div className="ant-modal-confirm-btns">
            <Button onClick={onCancel}>Cancel</Button>
            <Button type="danger" onClick={this.removeJob}>
              Remove
            </Button>
            {isOpen && (
              <Button type="danger" onClick={this.deactivateJob}>
                Deactivate
              </Button>
            )}
          </div>
        </div>
      </Modal>
    );
  }
}

export default connect(
  null,
  {
    updateJobAction,
    removeJobAction
  }
)(DeleteDialog);
