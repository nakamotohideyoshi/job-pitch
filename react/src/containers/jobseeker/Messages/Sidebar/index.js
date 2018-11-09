import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { List, Badge } from 'antd';

import DATA from 'utils/data';
import * as helper from 'utils/helper';
import { AlertMsg, SearchBox, ListEx, Logo } from 'components';
import Wrapper from './styled';

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
        .getJobSubName(job_data)
        .toLowerCase()
        .indexOf(filterText.toLowerCase()) >= 0
    );
  };

  renderApp = ({ id, messages, status, job_data, newMsgs }) => {
    const name = job_data.title;
    const image = helper.getJobLogo(job_data);
    const subName = helper.getJobSubName(job_data);
    const lastMessage = messages.filter(({ created }) => created).pop();
    const date = new Date(lastMessage.created);
    const strDate = `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear() - 2000}`;
    const userRole = helper.getNameByID(DATA.roles, lastMessage.from_role);
    const comment = `${userRole === 'JOB_SEEKER' ? 'You: ' : ''}${lastMessage.content}`;
    const deleted = status === DATA.APP.DELETED ? 'deleted' : '';
    const selected = id === this.props.selectedId ? 'selected' : '';

    return (
      <List.Item key={id} className={`${deleted} ${selected}`} onClick={() => this.selectApp(id)}>
        <List.Item.Meta
          avatar={<Logo src={image} size="48px" padding="4px" />}
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
              <span className="single-line">{comment}</span>
              {!!newMsgs && <Badge count={newMsgs < 10 ? newMsgs : '9+'} />}
            </Fragment>
          }
        />
      </List.Item>
    );
  };

  render() {
    const { applications } = this.props;

    return (
      <Wrapper className="sidebar">
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
      </Wrapper>
    );
  }
}

Sidebar.propTypes = {
  applications: PropTypes.array,
  selectedId: PropTypes.number,
  location: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired
};

Sidebar.defaultProps = {
  applications: null,
  selectedId: null
};

export default withRouter(Sidebar);
