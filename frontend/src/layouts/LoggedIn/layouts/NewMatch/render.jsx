import React from 'react';
import glamorous from 'glamorous';
import SearchInput from 'components/SearchInput';

const NewMatchRender = ({
  chosenOpponent,
  searchResult,
  handleSearch,
  handleResultClick
}) => {
  if (chosenOpponent) {
    return (
      <div>
        <h3>Game against</h3>
        <h1>{chosenOpponent.text}</h1>
        <button>Start game</button>
      </div>
    );
  }

  return (
    <div>
      <h1>Choose an opponent</h1>
      <SearchInput
        searchResult={searchResult}
        onChange={handleSearch}
        onResultClick={handleResultClick}
      />
    </div>
  );
};

export default NewMatchRender;
