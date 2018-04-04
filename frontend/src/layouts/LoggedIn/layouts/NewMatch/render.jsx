import React from 'react';
import { Link } from 'react-router-dom';
import glamorous from 'glamorous';
import globalStyles from 'globalStyles';
import SearchInput from 'components/SearchInput';
import Button from 'components/Button';
import SecondaryButton from 'components/SecondaryButton';

const Wrapper = glamorous.div({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  maxWidth: '100%'
});
const OpponentName = glamorous.div({
  fontSize: '15vw',
  overflow: 'hidden',
  maxWidth: '100vw',
  textOverflow: 'ellipsis',
  padding: '0 5vw',
  whiteSpace: 'nowrap'
});
const TinyText = glamorous.div({
  marginTop: '10vh',
  fontSize: '16px',
  fontStyle: 'italic',
  textTransform: 'uppercase'
});
const BottomControlWrapper = glamorous.div({
  display: 'flex',
  flexDirection: 'column',
  position: 'fixed',
  bottom: 0,
  width: '100%'
});

const NewMatchRender = ({
  chosenOpponent,
  searchResult,
  handleSearch,
  handleResultClick,
  handleStartMatch
}) => {
  if (chosenOpponent) {
    return (
      <Wrapper>
        <h1>Game against</h1>
        <OpponentName>{chosenOpponent.alias}</OpponentName>
        <TinyText>CURRENT TOTAL MATCH STATS</TinyText>
        <BottomControlWrapper>
          <Button onClick={handleStartMatch}>Start game</Button>
          <Link to="/">
            <SecondaryButton>Cancel</SecondaryButton>
          </Link>
        </BottomControlWrapper>
      </Wrapper>
    );
  }

  return (
    <Wrapper>
      <h1>Choose an opponent</h1>
      <SearchInput
        searchResult={searchResult}
        onChange={handleSearch}
        onResultClick={handleResultClick}
        placeholder="search for opponent"
      />
      <TinyText>RECENTLY CHALLENGED</TinyText>
      <BottomControlWrapper>
        <Link to="/">
          <SecondaryButton>Cancel</SecondaryButton>
        </Link>
      </BottomControlWrapper>
    </Wrapper>
  );
};

export default NewMatchRender;
