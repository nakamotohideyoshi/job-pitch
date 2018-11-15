import React from 'react';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { List, Tooltip, Modal } from 'antd';

import * as helper from 'utils/helper';
import { getHrJobsSelector, getHrEmployeesSelector } from 'redux/selectors';
import { getJobsAction } from 'redux/hr/jobs';
import { getEmployeesAction, removeEmployeeAction } from 'redux/hr/employees';
import { PageHeader, ListEx, Loading, Icons, AlertMsg, Logo } from 'components';
import Wrapper from './styled';

const { confirm } = Modal;

/* eslint-disable react/prop-types */
class EmployeeList extends React.Component {
  componentDidMount() {
    if (!this.props.jobs) {
      this.props.getJobsAction();
    }
    if (!this.props.employees) {
      this.props.getEmployeesAction();
    }
  }

  onEdit = id => {
    this.props.history.push(`/hr/employees/${id}`);
  };

  onRemove = (employee, event) => {
    event && event.stopPropagation();

    const name = helper.getFullName(employee);

    confirm({
      title: `Are you sure you want to delete ${name}?`,
      okText: `Remove`,
      okType: 'danger',
      cancelText: 'Cancel',
      maskClosable: true,
      onOk: () => {
        this.props.removeEmployeeAction({
          id: employee.id,
          successMsg: `${name} is removed`,
          failMsg: `There was an error removing ${name}`
        });
      }
    });
  };

  renderEmployee = employee => {
    const { id, job_data, loading } = employee;
    const avatar = helper.getAvatar(employee);
    const name = helper.getFullName(employee);

    return (
      <List.Item
        key={id}
        actions={[
          <Tooltip placement="bottom" title="Remove">
            <span onClick={e => this.onRemove(employee, e)}>
              <Icons.Times />
            </span>
          </Tooltip>
        ]}
        onClick={() => this.onEdit(id)}
        className={loading ? 'loading' : ''}
      >
        <List.Item.Meta
          avatar={<Logo src={avatar} size="80px" />}
          title={name}
          description={<div className="single-line">{job_data.title}</div>}
        />
        {loading && <Loading className="mask" />}
      </List.Item>
    );
  };

  renderEmpty = () => {
    return (
      <AlertMsg>
        <span>You have no employees.</span>
        <Link to="/hr/employees/add">Create employee</Link>
      </AlertMsg>
    );
  };

  render() {
    const { jobs, employees } = this.props;

    return (
      <Wrapper className="container">
        <Helmet title="Employees" />

        <PageHeader>
          <h2>Employees</h2>
          <Link to="/hr/employees/add">Add new employee</Link>
        </PageHeader>

        <div className="content">
          <ListEx data={jobs && employees} renderItem={this.renderEmployee} emptyRender={this.renderEmpty} />
        </div>
      </Wrapper>
    );
  }
}

export default connect(
  state => ({
    jobs: getHrJobsSelector(state),
    employees: getHrEmployeesSelector(state)
  }),
  {
    getJobsAction,
    getEmployeesAction,
    removeEmployeeAction
  }
)(EmployeeList);
