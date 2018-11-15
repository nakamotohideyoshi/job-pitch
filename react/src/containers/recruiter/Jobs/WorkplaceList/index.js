import React from 'react';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { Breadcrumb, List, Modal, Tooltip } from 'antd';

import DATA from 'utils/data';
import * as helper from 'utils/helper';
import colors from 'utils/colors';
import { getWorkplacesSelector, getApplicationsSelector } from 'redux/selectors';
import { selectBusinessAction } from 'redux/businesses';
import { removeWorkplaceAction } from 'redux/workplaces';
import { PageHeader, PageSubHeader, AlertMsg, Loading, ListEx, Icons, Logo } from 'components';
import Wrapper from '../styled';

const { confirm } = Modal;

/* eslint-disable react/prop-types */
class WorkplaceList extends React.Component {
  componentDidMount() {
    const { business, selectBusinessAction, history } = this.props;
    if (business) {
      selectBusinessAction(business.id);
    } else {
      history.replace('/recruiter/jobs/business');
    }
  }

  selectWorkplace = id => {
    this.props.history.push(`/recruiter/jobs/job/${id}`);
  };

  editWorkplace = (id, event) => {
    event && event.stopPropagation();
    this.props.history.push(`/recruiter/jobs/workplace/edit/${id}`);
  };

  removeWorkplace = ({ id, name, jobs }, event) => {
    event && event.stopPropagation();

    const jCount = jobs.length;
    confirm({
      title: jCount
        ? `Deleting this workplace will also delete ${jCount} job${jCount !== 1 ? 's' : ''}.`
        : `Are you sure you want to delete ${name}`,
      content: jCount ? 'If you want to hide the jobs instead you can deactive them.' : null,
      okText: `Remove`,
      okType: 'danger',
      cancelText: 'Cancel',
      maskClosable: true,
      onOk: () => {
        this.props.removeWorkplaceAction({
          id,
          successMsg: 'The workplace is removed',
          failMsg: 'There was an error removing the workplace'
        });
      }
    });
  };

  renderWorkplace = workplace => {
    const { id, name, jobs, active_job_count, newApps, loading } = workplace;
    const logo = helper.getWorkplaceLogo(workplace);
    const strJobs = `Includes ${jobs.length} job${jobs.length !== 1 ? 's' : ''}`;
    const strInactiveJobs = `${jobs.length - active_job_count} inactive`;
    const strNewApps = `${newApps} new application${newApps !== 1 ? 's' : ''}`;

    const actions = this.props.business.restricted
      ? []
      : [
          <Tooltip placement="bottom" title="Edit">
            <span onClick={e => this.editWorkplace(id, e)}>
              <Icons.Pen />
            </span>
          </Tooltip>,
          <Tooltip placement="bottom" title="Remove">
            <span onClick={e => this.removeWorkplace(workplace, e)}>
              <Icons.TrashAlt />
            </span>
          </Tooltip>
        ];

    return (
      <List.Item
        key={id}
        actions={actions}
        onClick={() => this.selectWorkplace(id)}
        className={loading ? 'loading' : ''}
      >
        <List.Item.Meta avatar={<Logo src={logo} size="80px" padding="10px" />} title={name} />

        <span style={{ width: '160px' }}>
          <div>
            {strJobs} ({strInactiveJobs})
          </div>
          {!!newApps && <div style={{ color: colors.yellow }}>{strNewApps}</div>}
        </span>

        {loading && <Loading className="mask" />}
      </List.Item>
    );
  };

  renderEmpty = () => (
    <AlertMsg>
      <span>
        {DATA.tutorial === 3
          ? `Great, you've created your business!
             Now let's create your work place`
          : `This business doesn't seem to have a workplace for your staff`}
      </span>
      <Link to={`/recruiter/jobs/workplace/add/${this.props.business.id}`}>Create workplace</Link>
    </AlertMsg>
  );

  render() {
    const { business, workplaces } = this.props;

    if (!business) return null;

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

          {!business.restricted && <Link to={`/recruiter/jobs/workplace/add/${business.id}`}>Add new workplace</Link>}
        </PageSubHeader>

        <div className="content">
          <ListEx data={workplaces} renderItem={this.renderWorkplace} emptyRender={this.renderEmpty} />
        </div>
      </Wrapper>
    );
  }
}

export default connect(
  (state, { match }) => {
    let businessId = helper.str2int(match.params.businessId);
    const business = helper.getItemById(state.businesses.businesses, businessId);
    businessId = (business || {}).id;

    const applications = getApplicationsSelector(state);
    const workplaces = getWorkplacesSelector(state)
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
    removeWorkplaceAction,
    selectBusinessAction
  }
)(WorkplaceList);
