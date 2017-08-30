/**
 *  Point of contact for component modules
 *
 *  ie: import CounterButton, InfoBar from 'components';
 *
 */

import Provider from './Provider/Provider';

/* layout */

import HomeLayout from './layout/HomeLayout/HomeLayout';
import MainLayout from './layout/MainLayout/MainLayout';

import Loading from './Loading/Loading';
import FormComponent from './FormComponent/FormComponent';
import Map from './Map/Map';
import DropBox from './DropBox/DropBox';
import JobSelect from './JobSelect/JobSelect';
import JobDetail from './JobDetail/JobDetail';
import JobSeekerDetail from './JobSeekerDetail/JobSeekerDetail';
import Message from './Message/Message';

import {
  JobItem
} from './Items/Items';

export {
  Provider,
  HomeLayout, MainLayout,
  Loading, FormComponent, Map, DropBox,
  JobItem,
  JobSelect,
  JobDetail,
  JobSeekerDetail,
  Message,
};
