/**
 *  Point of contact for component modules
 *
 *  ie: import CounterButton, InfoBar from 'components';
 *
 */

import Provider from './Provider/Provider';

import MainLayout from './layout/MainLayout/MainLayout';
import Header from './layout/Header/Header';
import Footer from './layout/Footer/Footer';

import FormComponent from './FormComponent/FormComponent';

import Loading from './Loading/Loading';
import HelpIcon from './HelpIcon/HelpIcon';
import CheckBox from './CheckBox/CheckBox';
import SearchBar from './SearchBar/SearchBar';
import ItemList from './ItemList/ItemList';
import Map from './Map/Map';

import JobDetail from './JobDetail/JobDetail';
import JobSeekerDetail from './JobSeekerDetail/JobSeekerDetail';

export {
  Provider,
  MainLayout, Header, Footer,
  FormComponent,
  Loading, HelpIcon, CheckBox, SearchBar, ItemList, Map,
  JobDetail, JobSeekerDetail
};
