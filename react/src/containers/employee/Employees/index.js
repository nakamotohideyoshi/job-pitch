import React from 'react';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import { List, Drawer } from 'antd';

import * as helper from 'utils/helper';
import { getEmployeesSelector } from 'redux/selectors';
import { PageHeader, ListEx, Logo } from 'components';
import Details from './Details';
import Wrapper from './styled';

/* eslint-disable react/prop-types */
class EmployeeList extends React.Component {
  state = {
    selectedId: null
  };

  onSelect = selectedId => this.setState({ selectedId });

  renderEmployee = employee => {
    const { id, job } = employee;
    const avatar = helper.getAvatar(employee);
    const name = helper.getFullName(employee);

    return (
      <List.Item key={id} onClick={() => this.onSelect(id)}>
        <List.Item.Meta
          avatar={<Logo src={avatar} size="80px" />}
          title={name}
          description={<div className="single-line">{job.title}</div>}
        />
      </List.Item>
    );
  };

  render() {
    const { employees } = this.props;

    const selectedEmployee = employees && helper.getItemById(employees, this.state.selectedId);

    return (
      <Wrapper className="container">
        <Helmet title="Employees" />

        <PageHeader>
          <h2>Employees</h2>
        </PageHeader>

        <div className="content">
          <ListEx data={employees} renderItem={this.renderEmployee} filterOption={this.filterOption} />
        </div>

        <Drawer placement="right" onClose={() => this.onSelect()} visible={!!selectedEmployee}>
          {selectedEmployee && <Details employee={selectedEmployee} />}
        </Drawer>
      </Wrapper>
    );
  }
}

export default connect(state => ({
  employees: getEmployeesSelector(state)
}))(EmployeeList);
