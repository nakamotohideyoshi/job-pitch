import React, { Fragment } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { Breadcrumb, List, Avatar, Modal } from 'antd';

import { getWorkplaces, removeWorkplace } from 'redux/recruiter/workplaces';
import * as helper from 'utils/helper';

import { PageSubHeader, AlertMsg, LinkButton, Loading, ListEx, Icons } from 'components';

const { confirm } = Modal;

class WorkplaceList extends React.Component {
  componentWillMount() {
    if (!this.props.workplaces) {
      this.props.getWorkplaces();
    }
  }

  selectWorkplace = ({ id }) => {
    this.props.history.push(`/recruiter/jobs/job/${id}`);
  };

  addWorkplace = () => {
    const tutorial = helper.loadData('tutorial');
    if (tutorial === 2) {
      helper.saveData('tutorial', 3);
    }

    this.props.history.push(`/recruiter/jobs/workplace/add/${this.props.businessId}`);
  };

  editWorkplace = ({ id }, event) => {
    event && event.stopPropagation();
    this.props.history.push(`/recruiter/jobs/workplace/edit/${id}`);
  };

  removeWorkplace = ({ id, name, jobs }, event) => {
    event && event.stopPropagation();

    const count = jobs.length;
    let message;
    if (count === 0) {
      message = `Are you sure you want to delete ${name}`;
    } else {
      const s = count !== 1 ? 's' : '';
      message = `Deleting this workplace will also delete ${count} job${s}.
                 If you want to hide the jobs instead you can deactive them.`;
    }

    confirm({
      content: message,
      okText: `Remove`,
      okType: 'danger',
      cancelText: 'Cancel',
      maskClosable: true,
      onOk: () => {
        this.props.removeWorkplace({
          id
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

    return (
      <List.Item
        key={id}
        actions={[
          <span onClick={e => this.editWorkplace(workplace, e)}>
            <Icons.Pen />
          </span>,
          <span onClick={e => this.removeWorkplace(workplace, e)}>
            <Icons.TrashAlt />
          </span>
        ]}
        onClick={() => this.selectWorkplace(workplace)}
        className={loading ? 'loading' : ''}
      >
        <List.Item.Meta
          avatar={<Avatar src={logo} className="avatar-80" />}
          title={`${name}`}
          description={
            <Fragment>
              <div className="properties">
                <span style={{ width: '120px' }}>{strJobs}</span>
                <span>{strInactiveJobs}</span>
              </div>
              <div>{description}</div>
            </Fragment>
          }
        />
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
    const { workplaces, error } = this.props;

    return (
      <Fragment>
        <PageSubHeader>
          <Breadcrumb>
            <Breadcrumb.Item>
              <Link to="/recruiter/jobs/business">Businesses</Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>Workplaces</Breadcrumb.Item>
          </Breadcrumb>
          <LinkButton onClick={this.addWorkplace}>Add Workplace</LinkButton>
        </PageSubHeader>

        <div className="content">
          <ListEx
            data={workplaces}
            error={error && 'Server Error!'}
            loadingSize="large"
            pagination={{ pageSize: 10 }}
            renderItem={this.renderWorkplace}
            emptyRender={this.renderEmpty}
          />
        </div>
      </Fragment>
    );
  }
}

export default connect(
  (state, props) => {
    const businessId = parseInt(props.match.params.businessId, 10);
    let { workplaces, error } = state.rc_workplaces;
    if (workplaces) {
      workplaces = workplaces.filter(({ business }) => business === businessId);
    }
    return {
      businessId,
      workplaces,
      error
    };
  },
  {
    getWorkplaces,
    removeWorkplace
  }
)(WorkplaceList);
