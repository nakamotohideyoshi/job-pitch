import React from 'react';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import moment from 'moment';
import { List, Tooltip, message, Modal, Button, Drawer, Badge } from 'antd';

import DATA from 'utils/data';
import * as helper from 'utils/helper';
import colors from 'utils/colors';
import { getApplicationsSelector } from 'redux/selectors';
import { changeInterviewAction, removeInterviewAction } from 'redux/applications';
import { PageHeader, SearchBox, AlertMsg, ListEx, Icons, Logo, Loading, JobDetails } from 'components';
import Wrapper from './styled';

const { confirm } = Modal;

/* eslint-disable react/prop-types */
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
        this.props.changeInterviewAction({
          appId: app.id,
          id: app.interview.id,
          changeType: 'accept',
          onSuccess: () => {
            message.success('The interview is accepted');
          },
          onFail: () => {
            message.error('There was an error accepting the interview');
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
        this.props.removeInterviewAction({
          appId: app.id,
          id: app.interview.id,
          onSuccess: () => {
            message.success('The interview is cancelled');
          },
          onFail: () => {
            message.error('There was an error cancelling the interview');
          }
        });
      }
    });
  };

  filterOption = ({ job_data }) => {
    const searchText = this.state.searchText.toLowerCase();
    const name = helper.getJobSubName(job_data);
    return job_data.title.toLowerCase().indexOf(searchText) >= 0 || name.toLowerCase().indexOf(searchText) >= 0;
  };

  renderApplication = app => {
    const { id, job_data, loading } = app;
    const { title, contract, hours } = job_data;
    const logo = helper.getJobLogo(job_data);
    const name = helper.getJobSubName(job_data);
    const contractName = helper.getItemById(DATA.contracts, contract).short_name;
    const hoursName = helper.getItemById(DATA.hours, hours).short_name;
    const sector = helper.getNameByID(DATA.sectors, job_data.sector);

    const interview = app.interview || app.interviews.slice(-1)[0];

    let INTERVIEW_STATUS = {
      PENDING: 'Interview request received',
      ACCEPTED: 'Interview accepted',
      COMPLETED: 'This interview is done',
      CANCELLED: `Interview cancelled by ${interview.cancelled_by === DATA.ROLE.RECRUITER ? 'Recruiter' : 'Jobseeker'}`
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
        {loading && <Loading className="mask" />}
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

    const selectedApp = interviews && helper.getItemById(interviews, this.state.selectedId);
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
    const applications = getApplicationsSelector(state);
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
    changeInterviewAction,
    removeInterviewAction
  }
)(Interviews);
