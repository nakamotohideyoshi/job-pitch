import React from 'react';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import moment from 'moment';
import { Modal, List, Tooltip, Button, Drawer, message, Badge } from 'antd';

import DATA from 'utils/data';
import * as helper from 'utils/helper';
import colors from 'utils/colors';
import { getApplicationsSelector } from 'redux/selectors';
import { changeInterviewAction, removeInterviewAction } from 'redux/applications';
import { PageHeader, SearchBox, AlertMsg, ListEx, Icons, Logo, JobDetails } from 'components';
import Wrapper from './styled';

const { confirm } = Modal;

/* eslint-disable react/prop-types */
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
    const { id, job_data, interview } = app;
    const { title, contract, hours } = job_data;
    const logo = helper.getJobLogo(job_data);
    const name = helper.getJobSubName(job_data);
    const contractName = helper.getItemById(DATA.contracts, contract).short_name;
    const hoursName = helper.getItemById(DATA.hours, hours).short_name;
    const sector = helper.getNameByID(DATA.sectors, job_data.sector);

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
    const { applications } = this.props;

    const selectedApp = applications && helper.getItemById(applications, this.state.selectedId);
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
                  <Button type="primary" disabled={selectedApp.loading} onClick={() => this.onMessage(selectedApp)}>
                    Message
                    {selectedApp.newMsgs > 0 && (
                      <Badge
                        count={selectedApp.newMsgs > 9 ? '9+' : selectedApp.newMsgs}
                        style={{ backgroundColor: colors.yellow, marginLeft: '8px' }}
                      />
                    )}
                  </Button>
                  {(interview || {}).status === 'PENDING' && (
                    <Button type="primary" disabled={selectedApp.loading} onClick={() => this.onAccept(selectedApp)}>
                      Accept Interview
                    </Button>
                  )}
                  {interview && (
                    <Button type="danger" disabled={selectedApp.loading} onClick={() => this.onCancel(selectedApp)}>
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
    applications: getApplicationsSelector(state)
  }),
  {
    changeInterviewAction,
    removeInterviewAction
  }
)(MyApplications);
