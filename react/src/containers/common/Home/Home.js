import React, { Component } from 'react';
import Helmet from 'react-helmet';
import { Link } from 'react-router';
import styles from './Home.scss';

const GooglePlayImgUrl = require('assets/googleplay-button.svg');
const iTunesImgUrl = require('assets/itunes-button.svg');
const SPLASH_IMAGES = [
  require('assets/splash1.jpg'),
  require('assets/splash2.jpg'),
  require('assets/splash3.jpg'),
  require('assets/splash4.jpg'),
  require('assets/splash5.jpg'),
];

export default class Home extends Component {

  constructor(props) {
    super(props);
    this.state = {
      currentIndex: 0,
    };
  }

  componentDidMount() {
    this.timer = setInterval(() => {
      this.setState({
        currentIndex: (this.state.currentIndex + 1) % SPLASH_IMAGES.length,
      });
    }, 15000);
  }

  componentWillUnmount() {
    clearInterval(this.timer);
  }

  render() {
    const currentIndex = this.state.currentIndex;
    return (
      <div>
        <Helmet title="Home" />
        {
          SPLASH_IMAGES.map((image, index) => (<div
            key={image}
            className={styles.splashImage}
            style={{
              backgroundImage: `url(${image})`,
              opacity: index === currentIndex ? 1 : 0,
            }}
          />))
        }

        <div className={styles.content}>
          <div className={styles.title}>
            Recruitment where first impression count
          </div>
          <div>
            <Link to="/register/recruiter" className={styles.register}>
              <span>{"I'm a"}</span><br />
              <span>Recruiter</span>
            </Link>
            <Link to="/register/jobseeker" className={styles.register}>
              <span>{"I'm a"}</span><br />
              <span>JobSeeker</span>
            </Link>
          </div>
          <Link href="" className={styles.appButton}>
            <img src={GooglePlayImgUrl} alt="" />
          </Link>
          <br />
          <Link href="" className={styles.appButton}>
            <img src={iTunesImgUrl} alt="" />
          </Link>
        </div>
      </div>
    );
  }
}
