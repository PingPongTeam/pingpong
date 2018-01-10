import React from 'react';
import glamorous from 'glamorous';
import globalStyles from 'globalStyles';

const Wrapper = glamorous.div({});
const InputWrapper = glamorous.div({
  display: 'flex',
  alignItems: 'center',
  marginBottom: '15px'
});
const StyledInput = glamorous.input({
  color: `rgb(${globalStyles.colors.black})`,
  fontSize: '24px',
  marginLeft: '10px',
  minWidth: '330px'
});
const searchIcon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);
const Results = glamorous.div({
  width: '100%'
});
const ResultItem = glamorous.div({
  fontSize: '54px',
  padding: '15px 5px',
  ':hover': {
    backgroundColor: `rgba(${globalStyles.colors.black}, .05)`
  },
  ':focus': {
    backgroundColor: `rgba(${globalStyles.colors.black}, .05)`
  }
});

const SearchInputRender = ({ searchResult, onChange, onResultClick }) => {
  const handleInputChange = e => {
    const searchString = e.target.value;
    onChange(searchString);
  };
  const handleResultClick = result => {
    onResultClick(result);
  };
  const handleResultKeyUp = (e, result) => {
    const keyPressed = e.key;
    if (keyPressed === 'Enter') {
      onResultClick(result);
    }
  };

  return (
    <Wrapper>
      <InputWrapper>
        {searchIcon}
        <StyledInput
          type="search"
          placeholder="SEARCH FOR AN OPPONENT"
          onChange={handleInputChange}
        />
      </InputWrapper>
      {searchResult && (
        <Results>
          {searchResult.map((result, index) => (
            <ResultItem
              key={index}
              tabIndex="0"
              onClick={() => {
                handleResultClick(result);
              }}
              onKeyUp={e => {
                handleResultKeyUp(e, result);
              }}
            >
              {result.text}
            </ResultItem>
          ))}
        </Results>
      )}
    </Wrapper>
  );
};

export default SearchInputRender;
