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
import Pagination from './Pagination/Pagination';
import LogoImage from './LogoImage/LogoImage';
import Map from './Map/Map';

import JobDetail from './JobDetail/JobDetail';
import JobSeekerDetail from './JobSeekerDetail/JobSeekerDetail';

export {
  Provider,
  MainLayout, Header, Footer,
  FormComponent,
  LogoImage,
  Loading, HelpIcon, CheckBox, SearchBar, ItemList, Pagination, Map,
  JobDetail, JobSeekerDetail
};
