import React from 'react';
import { connect } from 'react-redux';
import { Modal, Icon, Button } from 'antd';

import { removeJob, saveJob } from 'redux/recruiter/jobs';
import DATA from 'utils/data';

class DeleteDialog extends React.Component {
  state = {
    job: null
  };

  componentWillReceiveProps(nextProps) {
    const { job } = nextProps;
    job && this.setState({ job });
  }

  onDeactivateJob = () => {
    const { job, saveJob, onCancel } = this.props;
    const { title } = job;
    saveJob({
      data: {
        ...job,
        status: DATA.JOB.CLOSED
      },
      successMsg: {
        message: `The job(${title}) is closed`
      },
      failMsg: {
        message: `There was an error closing the job(${title})`
      }
    });
    onCancel();
  };

  onRemoveJob = () => {
    const { job, removeJob, onCancel } = this.props;
    const { id, title } = job;
    removeJob({
      id,
      successMsg: {
        message: `The job(${title}) is removed`
      },
      failMsg: {
        message: `There was an error removing the job(${title})`
      }
    });
    onCancel();
  };

  render() {
    const { removeJob, saveJob, onCancel, ...rest } = this.props;
    const job = this.props.job || this.state.job;

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
        footer={null}
        onCancel={onCancel}
        {...rest}
      >
        <div className="ant-confirm-body-wrapper">
          <div className="ant-confirm-body">
            <Icon type="question-circle" />
            <div className="ant-confirm-content">{comment}</div>
          </div>

          <div className="ant-confirm-btns">
            <Button onClick={onCancel}>Cancel</Button>
            <Button type="danger" onClick={this.onRemoveJob}>
              Remove
            </Button>
            {isOpen && (
              <Button type="danger" onClick={this.onDeactivateJob}>
                Deactivate
              </Button>
            )}
          </div>
        </div>
      </Modal>
    );
  }
}

export default connect(null, {
  saveJob,
  removeJob
})(DeleteDialog);
