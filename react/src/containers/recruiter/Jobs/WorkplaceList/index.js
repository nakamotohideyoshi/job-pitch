import React from 'react';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { Breadcrumb, List, Modal, Tooltip } from 'antd';

import { getApplications, getWorkplaces, getBusinesses } from 'redux/selectors';
import { removeWorkplace } from 'redux/recruiter/workplaces';
import { selectBusiness } from 'redux/recruiter/businesses';
import DATA from 'utils/data';
import * as helper from 'utils/helper';

import { PageHeader, PageSubHeader, AlertMsg, LinkButton, Loading, ListEx, Icons, Logo } from 'components';
import Wrapper from '../styled';

const { confirm } = Modal;

class WorkplaceList extends React.Component {
  componentDidMount() {
    const { business, selectBusiness, history } = this.props;
    if (!business) {
      history.replace('/recruiter/jobs/business');
      return;
    }
    selectBusiness(business.id);
  }

  onSelectWorkplace = id => {
    this.props.history.push(`/recruiter/jobs/job/${id}`);
  };

  onAddWorkplace = () => {
    const tutorial = helper.loadData('tutorial');
    if (tutorial === 2) {
      helper.saveData('tutorial', 3);
    }

    this.props.history.push(`/recruiter/jobs/workplace/add/${this.props.business.id}`);
  };

  onEditWorkplace = (id, event) => {
    event && event.stopPropagation();
    this.props.history.push(`/recruiter/jobs/workplace/edit/${id}`);
  };

  onRemoveWorkplace = ({ id, name, jobs }, event) => {
    event && event.stopPropagation();

    const count = jobs.length;
    const content = count
      ? `Deleting this workplace will also delete ${count} job${count !== 1 ? 's' : ''}.
    If you want to hide the jobs instead you can deactive them.`
      : `Are you sure you want to delete ${name}`;

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
            message: 'The workplace is removed'
          },
          failMsg: {
            message: 'There was an error removing the workplace'
          }
        });
      }
    });
  };

  renderWorkplace = workplace => {
    const { id, name, jobs, active_job_count, newApps, loading } = workplace;
    const logo = helper.getWorkplaceLogo(workplace);
    const count = jobs.length;
    const strJobs = `Includes ${count} job${count !== 1 ? 's' : ''}`;
    const strInactiveJobs = `${count - active_job_count} inactive`;
    const strNewApps = `${newApps} new application${newApps !== 1 ? 's' : ''}`;

    return (
      <List.Item
        key={id}
        actions={[
          <Tooltip placement="bottom" title="Edit">
            <span onClick={e => this.onEditWorkplace(id, e)}>
              <Icons.Pen />
            </span>
          </Tooltip>,
          <Tooltip placement="bottom" title="Remove">
            <span onClick={e => this.onRemoveWorkplace(workplace, e)}>
              <Icons.TrashAlt />
            </span>
          </Tooltip>
        ]}
        onClick={() => this.onSelectWorkplace(id)}
        className={loading ? 'loading' : ''}
      >
        <List.Item.Meta avatar={<Logo src={logo} size="80px" padding="10px" />} title={name} />

        <span style={{ width: '160px' }}>
          <div>
            {strJobs} ({strInactiveJobs})
          </div>
          {!!newApps && <div style={{ color: '#ff9300' }}>{strNewApps}</div>}
        </span>

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
        <a onClick={this.onAddWorkplace}>Create workplace</a>
      </AlertMsg>
    );
  };

  render() {
    const { business } = this.props;

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

          {!business.restricted && <LinkButton onClick={this.onAddWorkplace}>Add new workplace</LinkButton>}
        </PageSubHeader>

        <div className="content">
          <ListEx
            data={this.props.workplaces}
            loadingSize="large"
            pagination={{ pageSize: 10 }}
            renderItem={this.renderWorkplace}
            emptyRender={this.renderEmpty}
          />
        </div>
      </Wrapper>
    );
  }
}

export default connect(
  (state, { match }) => {
    let businessId = helper.str2int(match.params.businessId);
    const business = helper.getItemByID(getBusinesses(state), businessId);
    businessId = (business || {}).id;

    const applications = getApplications(state);
    const workplaces = getWorkplaces(state)
      .filter(({ business }) => business === businessId)
      .map(workplace => {
        const newApps = applications.filter(
          ({ job_data, status }) => job_data.location === workplace.id && status === DATA.APP.CREATED
        ).length;
        return { ...workplace, newApps };
      });

    return {
      business,
      workplaces
    };
  },
  {
    removeWorkplace,
    selectBusiness
  }
)(WorkplaceList);
