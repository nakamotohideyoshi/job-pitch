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
        message: `${title} is removed successfully.`
      },
      failMsg: {
        message: `Removing ${title} is failed.`
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
        message: `${title} is closed.`
      },
      failMsg: {
        message: `Closing ${title} is failed.`
      }
    });
    onCancel();
  };

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
          <span className="ant-confirm-title">{`Are you sure you want to delete ${(job || {}).title}`}</span>
        </div>
        <div className="ant-confirm-btns">
          <Button onClick={onCancel}>Cancel</Button>
          <Button type="danger" onClick={onRemoveJob}>
            Remove
          </Button>
          {(job || {}).status === DATA.JOB.OPEN && (
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
