import React, { Fragment } from 'react';
import { withRouter } from 'react-router-dom';
import { List, Avatar } from 'antd';

import DATA from 'utils/data';
import * as helper from 'utils/helper';

import { AlertMsg, SearchBox, ListEx } from 'components';
import StyledSider from './styled';

class Sidebar extends React.PureComponent {
  state = {
    filterText: ''
  };

  setFilterText = filterText => this.setState({ filterText });

  selectApp = appId => {
    const { location, history } = this.props;
    const arr = location.pathname.split('/');
    arr[3] = appId;
    history.replace(arr.join('/'));
  };

  filterOption = ({ job_data }) => {
    const { filterText } = this.state;
    return (
      !filterText ||
      helper
        .getFullBWName(job_data)
        .toLowerCase()
        .indexOf(filterText.toLowerCase()) >= 0
    );
  };

  renderApp = ({ id, messages, status, job_data }) => {
    const name = job_data.title;
    const image = helper.getJobLogo(job_data);
    const subName = helper.getFullBWName(job_data);
    const lastMessage = messages.filter(({ created }) => created).pop();
    const date = new Date(lastMessage.created);
    const strDate = `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear() - 2000}`;
    const userRole = helper.getNameByID('roles', lastMessage.from_role);
    const comment = `${userRole === 'JOB_SEEKER' ? 'You: ' : ''}${lastMessage.content}`;
    const deleted = status === DATA.APP.DELETED ? 'deleted' : '';
    const selected = id === this.props.selectedId ? 'selected' : '';

    return (
      <List.Item key={id} className={`${deleted} ${selected}`} onClick={() => this.selectApp(id)}>
        <List.Item.Meta
          avatar={<Avatar src={image} size="large" />}
          title={
            <Fragment>
              <span className="title single-line">
                {name} ({subName})
              </span>
              <span className="date">{strDate}</span>
            </Fragment>
          }
          description={
            <Fragment>
              <div className="single-line">{comment}</div>
            </Fragment>
          }
        />
      </List.Item>
    );
  };

  render() {
    const { applications } = this.props;

    return (
      <StyledSider width={300}>
        <div className="filters">
          <SearchBox onChange={this.setFilterText} />
        </div>

        <div className="applications">
          <ListEx
            data={applications}
            pagination={{ simple: true, pageSize: 20 }}
            renderItem={this.renderApp}
            emptyRender={
              <AlertMsg>
                <span>You have no applications.</span>
              </AlertMsg>
            }
            filterOption={this.filterOption}
          />
        </div>
      </StyledSider>
    );
  }
}

export default withRouter(Sidebar);
