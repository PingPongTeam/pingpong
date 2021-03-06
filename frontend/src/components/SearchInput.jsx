import React from 'react';
import { css } from 'glamor';
import glamorous from 'glamorous';
import globalStyles from 'globalStyles';
import Input from 'components/Input';

const Wrapper = glamorous.div({
  maxWidth: '100%',
  overflow: 'hidden'
});
const InputWrapper = glamorous.div({
  display: 'flex',
  alignItems: 'center',
  position: 'relative'
});
const inputStyles = {
  paddingLeft: '2.8em'
};
const SearchIconWrapper = glamorous.div({
  position: 'absolute',
  left: '1.7em',
  top: '50%',
  transform: 'translateY(-50%)'
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
  width: '100%',
  overflow: 'hidden'
});
const resultItem = css({
  fontSize: '54px',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  padding: '0.6em 0.4em',
  ':hover': {
    backgroundColor: `hsla(${globalStyles.colors.success}, 1)`
  },
  ':focus': {
    backgroundColor: `hsla(${globalStyles.colors.success}, 1)`
  }
});

const SearchInputRender = ({
  searchResult,
  onChange,
  onResultClick,
  placeholder
}) => {
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
  const handleResultKeyDown = (e, result, index) => {
    const keyPressed = e.key;
    if (keyPressed === 'ArrowDown' && resultRefs[index + 1]) {
      resultRefs[index + 1].focus();
    }
    if (keyPressed === 'ArrowUp') {
      const prevIndex = index - 1;
      if (prevIndex < 0) {
        searchInputRef.focus();
        return;
      }
      resultRefs[index - 1].focus();
    }
  };
  const inputKeyDown = e => {
    const keyPressed = e.key;
    if (keyPressed === 'ArrowDown' && resultRefs[0]) {
      resultRefs[0].focus();
    }
  };

  let searchInputRef;
  let resultRefs = [];

  return (
    <Wrapper>
      <InputWrapper>
        <SearchIconWrapper>{searchIcon}</SearchIconWrapper>
        <Input
          style={inputStyles}
          getRef={ref => {
            searchInputRef = ref;
          }}
          type="search"
          placeholder={placeholder}
          onChange={handleInputChange}
          onKeyDown={inputKeyDown}
          margin="0"
        />
      </InputWrapper>
      {searchResult && (
        <Results>
          {searchResult.map((result, index) => (
            <div
              className={resultItem}
              ref={ref => {
                resultRefs.push(ref);
              }}
              key={index}
              tabIndex="0"
              onClick={() => {
                handleResultClick(result);
              }}
              onKeyUp={e => {
                handleResultKeyUp(e, result);
              }}
              onKeyDown={e => {
                handleResultKeyDown(e, result, index);
              }}
            >
              {result.alias}
            </div>
          ))}
        </Results>
      )}
    </Wrapper>
  );
};

export default SearchInputRender;
