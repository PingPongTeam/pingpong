import { Component } from 'react';
import Render from './render';

class NewMatchContainer extends Component {
  constructor(props) {
    super(props);
    this.handleSearch = this.handleSearch.bind(this);
    this.handleResultClick = this.handleResultClick.bind(this);
    this.state = {
      chosenOpponent: null,
      searchResult: null
    };
  }

  handleSearch(searchString) {
    console.log('SEARCHING FOR:', searchString);
    if (searchString.length > 2) {
      console.log('GOT RESPONSE');
      this.setState(() => ({
        searchResult: [
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
        ]
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
