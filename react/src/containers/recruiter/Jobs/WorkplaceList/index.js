import React from 'react';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import Truncate from 'react-truncate';
import { Breadcrumb, List, Avatar, Modal, Tooltip } from 'antd';

import DATA from 'utils/data';

import { removeWorkplace } from 'redux/recruiter/workplaces';
import { getApplications } from 'redux/applications';
import * as helper from 'utils/helper';

import { PageHeader, PageSubHeader, AlertMsg, LinkButton, Loading, ListEx, Icons } from 'components';
import Wrapper from '../styled';
import * as _ from 'lodash';

const { confirm } = Modal;

class WorkplaceList extends React.Component {
  state = {
    countList: null
  };

  componentDidMount() {
    this.props.getApplications();
    const { business, history } = this.props;
    if (!business) {
      history.replace('/recruiter/jobs/business');
    }
    // let countList = {};
    // _.forEach(this.props.workplaces, workplace => {
    //   let newApplications = _.filter(applications, application => {
    //     return application.job_data.location === workplace.id && application.status === 1;
    //   });
    //   countList[workplace.id] = newApplications.length;
    // });
    // this.setState({
    //   countList: countList
    // });
  }

  componentWillReceiveProps(nextProps) {
    const { applications } = nextProps;
    let countList = {};
    _.forEach(this.props.workplaces, workplace => {
      let newApplications = _.filter(applications, application => {
        return application.job_data.location === workplace.id && application.status === 1;
      });
      countList[workplace.id] = newApplications.length;
    });
    this.setState({
      countList: countList
    });
  }

  selectWorkplace = ({ id }) => {
    this.props.history.push(`/recruiter/jobs/job/${id}`);
  };

  addWorkplace = () => {
    const tutorial = helper.loadData('tutorial');
    if (tutorial === 2) {
      helper.saveData('tutorial', 3);
    }

    const { business: { id }, history } = this.props;
    history.push(`/recruiter/jobs/workplace/add/${id}`);
  };

  editWorkplace = ({ id }, event) => {
    event && event.stopPropagation();
    this.props.history.push(`/recruiter/jobs/workplace/edit/${id}`);
  };

  removeWorkplace = ({ id, name, jobs }, event) => {
    event && event.stopPropagation();

    const count = jobs.length;
    let content;
    if (count === 0) {
      content = `Are you sure you want to delete ${name}`;
    } else {
      const s = count !== 1 ? 's' : '';
      content = `Deleting this workplace will also delete ${count} job${s}.
                 If you want to hide the jobs instead you can deactive them.`;
    }

    confirm({
      content,
      okText: `Remove`,
      okType: 'danger',
      cancelText: 'Cancel',
      maskClosable: true,
      onOk: () => {
        this.props.removeWorkplace({
          id,
          successMsg: {
            message: `Workplace(${name}) is removed.`
          },
          failMsg: {
            message: `Removing workplace(${name}) is failed.`
          }
        });
      }
    });
  };

  renderWorkplace = workplace => {
    const { id, name, description, jobs, active_job_count, loading } = workplace;
    const logo = helper.getWorkplaceLogo(workplace);
    const count = jobs.length;
    const strJobs = `Includes ${count} job${count !== 1 ? 's' : ''}`;
    const strInactiveJobs = `${count - active_job_count} inactive`;

    if (this.state.countList !== null) {
      var newApplicationsCount = this.state.countList[workplace.id];
      var strNewApplications = `${newApplicationsCount} new application${newApplicationsCount !== 1 ? 's' : ''}`;
    }

    return (
      <List.Item
        key={id}
        actions={[
          <Tooltip placement="bottom" title="Edit">
            <span onClick={e => this.editWorkplace(workplace, e)}>
              <Icons.Pen />
            </span>
          </Tooltip>,
          <Tooltip placement="bottom" title="Remove">
            <span onClick={e => this.removeWorkplace(workplace, e)}>
              <Icons.TrashAlt />
            </span>
          </Tooltip>
        ]}
        onClick={() => this.selectWorkplace(workplace)}
        className={loading ? 'loading' : ''}
      >
        <List.Item.Meta
          avatar={<Avatar src={logo} className="avatar-80" />}
          title={name}
          description={
            <Truncate lines={2} ellipsis={<span>...</span>}>
              {description}
            </Truncate>
          }
        />
        <div className="properties" style={{ display: 'flex', alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ width: '130px' }}>{strJobs}</span>
            {newApplicationsCount && newApplicationsCount > 0 ? (
              <span style={{ width: '130px', color: '#ff9300' }}>{strNewApplications}</span>
            ) : (
              ''
            )}
          </div>
          <span style={{ width: '120px' }}>{strInactiveJobs}</span>
        </div>
        {/* <div className="properties">
          <span style={{ width: '120px' }}>{strJobs}</span>
          <span>{strInactiveJobs}</span>
        </div> */}
        {loading && <Loading className="mask" size="small" />}
      </List.Item>
    );
  };

  renderEmpty = () => {
    const tutorial = helper.loadData('tutorial');
    return (
      <AlertMsg>
        <span>
          {tutorial === 2
            ? `Great, you've created your business!
               Now let's create your work place`
            : `This business doesn't seem to have a workplace for your staff`}
        </span>
        <a onClick={this.addWorkplace}>Create workplace</a>
      </AlertMsg>
    );
  };

  render() {
    const { applications } = this.props;
    return (
      <Wrapper className="container">
        <Helmet title="My Workplaces" />

        <PageHeader>
          <h2>My Workplaces</h2>
        </PageHeader>

        <PageSubHeader>
          <Breadcrumb>
            <Breadcrumb.Item>
              <Link to="/recruiter/jobs/business">Businesses</Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>Workplaces</Breadcrumb.Item>
          </Breadcrumb>
          <LinkButton onClick={this.addWorkplace}>Add new workplace</LinkButton>
        </PageSubHeader>

        <div className="content">
          {applications === null ? (
            <Loading className="mask" size="large" />
          ) : (
            <ListEx
              data={this.props.workplaces}
              loadingSize="large"
              pagination={{ pageSize: 10 }}
              renderItem={this.renderWorkplace}
              emptyRender={this.renderEmpty}
            />
          )}
        </div>
      </Wrapper>
    );
  }
}

export default connect(
  (state, { match }) => {
    const businessId = helper.str2int(match.params.businessId);
    const business = helper.getItemByID(state.rc_businesses.businesses, businessId);
    let { workplaces } = state.rc_workplaces;
    workplaces = workplaces.filter(item => item.business === businessId);
    const { applications } = state.applications;
    return {
      business,
      workplaces,
      applications
    };
  },
  {
    removeWorkplace,
    getApplications
  }
)(WorkplaceList);
