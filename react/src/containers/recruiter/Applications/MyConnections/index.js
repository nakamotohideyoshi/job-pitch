import React from 'react';
import { connect } from 'react-redux';
import Truncate from 'react-truncate';
import { List, Modal, Avatar, Tooltip } from 'antd';

import { getApplications, removeApplication } from 'redux/applications';
import DATA from 'utils/data';
import * as helper from 'utils/helper';

import { AlertMsg, Loading, ListEx, Icons } from 'components';
import ApplicationDetails from 'containers/recruiter/ApplicationDetails';
import Header from '../Header';
import Wrapper from '../styled';

const { confirm } = Modal;

class MyConnections extends React.Component {
  state = {
    selectedId: null
  };

  componentWillMount() {
    const { location } = this.props;
    const { appId } = location.state || {};
    if (appId) {
      this.setState({
        selectedId: appId
      });
    } else {
      this.getApplications();
    }
  }

  componentWillReceiveProps({ job, shortlist }) {
    if (this.props.job !== job || this.props.shortlist !== shortlist) {
      this.getApplications(job);
    }
  }

  getApplications = job => {
    const jobId = (job || this.props.job || {}).id;
    const { getApplications, shortlist } = this.props;
    jobId &&
      getApplications({
        params: {
          job: jobId,
          status: DATA.APP.ESTABLISHED,
          shortlist: shortlist && 1
        }
      });
  };

  showDetails = selectedId => {
    this.setState({ selectedId });
  };

  hideDetails = () => {
    this.setState({ selectedId: null });
  };

  message = ({ id }, event) => {
    event && event.stopPropagation();
    this.props.history.push(`/recruiter/messages/${id}`);
  };

  remove = ({ id }, event) => {
    event && event.stopPropagation();

    confirm({
      content: 'Are you sure you want to delete this applicaton?',
      okText: `Remove`,
      okType: 'danger',
      cancelText: 'Cancel',
      maskClosable: true,
      onOk: () => {
        this.props.removeApplication({
          id,
          successMsg: {
            message: `Application is removed.`
          },
          failMsg: {
            message: `Removing is failed.`
          }
        });
      }
    });
  };

  filterOption = ({ job_seeker }) =>
    helper
      .getFullJSName(job_seeker)
      .toLowerCase()
      .indexOf(this.props.searchText.toLowerCase()) >= 0;

  renderApplication = app => {
    const { job_seeker, loading } = app;
    const image = helper.getPitch(job_seeker).thumbnail;
    const fullName = helper.getFullJSName(job_seeker);
    return (
      <List.Item
        key={job_seeker.id}
        actions={[
          <Tooltip placement="bottom" title="Message">
            <span onClick={e => this.message(app, e)}>
              <Icons.Comment />
            </span>
          </Tooltip>,
          <Tooltip placement="bottom" title="Remove">
            <span onClick={e => this.remove(app, e)}>
              <Icons.TrashAlt />
            </span>
          </Tooltip>
        ]}
        onClick={() => this.showDetails(app.id)}
        className={loading ? 'loading' : ''}
      >
        <List.Item.Meta
          avatar={
            <span>
              <Avatar src={image} className="avatar-80" />
              {app.shortlisted && <Icons.Star />}
            </span>
          }
          title={fullName}
          description={
            <Truncate lines={2} ellipsis={<span>...</span>}>
              {job_seeker.description}
            </Truncate>
          }
        />
        {loading && <Loading className="mask" size="small" />}
      </List.Item>
    );
  };

  render() {
    const { job, shortlist, applications, error } = this.props;
    const selectedApp = helper.getItemByID(applications, this.state.selectedId);
    return (
      <Wrapper className="container">
        <Header />
        <div className="content">
          {job && (
            <ListEx
              data={applications}
              loadingSize="large"
              pagination={{ pageSize: 10 }}
              filterOption={this.filterOption}
              error={error}
              renderItem={this.renderApplication}
              emptyRender={
                <AlertMsg>
                  <span>
                    {shortlist
                      ? `You have not shortlisted any applications for this job,
                       turn off shortlist view to see the non-shortlisted applications.`
                      : `No candidates have applied for this job yet.
                       Once that happens, their applications will appear here.`}
                  </span>
                </AlertMsg>
              }
            />
          )}
        </div>

        {selectedApp && <ApplicationDetails application={selectedApp} onClose={this.hideDetails} />}
      </Wrapper>
    );
  }
}

export default connect(
  (state, { match }) => {
    const jobId = helper.str2int(match.params.jobId);
    const job = helper.getItemByID(state.rc_jobs.jobs, jobId);
    const { applications, error, searchText } = state.applications;
    const shortlist = match.path.split('/')[3] === 'shortlist';
    return {
      job,
      shortlist,
      applications: applications
        ? applications.filter(
            ({ status, shortlisted }) => status === DATA.APP.ESTABLISHED && (!shortlist || shortlisted)
          )
        : null,
      error,
      searchText
    };
  },
  {
    getApplications,
    removeApplication
  }
)(MyConnections);
