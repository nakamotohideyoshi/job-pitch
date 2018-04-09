import React, { Fragment } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { Button, Modal, Switch } from 'antd';

import { JobseekerDetail } from 'components';
import * as helper from 'utils/helper';
import DATA from 'utils/data';
import StyledModal from './styled';

import { connectApplication, updateApplication, removeApplication } from 'redux/recruiter/applications';

const { confirm } = Modal;

class ApplicationDetails extends React.Component {
  componentWillReceiveProps(nextProps) {
    const { application: { status }, onClose } = this.props;
    if (status !== nextProps.application.status) {
      onClose();
    }
  }

  message = () => this.props.history.push(`/recruiter/messages/${this.props.appId}`);

  changeShortlisted = shortlisted => {
    const { id } = this.props.application;
    this.props.updateApplication({
      id,
      data: {
        id,
        shortlisted
      }
    });
  };

  connect = () => {
    const { application: { id, job_data }, connectApplication, history } = this.props;
    const { id: businessId, tokens } = job_data.loation_data.business_data;

    if (tokens === 0) {
      confirm({
        title: 'You need 1 credit',
        okText: `Credits`,
        cancelText: 'Cancel',
        maskClosable: true,
        onOk: () => {
          history.push(`/recruiter/settings/credits/${businessId}`);
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
          id,
          data: {
            id,
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
        const { id } = this.props.application;
        this.props.removeApplication({ id });
      }
    });
  };

  render() {
    const {
      application: { job_seeker, status, shortlisted },
      updating,
      removing,
      location: { pathname },
      onClose
    } = this.props;
    const messageButton = pathname.indexOf('/recruiter/messages') !== 0;

    return (
      <StyledModal visible footer={null} className="container" title="Application Details" onCancel={onClose}>
        <div className="content">
          <JobseekerDetail className="job-detail" jobseeker={job_seeker} />

          {status !== DATA.APP.DELETED && (
            <div className="buttons">
              {status === DATA.APP.CREATED ? (
                <Button type="primary" loading={!!updating} disabled={removing} onClick={this.connect}>
                  Connect
                </Button>
              ) : (
                <Fragment>
                  <div>
                    <span>Shortlisted</span>
                    <Switch checked={shortlisted} loading={!!updating} onChange={this.changeShortlisted} />
                  </div>
                  {messageButton && (
                    <Button type="primary" disabled={removing} onClick={this.message}>
                      Message
                    </Button>
                  )}
                </Fragment>
              )}

              <Button type="danger" loading={!!removing} disabled={updating} onClick={this.remove}>
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
  connect(
    (state, props) => ({
      application: helper.getItemByID(state.rc_applications.applications, props.appId),
      updating: state.rc_applications.updating,
      removing: state.rc_applications.removing
    }),
    {
      connectApplication,
      updateApplication,
      removeApplication
    }
  )(ApplicationDetails)
);
