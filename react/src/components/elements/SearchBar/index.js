import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Input } from 'reactstrap';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import faSearch from '@fortawesome/fontawesome-free-solid/faSearch';

const Wrapper = styled.div`
  position: relative;

  input {
    padding-left: 30px;
  }

  svg,
  a {
    position: absolute;
    display: flex;
    align-items: center;
    top: 0;
  }

  svg {
    left: 10px;
    bottom: 0;
    font-size: 14px;
    color: #888;
  }

  a {
    right: 10px;
    bottom: 2px;
    font-size: 18px;
    color: #444 !important;
  }
`;

class SearchBox extends React.PureComponent {
  state = { filterText: '' };

  constructor(props) {
    super(props);
    this.state = {
      filterText: props.defaultVaule
    };
  }

  setFilterText = filterText => {
    this.setState({ filterText });
    this.props.onChange(filterText.trim());
  };

  render() {
    const { filterText } = this.state;

    return (
      <Wrapper className="search-bar">
        <Input
          bsSize={this.props.size}
          placeholder={this.props.placeholder}
          value={filterText}
          onChange={e => this.setFilterText(e.target.value)}
        />
        <FontAwesomeIcon icon={faSearch} />
        {filterText && <a onClick={() => this.setFilterText('')}>×</a>}
      </Wrapper>
    );
  }
}

SearchBox.propTypes = {
  defaultVaule: PropTypes.string,
  placeholder: PropTypes.string,
  size: PropTypes.string,
  onChange: PropTypes.func
};

SearchBox.defaultProps = {
  defaultVaule: '',
  placeholder: 'Search',
  onChange: () => {}
};

export default SearchBox;
