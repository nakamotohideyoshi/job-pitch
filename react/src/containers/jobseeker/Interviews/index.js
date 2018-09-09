import React from 'react';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import { List, Tooltip, notification, Modal, Button, Drawer } from 'antd';
import moment from 'moment';

import { getApplications } from 'redux/selectors';
import { changeInterview, removeInterview } from 'redux/applications';
import * as helper from 'utils/helper';

import { PageHeader, SearchBox, AlertMsg, ListEx, Icons, JobDetails, Logo, Loading } from 'components';
import NoPitch from '../components/NoPitch';
import Wrapper from './styled';

const { confirm } = Modal;

class Interviews extends React.Component {
  state = {
    selectedId: null,
    searchText: ''
  };

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
      cancelText: 'Cancel',
      maskClosable: true,
      onOk: () => {
        this.props.changeInterview({
          appId: app.id,
          id: app.interview.id,
          changeType: 'accept',
          onSuccess: () => {
            notification.success({
              message: 'Success',
              description: 'The interview is accepted'
            });
          },
          onFail: () => {
            notification.error({
              message: 'Error',
              description: 'There was an error accepting the interview'
            });
          }
        });
      }
    });
  };

  onCancel = (app, event) => {
    event && event.stopPropagation();

    confirm({
      content: 'Are you sure you want to cancel this interview?',
      okText: `Ok`,
      okType: 'danger',
      cancelText: 'Cancel',
      maskClosable: true,
      onOk: () => {
        this.props.removeInterview({
          appId: app.id,
          id: app.interview.id,
          onSuccess: () => {
            notification.success({
              message: 'Success',
              description: 'The interview is cancelled'
            });
          },
          onFail: () => {
            notification.error({
              message: 'Error',
              description: 'There was an error cancelling the interview'
            });
          }
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

    let interviewStatus = {
      PENDING: 'Pending',
      ACCEPTED: 'Accepted'
    }[interview.status];

    let actions = [
      <Tooltip placement="bottom" title="Cancel Interview">
        <span onClick={e => this.onCancel(app, e)}>
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
          <span onClick={e => this.onAccept(app, e)}>
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
    const { jobseeker, interviews } = this.props;

    if (!helper.getPitch(jobseeker)) {
      return <NoPitch title="Interviews" />;
    }

    const selectedApp = interviews && helper.getItemByID(interviews, this.state.selectedId);
    const { interview } = selectedApp || {};

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
                  {interview.status === 'PENDING' && (
                    <Button type="primary" onClick={() => this.onAccept(selectedApp)}>
                      Accept Invitation
                    </Button>
                  )}
                  <Button type="danger" onClick={() => this.onCancel(selectedApp)}>
                    Cancel Interview
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
    const applications = getApplications(state);
    const interviews = applications && applications.filter(({ interview }) => interview);
    return {
      jobseeker: state.js_profile.jobseeker,
      interviews
    };
  },
  {
    changeInterview,
    removeInterview
  }
)(Interviews);