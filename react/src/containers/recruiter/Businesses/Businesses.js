import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Helmet from 'react-helmet';
import Button from 'react-bootstrap/lib/Button';
import BusinessList from 'components/BusinessList/BusinessList';
import WorkPlaceList from 'components/WorkPlaceList/WorkPlaceList';
import JobList from 'components/JobList/JobList';
import { JobItem } from 'components';
import * as utils from 'helpers/utils';
import styles from './Businesses.scss';

@connect(
  (state) => ({
    businesses: state.jobmanager.businesses,
  }),
  { }
)
export default class Businesses extends Component {
  static propTypes = {
    businesses: PropTypes.array.isRequired,
  }

  constructor(props) {
    super(props);
    this.state = {
      firstTime: localStorage.getItem('first-time')
    };
  }

  getStart = () => {
    localStorage.removeItem('first-time');
    this.setState({ firstTime: false });
  }

  renderBusiness = business => {
    const image = utils.getBusinessLogo(business, true);
    const count = business.locations.length;
    return (
      <JobItem
        key={business.id}
        image={image}
        name={business.name}
        comment={` Includes ${count} workplace${count !== 1 ? 's' : ''}`}
      />
    );
  };

  render() {
    return (
      <div>
        <Helmet title="My Workplace & Jobs" />
        <div className="pageHeader">
          <h1>My Workplace & Jobs</h1>
        </div>
        <div className="board">
          {
            this.state.firstTime ?
              <div className={styles.emptyContainer}>
                <div>
                  {`Hi, Welcome to My Job Pitch\n
                  Let's start by easily adding your business!`}
                </div>
                <Button
                  type="button"
                  bsStyle="success"
                  onClick={this.getStart}
                >Get started!</Button>
              </div> :
              <div>
                <BusinessList renderItem={this.renderBusiness} />
                <WorkPlaceList />
                <JobList />
              </div>
          }
        </div>
      </div>
    );
  }
}
