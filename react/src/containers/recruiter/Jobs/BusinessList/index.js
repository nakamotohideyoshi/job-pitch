import React from 'react';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import { Breadcrumb, List, Modal, Tooltip } from 'antd';

import { removeBusiness } from 'redux/recruiter/businesses';
import { getApplications } from 'redux/applications';
import DATA from 'utils/data';
import * as helper from 'utils/helper';

import { PageHeader, PageSubHeader, AlertMsg, LinkButton, Loading, ListEx, Icons, Intro, Logo } from 'components';
import imgLogo from 'assets/logo1.png';
import imgIntro1 from 'assets/intro1.png';
import imgIntro2 from 'assets/intro2.png';
import imgIntro3 from 'assets/intro3.png';
import Wrapper from '../styled';
import * as _ from 'lodash';

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
    dontShowIntro: false,
    countList: null
  };

  componentDidMount() {
    this.props.getApplications();
    // console.log(this.props.applications);
    // let countList = {};
    // _.forEach(this.props.businesses, business => {
    //   let newApplications = _.filter(DATA.applications, application => {
    //     return application.job_data.location_data.business === business.id && application.status === 1;
    //   });
    //   countList[business.id] = newApplications.length;
    // });
    this.setState({
      dontShowIntro: DATA[`dontShowIntro_${DATA.email}`]
      // countList: countList
    });
  }

  componentWillReceiveProps(nextProps) {
    let countList = {};
    _.forEach(this.props.businesses, business => {
      let newApplications = _.filter(nextProps.applications, application => {
        return application.job_data.location_data.business === business.id && application.status === 1;
      });
      countList[business.id] = newApplications.length;
    });
    this.setState({
      countList: countList
    });
  }

  selectBusiness = ({ id }) => {
    this.props.history.push(`/recruiter/jobs/workplace/${id}`);
  };

  addBusiness = () => {
    const tutorial = helper.loadData('tutorial');
    if (tutorial === 1) {
      helper.saveData('tutorial', 2);
    }

    const { user, businesses, history } = this.props;
    if (user.can_create_businesses || businesses.length === 0) {
      history.push('/recruiter/jobs/business/add');
    } else {
      confirm({
        content: (
          <span>
            Got more that one business?
            <br />
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

  editBusiness = ({ id }, event) => {
    event && event.stopPropagation();
    this.props.history.push(`/recruiter/jobs/business/edit/${id}`);
  };

  closeIntro = () => {
    DATA[`dontShowIntro_${DATA.email}`] = true;
    this.setState({ dontShowIntro: true });
  };

  removeBusiness = ({ id, name, locations }, event) => {
    event && event.stopPropagation();

    const count = locations.length;
    let content;
    if (count === 0) {
      content = `Are you sure you want to delete ${name}`;
    } else {
      const s = count !== 1 ? 's' : '';
      content = `Deleting this business will also delete ${count} workplace${s} and all their jobs.
                If you want to hide the jobs instead you can deactive them.`;
    }

    confirm({
      content,
      okText: `Remove`,
      okType: 'danger',
      cancelText: 'Cancel',
      maskClosable: true,
      onOk: () => {
        this.props.removeBusiness({
          id,
          successMsg: {
            message: `Business(${name}) is removed.`
          },
          failMsg: {
            message: `Removing business(${name}) is failed.`
          }
        });
      }
    });
  };

  renderBusiness = business => {
    const { id, name, tokens, locations, loading } = business;
    const logo = helper.getBusinessLogo(business);
    const strTokens = `${tokens} credit${tokens !== 1 ? 's' : ''}`;
    const count = locations.length;
    const strWorkplaces = `Includes ${count} workplace${count !== 1 ? 's' : ''}`;
    if (this.state.countList !== null) {
      var newApplicationsCount = this.state.countList[business.id];
      var strNewApplications = `${newApplicationsCount} new application${newApplicationsCount !== 1 ? 's' : ''}`;
    }

    return (
      <List.Item
        key={id}
        actions={[
          <Tooltip placement="bottom" title="Edit">
            <span onClick={e => this.editBusiness(business, e)}>
              <Icons.Pen />
            </span>
          </Tooltip>,
          <Tooltip placement="bottom" title="Remove">
            <span onClick={e => this.removeBusiness(business, e)}>
              <Icons.TrashAlt />
            </span>
          </Tooltip>
        ]}
        onClick={() => this.selectBusiness(business)}
        className={loading ? 'loading' : ''}
      >
        <List.Item.Meta avatar={<Logo src={logo} size="80px" />} title={name} />
        <span style={{ width: '80px' }}>{strTokens}</span>
        <span style={{ width: '140px' }}>
          <div>{strWorkplaces}</div>
          {!!newApplicationsCount && <div style={{ color: '#ff9300' }}>{strNewApplications}</div>}
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
        <a onClick={this.addBusiness}>{tutorial === 1 ? 'Get started!' : 'Create business'}</a>
      </AlertMsg>
    );
  };

  render() {
    const { businesses, applications } = this.props;
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
          <LinkButton onClick={this.addBusiness}>Add new business</LinkButton>
        </PageSubHeader>

        <div className="content">
          {applications === null ? (
            <Loading className="mask" size="large" />
          ) : (
            <ListEx
              data={this.props.businesses}
              loadingSize="large"
              pagination={{ pageSize: 10 }}
              renderItem={this.renderBusiness}
              emptyRender={this.renderEmpty}
            />
          )}
        </div>

        {businesses.length === 0 && !dontShowIntro && <Intro data={INTRO_DATA} onClose={this.closeIntro} />}
      </Wrapper>
    );
  }
}

export default connect(
  state => {
    const businesses = state.rc_businesses.businesses.slice(0);
    const { applications } = state.applications;
    return {
      user: state.auth.user,
      businesses,
      applications
    };
  },
  {
    removeBusiness,
    getApplications
  }
)(BusinessList);
