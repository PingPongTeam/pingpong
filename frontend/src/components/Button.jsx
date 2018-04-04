import React from 'react';
import glamorous from 'glamorous';
import globalStyles from 'globalStyles';
import Spinner from 'components/Spinner';

const StyledButton = glamorous.button({
  width: '100%',
  color: `hsla(${globalStyles.colors.white}, 1)`,
  backgroundColor: `hsla(${globalStyles.colors.success}, 1)`,
  fontSize: '23px',
  fontWeight: 600,
  padding: '1.4em 1.5em',
  textTransform: 'uppercase',
  borderRadius: globalStyles.borderRadius,
  cursor: 'pointer',
  ':hover': {
    backgroundColor: `hsla(${globalStyles.colors.success}, .8)`
  },
  ':focus': {
    backgroundColor: `hsla(${globalStyles.colors.success}, .8)`
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
