import React from 'react';
import glamorous from 'glamorous';
import globalStyles from 'globalStyles';
import Spinner from 'components/Spinner';

const StyledButton = glamorous.button({
  width: '100%',
  borderTop: `1px dashed rgb(${globalStyles.colors.dinboxTurquoise})`,
  color: `rgb(${globalStyles.colors.dinboxBlue})`,
  backgroundColor: `rgb(${globalStyles.colors.white})`,
  fontSize: '23px',
  padding: '1.4em 1.5em',
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

const Button = ({ children, loading, ...rest }) => {
  const textOpacity = loading ? 0 : 1;

  return (
    <StyledButton {...rest}>
      {loading && (
        <SpinnerWrapper>
          <Spinner style={{ position: 'absolute' }} color="dinboxBlue" />
        </SpinnerWrapper>
      )}
      <span style={{ opacity: textOpacity }}>{children}</span>
    </StyledButton>
  );
};

export default Button;
