import { Component } from 'react';
import Render from './render';

class NewMatchContainer extends Component {
  constructor(props) {
    super(props);
    this.handleSearch = this.handleSearch.bind(this);
    this.handleResultClick = this.handleResultClick.bind(this);
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
        return result.text.toLowerCase().includes(searchString.toLowerCase());
      });
      this.setState(() => ({ searchResult: newReslut }));
      return;
    }
    if (searchString.length > 1 && !this.state.searchResult) {
      // try {
      //   const serverResult = await user.search({seachTerm: searchString});
      //   this.setState(() => ({
      //     searchResult: serverResult,
      //     serverSearchResult: serverResult
      //   }));
      // } catch (e) {
      //   user.logout();
      // }
      console.log('GOT RESPONSE');
      const serverResult = [
        {
          text: 'OlleSandbög',
          id: 1
        },
        {
          text: 'OlleOllon',
          id: 2
        },
        {
          text: 'OllonFärs',
          id: 3
        }
      ];
      this.setState(() => ({
        searchResult: serverResult,
        serverSearchResult: serverResult
      }));
    }
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
      handleResultClick: this.handleResultClick
    });
  }
}

export default NewMatchContainer;
