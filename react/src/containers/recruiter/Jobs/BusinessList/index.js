import React from 'react';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import { Breadcrumb, List, Modal, Tooltip } from 'antd';

import { getApplications, getBusinesses } from 'redux/selectors';
import { removeBusiness } from 'redux/recruiter/businesses';
import DATA from 'utils/data';
import colors from 'utils/colors';
import * as helper from 'utils/helper';

import { PageHeader, PageSubHeader, AlertMsg, LinkButton, Loading, ListEx, Icons, Intro, Logo } from 'components';
import imgLogo from 'assets/logo1.png';
import imgIntro1 from 'assets/intro1.png';
import imgIntro2 from 'assets/intro2.png';
import imgIntro3 from 'assets/intro3.png';
import Wrapper from '../styled';

const { confirm } = Modal;

const INTRO_DATA = [
  {
    title: 'Welcome!',
    image: imgLogo,
    comment: `Faster Screening of Candidates, no more piles of CVs and remember adverts are always free.`
  },
  {
    title: 'Post your first job',
    image: imgIntro1,
    comment: `Get started by creating your workplaces and jobs.`
  },
  {
    title: 'Screen potential candidates',
    image: imgIntro2,
    comment: `Our simple candidate selection system lets you quickly find the right person!`
  },
  {
    title: 'Reusable ads',
    image: imgIntro3,
    comment: `Your job ads can be quickly reactivated to save effort next time.`
  }
];

class BusinessList extends React.Component {
  state = {
    dontShowIntro: false
  };

  componentDidMount() {
    this.setState({ dontShowIntro: DATA[`dontShowIntro_${DATA.email}`] });
  }

  onCloseIntro = () => {
    DATA[`dontShowIntro_${DATA.email}`] = true;
    this.setState({ dontShowIntro: true });
  };

  onSselectBusiness = id => {
    this.props.history.push(`/recruiter/jobs/workplace/${id}`);
  };

  onAddBusiness = () => {
    const tutorial = helper.loadData('tutorial');
    if (tutorial === 1) {
      helper.saveData('tutorial', 2);
    }

    const { can_create_businesses, businesses, history } = this.props;
    if (can_create_businesses || businesses.length === 0) {
      history.push('/recruiter/jobs/business/add');
    } else {
      confirm({
        title: 'Got more that one business?',
        content: (
          <span>
            Get in touch to talk about how we can help you.
            <br />
            Remember, you can always create additional workplaces under your existing business.
          </span>
        ),
        okText: `Contact Us`,
        cancelText: 'Cancel',
        maskClosable: true,
        onOk: () => {
          window.open('https://www.myjobpitch.com/contact/');
        }
      });
    }
  };

  onEditBusiness = (id, event) => {
    event && event.stopPropagation();
    this.props.history.push(`/recruiter/jobs/business/edit/${id}`);
  };

  onRemoveBusiness = ({ id, name, locations }, event) => {
    event && event.stopPropagation();

    const count = locations.length;
    confirm({
      title: count
        ? `Deleting this business will also delete ${count} workplace${count !== 1 ? 's' : ''} and all their jobs.`
        : `Are you sure you want to delete ${name}`,
      content: count ? `If you want to hide the jobs instead you can deactive them.` : null,
      okText: `Remove`,
      okType: 'danger',
      cancelText: 'Cancel',
      maskClosable: true,
      onOk: () => {
        this.props.removeBusiness({
          id,
          successMsg: {
            message: 'The business is removed'
          },
          failMsg: {
            message: 'There was an error removing the business'
          }
        });
      }
    });
  };

  renderBusiness = business => {
    const { id, name, tokens, locations, restricted, newApps, loading } = business;
    const logo = helper.getBusinessLogo(business);
    const strTokens = `${tokens} credit${tokens !== 1 ? 's' : ''}`;
    const count = locations.length;
    const strWorkplaces = `Includes ${count} workplace${count !== 1 ? 's' : ''}`;
    const strNewApps = `${newApps} new application${newApps !== 1 ? 's' : ''}`;

    const actions = [];
    if (!restricted) {
      actions.push(
        <Tooltip placement="bottom" title="Edit">
          <span onClick={e => this.onEditBusiness(id, e)}>
            <Icons.Pen />
          </span>
        </Tooltip>
      );
    }
    if (this.props.businesses.length > 1) {
      actions.push(
        <Tooltip placement="bottom" title="Remove">
          <span onClick={e => this.onRemoveBusiness(business, e)}>
            <Icons.TrashAlt />
          </span>
        </Tooltip>
      );
    }

    return (
      <List.Item
        key={id}
        actions={actions}
        onClick={() => this.onSselectBusiness(id)}
        className={loading ? 'loading' : ''}
      >
        <List.Item.Meta avatar={<Logo src={logo} size="80px" padding="10px" />} title={name} />

        <span style={{ width: '80px' }}>{strTokens}</span>
        <span style={{ width: '140px' }}>
          <div>{strWorkplaces}</div>
          {!!newApps && <div style={{ color: colors.yellow }}>{strNewApps}</div>}
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
          {tutorial === 1
            ? `Hi, Welcome to My Job Pitch
               Let's start by easily adding your business!`
            : `You have not added any businesses yet.`}
        </span>
        <a onClick={this.onAddBusiness}>{tutorial === 1 ? 'Get started!' : 'Create business'}</a>
      </AlertMsg>
    );
  };

  render() {
    const { businesses } = this.props;
    const { dontShowIntro } = this.state;

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
          <LinkButton onClick={this.onAddBusiness}>Add new business</LinkButton>
        </PageSubHeader>

        <div className="content">
          <ListEx
            data={this.props.businesses}
            loadingSize="large"
            pagination={{ pageSize: 10 }}
            renderItem={this.renderBusiness}
            emptyRender={this.renderEmpty}
          />
        </div>

        {businesses.length === 0 && !dontShowIntro && <Intro data={INTRO_DATA} onClose={this.onCloseIntro} />}
      </Wrapper>
    );
  }
}

export default connect(
  state => {
    const applications = getApplications(state);
    const businesses = getBusinesses(state).map(business => {
      const newApps = applications.filter(
        ({ job_data, status }) => job_data.location_data.business === business.id && status === DATA.APP.CREATED
      ).length;
      return { ...business, newApps };
    });

    return {
      can_create_businesses: state.auth.user.can_create_businesses,
      businesses
    };
  },
  {
    removeBusiness
  }
)(BusinessList);
