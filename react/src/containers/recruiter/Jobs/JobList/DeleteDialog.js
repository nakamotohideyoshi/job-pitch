import React from 'react';
import { connect } from 'react-redux';
import { Modal, Icon, Button } from 'antd';
import DATA from 'utils/data';
import { removeJob, saveJob } from 'redux/recruiter/jobs';

const DeleteDialog = ({ job, removeJob, saveJob, onCancel }) => {
  const { id, title } = job || {};
  const onRemoveJob = () => {
    removeJob({
      id,
      successMsg: {
        message: `Job(${title}) is removed.`
      },
      failMsg: {
        message: `Removing job(${title}) is failed.`
      }
    });
    onCancel();
  };

  const onDeactivateJob = () => {
    saveJob({
      data: {
        ...job,
        status: DATA.JOB.CLOSED
      },
      successMsg: {
        message: `Job(${title}) is closed.`
      },
      failMsg: {
        message: `Closing job(${title}) is failed.`
      }
    });
    onCancel();
  };

  const isOpen = (job || {}).status === DATA.JOB.OPEN;
  let comment = 'Removing this job will permanently delete all related applications and messages.';
  if (isOpen) {
    comment = `${comment} If you just want to hide the job from the public, choose deactivate instead.`;
  }

  return (
    <Modal
      className="ant-confirm ant-confirm-confirm"
      closable={false}
      maskClosable={true}
      title={null}
      visible={!!job}
      footer={null}
      onCancel={onCancel}
    >
      <div className="ant-confirm-body-wrapper">
        <div className="ant-confirm-body">
          <Icon type="question-circle" />
          <div className="ant-confirm-content">{comment}</div>
        </div>
        <div className="ant-confirm-btns">
          <Button onClick={onCancel}>Cancel</Button>
          <Button type="danger" onClick={onRemoveJob}>
            Remove
          </Button>
          {isOpen && (
            <Button type="danger" onClick={onDeactivateJob}>
              Deactivate
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default connect(null, {
  saveJob,
  removeJob
})(DeleteDialog);
