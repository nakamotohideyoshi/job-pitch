import React from 'react';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import { List, Tooltip, notification, Modal, Button, Drawer, Badge } from 'antd';
import moment from 'moment';

import { getApplications } from 'redux/selectors';
import { changeInterview, removeInterview } from 'redux/applications';
import DATA from 'utils/data';
import colors from 'utils/colors';
import * as helper from 'utils/helper';

import { PageHeader, SearchBox, AlertMsg, ListEx, Icons, JobDetails, Logo, Loading } from 'components';
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
      title: 'Are you sure you want to accept this interview?',
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
      title: 'Are you sure you want to cancel this interview?',
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
    const { id, job_data, loading } = app;
    const { title, contract, hours } = job_data;
    const logo = helper.getJobLogo(job_data);
    const name = helper.getFullBWName(job_data);
    const contractName = helper.getItemByID(DATA.contracts, contract).short_name;
    const hoursName = helper.getItemByID(DATA.hours, hours).short_name;
    const sector = helper.getNameByID('sectors', job_data.sector);

    const interview = app.interview || app.interviews.slice(-1)[0];

    let INTERVIEW_STATUS = {
      PENDING: 'Interview request received',
      ACCEPTED: 'Interview accepted',
      COMPLETED: 'This interview is done',
      CANCELLED: `Interview cancelled by ${
        helper.getNameByID('roles', interview.cancelled_by) === 'RECRUITER' ? 'Recruiter' : 'Jobseeker'
      }`
    };

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
        <List.Item.Meta
          avatar={<Logo src={logo} size="80px" padding="10px" />}
          title={`${title} (${name})`}
          description={`${sector} (${contractName} / ${hoursName})`}
        />
        <div style={{ width: '160px', whiteSpace: 'pre-line' }} className={interview.status}>
          {`${INTERVIEW_STATUS[interview.status]} (${moment(interview.at).format('ddd DD MMM, YYYY [at] H:mm')})`}
        </div>
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
    const { interviews } = this.props;

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

        <Drawer placement="right" onClose={() => this.onSelect()} visible={!!selectedApp}>
          {selectedApp && (
            <JobDetails
              application={selectedApp}
              actions={
                <div>
                  <Button type="primary" onClick={() => this.onMessage(selectedApp)}>
                    Message
                    {selectedApp.newMsgs > 0 && (
                      <Badge
                        count={selectedApp.newMsgs > 9 ? '9+' : selectedApp.newMsgs}
                        style={{ backgroundColor: colors.yellow, marginLeft: '8px' }}
                      />
                    )}
                  </Button>
                  {(interview || {}).status === 'PENDING' && (
                    <Button type="primary" onClick={() => this.onAccept(selectedApp)}>
                      Accept Invitation
                    </Button>
                  )}
                  {((interview || {}).status === 'PENDING' || (interview || {}).status === 'ACCEPTED') && (
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
  state => {
    const applications = getApplications(state);
    const interviews =
      applications && applications.filter(({ interview, interviews }) => interview || interviews.length);
    interviews.sort((a, b) => {
      let interview1 = a.interview || a.interviews.slice(-1)[0];
      let interview2 = b.interview || b.interviews.slice(-1)[0];
      return interview1.at < interview2.at ? 1 : -1;
    });

    return {
      interviews
    };
  },
  {
    changeInterview,
    removeInterview
  }
)(Interviews);
