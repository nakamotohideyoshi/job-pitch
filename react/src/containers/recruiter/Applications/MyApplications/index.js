import React from 'react';
import { connect } from 'react-redux';
import Truncate from 'react-truncate';
import { List, Modal, Avatar } from 'antd';

import { getApplications, connectApplication, removeApplication } from 'redux/applications';
import DATA from 'utils/data';
import * as helper from 'utils/helper';

import { AlertMsg, Loading, Logo, ListEx } from 'components';
import Header from '../Header';
import Wrapper from '../styled';
import Detail from './Detail';

const { confirm } = Modal;

class MyApplications extends React.Component {
  componentWillMount() {
    this.getApplications(true);
  }

  componentWillReceiveProps({ job }) {
    if (this.props.job !== job) {
      this.getApplications();
    }
  }

  getApplications = clear => {
    if (this.props.job) {
      this.props.getApplications({
        clear,
        params: {
          job: this.jobId,
          status: DATA.APP.CREATED
        }
      });
    }
  };

  select = appId => {
    const { job, history } = this.props;
    // history.push(`/recruiter/applications/apps/${job.id}/${appId}`);
  };

  connect = (id, event) => {
    event && event.stopPropagation();

    const { business, connectApplication, history } = this.props;

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
          id,
          data: {
            id,
            connect: DATA.APP.ESTABLISHED
          }
        });
      }
    });
  };

  remove = (id, e) => {
    e.stopPropagation();

    confirm({
      title: 'Are you sure you want to delete this applicaton?',
      okText: `Remove`,
      okType: 'danger',
      cancelText: 'Cancel',
      maskClosable: true,
      onOk: () => {
        this.props.removeApplication({ id });
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
          <span onClick={e => this.connect(app, e)}>Connect</span>,
          <span onClick={e => this.remove(app, e)}>Remove</span>
        ]}
        onClick={() => this.select(app)}
        className={loading ? 'loading' : ''}
      >
        <List.Item.Meta
          avatar={<Avatar src={image} className="avatar-80" />}
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
    const { applications, loading, error } = this.props;
    return (
      <Wrapper className="container">
        <Header />
        <div className="content">
          <ListEx
            data={applications}
            loadingSize="large"
            pagination={{ pageSize: 10 }}
            filterOption={this.filterOption}
            loading={loading}
            error={error}
            renderItem={this.renderApplication}
            emptyRender={
              <AlertMsg>
                <span>
                  {`No applications at the moment. Once that happens you can go trough them here,
                  shortlist and easy switch to Find Talent mode and "head hunt" as well.`}
                </span>
              </AlertMsg>
            }
          />
        </div>
      </Wrapper>
    );
  }
}

export default connect(
  (state, { match }) => {
    const jobId = helper.str2int(match.params.jobId);
    const job = helper.getItemByID(state.rc_jobs.jobs, jobId);
    const { applications, loading, error, searchText } = state.applications;
    return {
      job,
      applications,
      loading,
      error,
      searchText
    };
  },
  {
    getApplications,
    connectApplication,
    removeApplication
  }
)(MyApplications);
