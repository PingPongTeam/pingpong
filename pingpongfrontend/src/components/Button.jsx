import React from 'react';
import glamorous from 'glamorous';
import globalStyles from 'globalStyles';
import Spinner from 'components/Spinner';

const StyledButton = glamorous.button({
  border: `1px dashed rgb(${globalStyles.colors.dinboxBlue})`,
  color: `rgb(${globalStyles.colors.dinboxBlue})`,
  backgroundColor: `rgb(${globalStyles.colors.white})`,
  margin: '5px 0',
  fontSize: '20px',
  borderRadius: globalStyles.borderRadius,
  padding: globalStyles.inputPadding,
  textTransform: 'uppercase',
  cursor: 'pointer',
  ':hover': {
    backgroundColor: `rgba(${globalStyles.colors.black}, .05)`
  },
  ':focus': {
    backgroundColor: `rgba(${globalStyles.colors.black}, .1)`
  }
});

const SpinnerWrapper = glamorous.div({
  width: '100%',
  height: '100%',
  position: 'relative'
});

const Button = ({
  children,
  loading,
  ...rest
}) => {

  const textOpacity = loading ? 0 : 1;
  const spinnerColor = `rgb(${globalStyles.colors.dinboxBlue})`;

  return (
    <StyledButton {...rest} >
      {
        loading && (
          <SpinnerWrapper>
            <Spinner
              style={{position: 'absolute'}}
              color='dinboxBlue'
            />
          </SpinnerWrapper>
        )
      }
      <span style={{opacity: textOpacity}}>{children}</span>
    </StyledButton>
  );
}

export default Button;
