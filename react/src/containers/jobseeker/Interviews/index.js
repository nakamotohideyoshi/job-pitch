import React from 'react';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import { List, Tooltip, notification, Modal, Button, Drawer } from 'antd';
import moment from 'moment';

import { getApplications } from 'redux/applications';
import { removeInterview } from 'redux/interviews';
import { changeInterview } from 'redux/interviews';
import * as helper from 'utils/helper';

import { PageHeader, SearchBox, AlertMsg, ListEx, Icons, JobDetails, Logo, Loading } from 'components';
import NoPitch from '../components/NoPitch';
import Wrapper from './styled';

import * as _ from 'lodash';

const { confirm } = Modal;

class JSInterviews extends React.Component {
  state = {
    selectedId: null,
    searchText: ''
  };

  componentWillMount() {
    this.props.getApplications();
  }

  onChangeSearchText = searchText => this.setState({ searchText });

  onSelect = selectedId => this.setState({ selectedId });

  onMessage = ({ id }, event) => {
    event && event.stopPropagation();
    this.props.history.push(`/jobseeker/messages/${id}/`);
  };

  onAccept = (app, event) => {
    event && event.stopPropagation();

    confirm({
      content: 'Are you sure you want to accept this interview?',
      okText: `Accept`,
      okType: 'primary',
      cancelText: 'Cancel',
      maskClosable: true,
      onOk: () => {
        this.props.changeInterview({
          data: {
            id: app.interview.id,
            changeType: 'accept'
          },
          success: () => {
            this.setState({
              selectedApp: null
            });
            notification.success({
              message: 'Notification',
              description: 'Interview is accepted successfully.'
            });
          },
          fail: () => {
            this.setState({
              selectedApp: null
            });
            notification.error({
              message: 'Notification',
              description: 'Accepting is failed'
            });
          }
        });
      }
    });
  };

  onRemove = (app, event) => {
    event && event.stopPropagation();

    confirm({
      content: 'Are you sure you want to cancel this interview?',
      okText: `Yes`,
      okType: 'danger',
      cancelText: 'No',
      maskClosable: true,
      onOk: () => {
        this.props.removeInterview({
          id: app.interview.id,
          successMsg: {
            message: `Interview is cancelled.`
          },
          failMsg: {
            message: `Cancelling is failed.`
          }
        });
        this.setState({
          selectedApp: null
        });
      }
    });
  };

  filterOption = ({ job_data }) => {
    const searchText = this.state.searchText.toLowerCase();
    const name = helper.getFullBWName(job_data);
    return job_data.title.toLowerCase().indexOf(searchText) >= 0 || name.toLowerCase().indexOf(searchText) >= 0;
  };

  renderApplication = app => {
    const { id, job_data, interview, loading } = app;
    const { title } = job_data;
    const logo = helper.getJobLogo(job_data);
    const name = helper.getFullBWName(job_data);

    const INTERVIEW_STATUS = {
      PENDING: 'Pending',
      ACCEPTED: 'Accepted'
    };
    let interviewStatus = INTERVIEW_STATUS[interview.status];

    let actions = [
      <Tooltip placement="bottom" title="Cancel Invitation">
        <span onClick={e => this.onRemove(app, e)}>
          <Icons.Times />
        </span>
      </Tooltip>,
      <Tooltip placement="bottom" title="Message">
        <span onClick={e => this.onMessage(app, e)}>
          <Icons.CommentAlt />
        </span>
      </Tooltip>
    ];
    if (interview.status === 'PENDING') {
      actions.unshift(
        <Tooltip placement="bottom" title="Accept Invitation">
          <span onClick={e => this.onRemove(app, e)}>
            <Icons.Check />
          </span>
        </Tooltip>
      );
    }

    return (
      <List.Item key={id} actions={actions} onClick={() => this.onSelect(id)} className={loading ? 'loading' : ''}>
        <List.Item.Meta avatar={<Logo src={logo} size="80px" padding="10px" />} title={title} description={name} />
        <span style={{ width: '180px' }}>
          <div>{interviewStatus}</div>
          <div>{moment(interview.at).format('ddd DD MMM, YYYY [at] H:mm')}</div>
        </span>
        {loading && <Loading className="mask" size="small" />}
      </List.Item>
    );
  };

  renderEmpty = () => (
    <AlertMsg>
      <span>You have no interviews.</span>
    </AlertMsg>
  );

  render() {
    const { jobseeker, interviews, error } = this.props;

    if (!helper.getPitch(jobseeker)) {
      return <NoPitch title="Interviews" />;
    }

    const selectedApp = interviews && helper.getItemByID(interviews, this.state.selectedId);

    return (
      <Wrapper className="container">
        <Helmet title="Interviews" />

        <PageHeader>
          <h2>Interviews</h2>
          <SearchBox width="200px" onChange={this.onChangeSearchText} />
        </PageHeader>

        <div className="content">
          <ListEx
            data={interviews}
            loadingSize="large"
            pagination={{ pageSize: 10 }}
            filterOption={this.filterOption}
            error={error && 'Server Error!'}
            renderItem={this.renderApplication}
            emptyRender={this.renderEmpty}
          />
        </div>

        <Drawer placement="right" closable={false} onClose={() => this.onSelect()} visible={!!selectedApp}>
          {selectedApp && (
            <JobDetails
              application={selectedApp}
              actions={
                <div>
                  <Button type="primary" onClick={() => this.onMessage(selectedApp)}>
                    Message
                  </Button>
                  {selectedApp.interview.status === 'PENDING' && (
                    <Button type="primary" onClick={() => this.onAccept(selectedApp)}>
                      Accept Invitation
                    </Button>
                  )}
                  <Button type="danger" onClick={e => this.onRemove(selectedApp)}>
                    Cancel Invitation
                  </Button>
                </div>
              }
            />
          )}
        </Drawer>
      </Wrapper>
    );
  }
}

export default connect(
  state => {
    const { applications } = state.applications;
    applications &&
      applications.forEach(application => {
        // application.interview = application.interviews.filter(
        //   ({ status }) => status === 'PENDING' || status === 'ACCEPTED'
        // )[0];
        application.interview = { ...application.interviews[0], status: 'PENDING' };
      });

    const interviews = applications && applications.filter(({ interview }) => interview);
    return {
      jobseeker: state.js_profile.jobseeker,
      interviews,
      error: state.applications.error
    };
  },
  {
    getApplications,
    changeInterview,
    removeInterview
  }
)(JSInterviews);
