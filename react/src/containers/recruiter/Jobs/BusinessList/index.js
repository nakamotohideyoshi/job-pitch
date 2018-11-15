import React from 'react';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { Breadcrumb, List, Modal, Tooltip } from 'antd';

import DATA from 'utils/data';
import * as helper from 'utils/helper';
import colors from 'utils/colors';
import { getApplicationsSelector } from 'redux/selectors';
import { removeBusinessAction } from 'redux/businesses';
import { PageHeader, PageSubHeader, AlertMsg, Loading, ListEx, Icons, Intro, Logo } from 'components';
import Wrapper from '../styled';

const { confirm } = Modal;

/* eslint-disable react/prop-types */
class BusinessList extends React.Component {
  state = {
    visibleIntro: false
  };

  componentDidMount() {
    this.setState({ visibleIntro: !this.props.businesses.length && DATA.tutorial === 1 });
  }

  showIntro = () => {
    const INTRO_DATA = [
      {
        title: 'Welcome!',
        image: require('assets/intro0.png'),
        comment: `Faster Screening of Candidates, no more piles of CVs and remember adverts are always free.`
      },
      {
        title: 'Post your first job',
        image: require('assets/intro1.png'),
        comment: `Get started by creating your workplaces and jobs.`
      },
      {
        title: 'Screen potential candidates',
        image: require('assets/intro2.png'),
        comment: `Our simple candidate selection system lets you quickly find the right person!`
      },
      {
        title: 'Reusable ads',
        image: require('assets/intro3.png'),
        comment: `Your job ads can be quickly reactivated to save effort next time.`
      }
    ];
    return <Intro data={INTRO_DATA} onClose={this.closeIntro} />;
  };

  closeIntro = () => {
    DATA.tutorial = 2;
    this.setState({ visibleIntro: false });
  };

  selectBusiness = id => {
    this.props.history.push(`/recruiter/jobs/workplace/${id}`);
  };

  editBusiness = (id, event) => {
    event && event.stopPropagation();
    this.props.history.push(`/recruiter/jobs/business/edit/${id}`);
  };

  removeBusiness = ({ id, name, locations }, event) => {
    event && event.stopPropagation();

    const wCount = locations.length;
    confirm({
      title: wCount
        ? `Deleting this business will also delete ${wCount} workplace${wCount !== 1 ? 's' : ''} and all their jobs.`
        : `Are you sure you want to delete ${name}`,
      content: wCount ? `If you want to hide the jobs instead you can deactive them.` : null,
      okText: `Remove`,
      okType: 'danger',
      cancelText: 'Cancel',
      maskClosable: true,
      onOk: () => {
        this.props.removeBusinessAction({
          id,
          successMsg: 'The business is removed',
          failMsg: 'There was an error removing the business'
        });
      }
    });
  };

  renderBusiness = business => {
    const { id, name, tokens, locations, restricted, newApps, loading } = business;
    const logo = helper.getBusinessLogo(business);
    const strTokens = `${tokens} credit${tokens !== 1 ? 's' : ''}`;
    const strWorkplaces = `Includes ${locations.length} workplace${locations.length !== 1 ? 's' : ''}`;
    const strNewApps = `${newApps} new application${newApps !== 1 ? 's' : ''}`;

    const actions = [];
    if (!restricted) {
      actions.push(
        <Tooltip placement="bottom" title="Edit">
          <span onClick={e => this.editBusiness(id, e)}>
            <Icons.Pen />
          </span>
        </Tooltip>
      );

      if (this.props.businesses.length > 1) {
        actions.push(
          <Tooltip placement="bottom" title="Remove">
            <span onClick={e => this.removeBusiness(business, e)}>
              <Icons.TrashAlt />
            </span>
          </Tooltip>
        );
      }
    }

    return (
      <List.Item
        key={id}
        actions={actions}
        onClick={() => this.selectBusiness(id)}
        className={loading ? 'loading' : ''}
      >
        <List.Item.Meta avatar={<Logo src={logo} size="80px" padding="10px" />} title={name} />

        <span style={{ width: '80px' }}>{strTokens}</span>
        <span style={{ width: '140px' }}>
          <div>{strWorkplaces}</div>
          {!!newApps && <div style={{ color: colors.yellow }}>{strNewApps}</div>}
        </span>

        {loading && <Loading className="mask" />}
      </List.Item>
    );
  };

  renderEmpty = () => {
    const tutorial = DATA.tutorial;
    return (
      <AlertMsg>
        <span>
          {tutorial === 2
            ? `Hi, Welcome to My Job Pitch
               Let's start by easily adding your business!`
            : `You have not added any businesses yet.`}
        </span>
        <Link to="/recruiter/jobs/business/add">{tutorial === 2 ? 'Get started!' : 'Create business'}</Link>
      </AlertMsg>
    );
  };

  render() {
    const { canCreate, businesses } = this.props;

    return (
      <Wrapper className="container">
        <Helmet title="My Businesses" />

        <PageHeader>
          <h2>My Businesses</h2>
        </PageHeader>

        <PageSubHeader>
          <Breadcrumb>
            <Breadcrumb.Item>Businesses</Breadcrumb.Item>
          </Breadcrumb>

          {canCreate && <Link to="/recruiter/jobs/business/add">Add new business</Link>}
        </PageSubHeader>

        <div className="content">
          <ListEx data={businesses} renderItem={this.renderBusiness} emptyRender={this.renderEmpty} />

          {!canCreate && (
            <div className="alert-msg">
              <div>Got more that one business?</div>
              <a href="https://www.myjobpitch.com/contact/" target="_blank" rel="noopener noreferrer">
                Contact Us
              </a>
            </div>
          )}
        </div>

        {this.state.visibleIntro && this.showIntro()}
      </Wrapper>
    );
  }
}

export default connect(
  state => {
    const applications = getApplicationsSelector(state);
    const businesses = state.businesses.businesses.map(business => {
      const newApps = applications.filter(
        ({ job_data, status }) => job_data.location_data.business === business.id && status === DATA.APP.CREATED
      ).length;
      return { ...business, newApps };
    });

    return {
      canCreate: state.auth.user.can_create_businesses || !businesses.length,
      businesses
    };
  },
  {
    removeBusinessAction
  }
)(BusinessList);
