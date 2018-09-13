import React from 'react';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { Breadcrumb, List, Tooltip } from 'antd';

import { getApplications, getJobs, getWorkplaces } from 'redux/selectors';
import { selectBusiness } from 'redux/recruiter/businesses';
import DATA from 'utils/data';
import colors from 'utils/colors';
import * as helper from 'utils/helper';

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

class JobList extends React.Component {
  state = {
    selected1: null,
    selected2: null
  };

  componentWillMount() {
    const { workplace, selectBusiness, history } = this.props;
    if (!workplace) {
      history.replace('/recruiter/jobs/business');
      return;
    }
    selectBusiness(workplace.business);
  }

  onSelectJob = id => {
    this.props.history.push(`/recruiter/jobs/job/view/${id}`);
  };

  onAddJob = () => {
    helper.saveData('tutorial');
    this.props.history.push(`/recruiter/jobs/job/add/${this.props.workplace.id}`);
  };

  onEditJob = (id, event) => {
    event.stopPropagation();
    this.props.history.push(`/recruiter/jobs/job/edit/${id}`);
  };

  onShowApps = (id, event) => {
    event.stopPropagation();
    this.props.history.push(`/recruiter/applications/apps/${id}`);
  };

  onShowCons = (id, event) => {
    event.stopPropagation();
    this.props.history.push(`/recruiter/applications/conns/${id}`);
  };

  onLinkDialog(selected1, event) {
    event && event.stopPropagation();
    this.setState({ selected1 });
  }

  onDeleteDialog(selected2, event) {
    event && event.stopPropagation();
    this.setState({ selected2 });
  }

  renderJob = job => {
    const { id, status, title, loading, newApps, conApps } = job;
    const logo = helper.getJobLogo(job);
    const sector = helper.getNameByID('sectors', job.sector);
    const closed = status === DATA.JOB.CLOSED ? 'disabled' : '';
    return (
      <List.Item
        key={id}
        actions={[
          <Tooltip placement="bottom" title="Share Job">
            <span onClick={e => this.onLinkDialog(job, e)}>
              <Icons.ShareAlt />
            </span>
          </Tooltip>,
          <Tooltip placement="bottom" title="Edit">
            <span onClick={e => this.onEditJob(id, e)}>
              <Icons.Pen />
            </span>
          </Tooltip>,
          <Tooltip placement="bottom" title="Remove">
            <span onClick={e => this.onDeleteDialog(job, e)}>
              <Icons.TrashAlt />
            </span>
          </Tooltip>
        ]}
        onClick={() => this.onSelectJob(id)}
        className={`${loading ? 'loading' : ''} ${closed}`}
      >
        <List.Item.Meta avatar={<Logo src={logo} size="80px" padding="10px" />} title={title} description={sector} />

        {!closed && (
          <span style={{ width: '140px' }}>
            {!!conApps && (
              <div>
                <a style={{ color: colors.green }} onClick={e => this.onShowCons(id, e)}>
                  {`${conApps} connection${conApps !== 1 ? 's' : ''}`}
                </a>
              </div>
            )}
            {!!newApps && (
              <div>
                <a style={{ color: colors.yellow }} onClick={e => this.onShowApps(id, e)}>
                  {`${newApps} new application${newApps !== 1 ? 's' : ''}`}
                </a>
              </div>
            )}
          </span>
        )}

        {closed && <Mark>Inactive</Mark>}
        {loading && <Loading className="mask" size="small" />}
      </List.Item>
    );
  };

  renderEmpty = () => {
    const tutorial = helper.loadData('tutorial');
    return (
      <AlertMsg>
        <span>
          {tutorial === 3
            ? `Okay, last step, now create your first job`
            : `This workplace doesn't seem to have any jobs yet!`}
        </span>
        <a onClick={this.onAddJob}>Create job</a>
      </AlertMsg>
    );
  };

  render() {
    const { workplace, jobs } = this.props;
    const { selected1, selected2 } = this.state;

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
              {workplace && <Link to={`/recruiter/jobs/workplace/${workplace.business}`}>Workplaces</Link>}
            </Breadcrumb.Item>
            <Breadcrumb.Item>Jobs</Breadcrumb.Item>
          </Breadcrumb>
          <LinkButton onClick={this.onAddJob}>Add new job</LinkButton>
        </PageSubHeader>

        <div className="content">
          <ListEx
            data={jobs}
            loadingSize="large"
            pagination={{ pageSize: 10 }}
            renderItem={this.renderJob}
            emptyRender={this.renderEmpty}
          />
        </div>

        <ShareLinkDialog
          url={`${window.location.origin}/jobseeker/jobs/${(selected1 || {}).id}`}
          visible={selected1}
          onCancel={() => this.onLinkDialog()}
        />
        <DeleteDialog job={selected2} visible={selected2} onCancel={() => this.onDeleteDialog()} />
      </Wrapper>
    );
  }
}

export default connect(
  (state, { match }) => {
    let workplaceId = helper.str2int(match.params.workplaceId);
    const workplace = helper.getItemByID(getWorkplaces(state), workplaceId);
    workplaceId = (workplace || {}).id;

    const applications = getApplications(state);
    const jobs = getJobs(state)
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
    selectBusiness
  }
)(JobList);
