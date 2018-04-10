import React, { Fragment } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { Button, Modal, Switch } from 'antd';

import { connectApplication, updateApplication, removeApplication } from 'redux/applications';
import DATA from 'utils/data';

import { JobseekerDetail } from 'components';
import StyledModal from './styled';

const { confirm } = Modal;

class ApplicationDetails extends React.Component {
  componentWillReceiveProps(nextProps) {
    if (this.props.application.status !== nextProps.application.status) {
      this.props.onClose();
    }
  }

  message = () => this.props.history.push(`/recruiter/messages/${this.props.application.id}`);

  changeShortlisted = shortlisted => {
    this.props.updateApplication({
      data: {
        id: this.props.application.id,
        shortlisted
      }
    });
  };

  connect = () => {
    const { application, connectApplication, history } = this.props;
    const business = application.job_data.loation_data.business_data;

    if (business.tokens === 0) {
      confirm({
        title: 'You need 1 credit',
        okText: `Credits`,
        cancelText: 'Cancel',
        maskClosable: true,
        onOk: () => {
          history.push(`/recruiter/settings/credits/${business.id}`);
        }
      });
      return;
    }

    confirm({
      title: 'Yes, I want to make this connection (1 credit)',
      okText: `Connect`,
      cancelText: 'Cancel',
      maskClosable: true,
      onOk: () => {
        connectApplication({
          data: {
            id: application.id,
            connect: DATA.APP.ESTABLISHED
          }
        });
      }
    });
  };

  remove = () => {
    confirm({
      title: 'Are you sure you want to delete this applicaton?',
      okText: `Remove`,
      okType: 'danger',
      cancelText: 'Cancel',
      maskClosable: true,
      onOk: () => {
        this.props.removeApplication({
          id: this.props.application.id
        });
      }
    });
  };

  render() {
    const { application, location: { pathname }, onClose } = this.props;
    const { job_seeker, status, shortlisted, updating, removing } = application;
    const messageButton = pathname.indexOf('/recruiter/messages') !== 0;

    return (
      <StyledModal visible footer={null} className="container" title="Application Details" onCancel={onClose}>
        <div className="content">
          <JobseekerDetail className="job-detail" application={application} jobseeker={job_seeker} />

          {status !== DATA.APP.DELETED && (
            <div className="buttons">
              {status === DATA.APP.CREATED ? (
                <Button type="primary" loading={updating} onClick={this.connect}>
                  Connect
                </Button>
              ) : (
                <Fragment>
                  <div>
                    <span>Shortlisted</span>
                    <Switch checked={shortlisted} loading={updating} onChange={this.changeShortlisted} />
                  </div>
                  {messageButton && (
                    <Button type="primary" onClick={this.message}>
                      Message
                    </Button>
                  )}
                </Fragment>
              )}

              <Button type="danger" loading={removing} onClick={this.remove}>
                Remove
              </Button>
            </div>
          )}
        </div>
      </StyledModal>
    );
  }
}

export default withRouter(
  connect(null, {
    connectApplication,
    updateApplication,
    removeApplication
  })(ApplicationDetails)
);
