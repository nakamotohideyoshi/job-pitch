import React from 'react';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import { Modal, List, Tooltip, Button, Drawer, notification } from 'antd';
import moment from 'moment';

import { getApplications } from 'redux/selectors';
import { changeInterview, removeInterview } from 'redux/applications';
import DATA from 'utils/data';
import * as helper from 'utils/helper';

import { PageHeader, SearchBox, AlertMsg, ListEx, Icons, JobDetails, Logo } from 'components';
import NoPitch from '../components/NoPitch';
import Wrapper from './styled';

const { confirm } = Modal;

class MyApplications extends React.Component {
  state = {
    selectedId: null,
    searchText: ''
  };

  componentWillMount() {
    const { location } = this.props;
    const { appId } = location.state || {};
    if (appId) {
      this.setState({ selectedId: appId });
    }
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
    const { id, job_data, interview } = app;
    const { title, contract, hours } = job_data;
    const logo = helper.getJobLogo(job_data);
    const name = helper.getFullBWName(job_data);
    const contractName = helper.getItemByID(DATA.contracts, contract).short_name;
    const hoursName = helper.getItemByID(DATA.hours, hours).short_name;
    const sector = helper.getNameByID('sectors', job_data.sector);

    return (
      <List.Item
        key={id}
        actions={[
          <Tooltip placement="bottom" title="Message">
            <span onClick={e => this.onMessage(app, e)}>
              <Icons.CommentAlt />
            </span>
          </Tooltip>
        ]}
        onClick={() => this.onSelect(id)}
      >
        <List.Item.Meta
          avatar={<Logo src={logo} size="80px" padding="10px" />}
          title={`${title} (${name})`}
          description={`${sector} (${contractName} / ${hoursName})`}
        />
        {interview && (
          <div style={{ width: '160px', whiteSpace: 'pre-line' }} className={interview.status}>
            {interview.status === 'PENDING' ? 'Interview request received\n' : 'Interview accepted\n'}
            {moment(interview.at).format('ddd DD MMM, YYYY [at] H:mm')}
          </div>
        )}
      </List.Item>
    );
  };

  renderEmpty = () => (
    <AlertMsg>
      <span>You have no applications.</span>
    </AlertMsg>
  );

  render() {
    const { jobseeker, applications } = this.props;

    if (!helper.getPitch(jobseeker)) {
      return <NoPitch title="My Applications" />;
    }

    const selectedApp = applications && helper.getItemByID(applications, this.state.selectedId);
    const { interview } = selectedApp || {};

    return (
      <Wrapper className="container">
        <Helmet title="My Applications" />

        <PageHeader>
          <h2>My Applications</h2>
          <SearchBox width="200px" onChange={this.onChangeSearchText} />
        </PageHeader>

        <div className="content">
          <ListEx
            data={applications}
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
                  {(interview || {}).status === 'PENDING' && (
                    <Button type="primary" onClick={() => this.onAccept(selectedApp)}>
                      Accept Invitation
                    </Button>
                  )}
                  {interview && (
                    <Button type="danger" onClick={() => this.onCancel(selectedApp)}>
                      Cancel Interview
                    </Button>
                  )}
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
  state => ({
    jobseeker: state.js_profile.jobseeker,
    applications: getApplications(state)
  }),
  {
    changeInterview,
    removeInterview
  }
)(MyApplications);
