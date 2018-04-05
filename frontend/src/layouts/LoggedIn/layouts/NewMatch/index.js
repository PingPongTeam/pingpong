import { Component } from 'react';
import Render from './render';
import { user } from 'services/api/user';

class NewMatchContainer extends Component {
  constructor(props) {
    super(props);
    this.handleSearch = this.handleSearch.bind(this);
    this.handleResultClick = this.handleResultClick.bind(this);
    this.handleStartMatch = this.handleStartMatch.bind(this);
    this.state = {
      chosenOpponent: null,
      searchResult: null,
      serverSearchResult: null
    };
  }

  async handleSearch(searchString) {
    console.log('currect search state:', this.state.searchResult);
    console.log('SEARCHING FOR:', searchString);
    if (searchString < 1) {
      this.setState(() => ({ searchResult: null }));
    }
    if (this.state.searchResult && searchString.length > 1) {
      const newReslut = this.state.serverSearchResult.filter(result => {
        return (
          result.email.toLowerCase().includes(searchString.toLowerCase()) ||
          result.alias.toLowerCase().includes(searchString.toLowerCase())
        );
      });
      console.log('filtered search result:', newReslut);
      this.setState(() => ({ searchResult: newReslut }));
      return;
    }
    if (searchString.length > 1 && !this.state.searchResult) {
      try {
        const serverResult = await user.search({
          searchTerm: searchString.toLowerCase()
        });
        console.log('GOT REAL RESPONSE', serverResult);
        this.setState(() => ({
          searchResult: serverResult,
          serverSearchResult: serverResult
        }));
      } catch (e) {
        console.log('EEEROROROOR', e);
      }
    }
  }

  handleStartMatch() {
    console.log('start match with', this.state.chosenOpponent);
    this.props.history.push({
      pathname: '/match/ongoing',
      state: { opponent: this.state.chosenOpponent }
    });
  }

  handleResultClick(result) {
    this.setState(() => ({ chosenOpponent: result }));
    console.log('CLICKED RESULT:', result);
  }

  render() {
    const { chosenOpponent, searchResult } = this.state;
    return Render({
      chosenOpponent,
      searchResult,
      handleSearch: this.handleSearch,
      handleResultClick: this.handleResultClick,
      handleStartMatch: this.handleStartMatch
    });
  }
}

export default NewMatchContainer;
