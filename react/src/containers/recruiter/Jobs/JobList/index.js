import React from 'react';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { Breadcrumb, List, Tooltip } from 'antd';

import DATA from 'utils/data';
import * as helper from 'utils/helper';
import colors from 'utils/colors';
import { getJobsSelector, getApplicationsSelector } from 'redux/selectors';
import { selectBusinessAction } from 'redux/businesses';
import {
  PageHeader,
  PageSubHeader,
  AlertMsg,
  LinkButton,
  Loading,
  ListEx,
  Icons,
  Logo,
  ShareLinkDialog
} from 'components';
import DeleteDialog from './DeleteDialog';
import Mark from './Mark';
import Wrapper from '../styled';

/* eslint-disable react/prop-types */
class JobList extends React.Component {
  state = {
    sharingJob: null,
    deletingJob: null
  };

  componentWillMount() {
    const { workplace, selectBusinessAction, history } = this.props;
    if (workplace) {
      selectBusinessAction(workplace.business);
    } else {
      history.replace('/recruiter/jobs/business');
    }
  }

  selectJob = id => {
    this.props.history.push(`/recruiter/jobs/job/view/${id}`);
  };

  editJob = (id, event) => {
    event.stopPropagation();
    this.props.history.push(`/recruiter/jobs/job/edit/${id}`);
  };

  showDeleteDialog(deletingJob, event) {
    event && event.stopPropagation();
    this.setState({ deletingJob });
  }

  showLinkDialog(sharingJob, event) {
    event && event.stopPropagation();
    this.setState({ sharingJob });
  }

  showApps = (id, event) => {
    event.stopPropagation();
    this.props.history.push(`/recruiter/applications/apps/${id}`);
  };

  showCons = (id, event) => {
    event.stopPropagation();
    this.props.history.push(`/recruiter/applications/conns/${id}`);
  };

  renderJob = job => {
    const { id, status, title, sector, loading, newApps, conApps } = job;
    const logo = helper.getJobLogo(job);
    const sectorName = helper.getNameByID(DATA.sectors, sector);
    const closed = status === DATA.JOB.CLOSED ? 'disabled' : '';

    return (
      <List.Item
        key={id}
        actions={[
          <Tooltip placement="bottom" title="Share Job">
            <span onClick={e => this.showLinkDialog(job, e)}>
              <Icons.ShareAlt />
            </span>
          </Tooltip>,
          <Tooltip placement="bottom" title="Edit">
            <span onClick={e => this.editJob(id, e)}>
              <Icons.Pen />
            </span>
          </Tooltip>,
          <Tooltip placement="bottom" title="Remove">
            <span onClick={e => this.showDeleteDialog(job, e)}>
              <Icons.TrashAlt />
            </span>
          </Tooltip>
        ]}
        onClick={() => this.selectJob(id)}
        className={`${loading ? 'loading' : ''} ${closed}`}
      >
        <List.Item.Meta
          avatar={<Logo src={logo} size="80px" padding="10px" />}
          title={title}
          description={sectorName}
        />

        {!closed && (
          <span style={{ width: '140px' }}>
            {!!conApps && (
              <div>
                <LinkButton style={{ color: colors.green }} onClick={e => this.showCons(id, e)}>
                  {`${conApps} connection${conApps !== 1 ? 's' : ''}`}
                </LinkButton>
              </div>
            )}
            {!!newApps && (
              <div>
                <LinkButton style={{ color: colors.yellow }} onClick={e => this.showApps(id, e)}>
                  {`${newApps} new application${newApps !== 1 ? 's' : ''}`}
                </LinkButton>
              </div>
            )}
          </span>
        )}

        {closed && <Mark>Inactive</Mark>}
        {loading && <Loading className="mask" />}
      </List.Item>
    );
  };

  renderEmpty = () => (
    <AlertMsg>
      <span>
        {DATA.tutorial === 4
          ? `Okay, last step, now create your first job`
          : `This workplace doesn't seem to have any jobs yet!`}
      </span>
      <Link to={`/recruiter/jobs/job/add/${this.props.workplace.id}`}>Create job</Link>
    </AlertMsg>
  );

  render() {
    const { workplace, jobs } = this.props;

    if (!workplace) return null;

    const { sharingJob, deletingJob } = this.state;

    return (
      <Wrapper className="container">
        <Helmet title="My Jobs" />

        <PageHeader>
          <h2>My Jobs</h2>
        </PageHeader>

        <PageSubHeader>
          <Breadcrumb>
            <Breadcrumb.Item>
              <Link to="/recruiter/jobs/business">Businesses</Link>
            </Breadcrumb.Item>

            <Breadcrumb.Item>
              <Link to={`/recruiter/jobs/workplace/${workplace.business}`}>Workplaces</Link>
            </Breadcrumb.Item>

            <Breadcrumb.Item>Jobs</Breadcrumb.Item>
          </Breadcrumb>

          <Link to={`/recruiter/jobs/job/add/${workplace.id}`}>Add new job</Link>
        </PageSubHeader>

        <div className="content">
          <ListEx data={jobs} renderItem={this.renderJob} emptyRender={this.renderEmpty} />
        </div>

        <ShareLinkDialog
          url={`${window.location.origin}/jobseeker/jobs/${(sharingJob || {}).id}`}
          visible={!!sharingJob}
          onCancel={() => this.showLinkDialog()}
        />

        <DeleteDialog job={deletingJob} visible={!!deletingJob} onCancel={() => this.showDeleteDialog()} />
      </Wrapper>
    );
  }
}

export default connect(
  (state, { match }) => {
    let workplaceId = helper.str2int(match.params.workplaceId);
    const workplace = helper.getItemById(state.workplaces.workplaces, workplaceId);
    workplaceId = (workplace || {}).id;

    const applications = getApplicationsSelector(state);
    const jobs = getJobsSelector(state)
      .filter(({ location }) => location === workplaceId)
      .map(job => {
        let newApps = 0;
        let conApps = 0;
        applications.forEach(app => {
          if (app.job === job.id) {
            if (app.status === DATA.APP.CREATED) newApps++;
            else if (app.status === DATA.APP.ESTABLISHED) conApps++;
          }
        });
        return { ...job, newApps, conApps };
      });

    return {
      workplace,
      jobs
    };
  },
  {
    selectBusinessAction
  }
)(JobList);
