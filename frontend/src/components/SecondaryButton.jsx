import React from 'react';
import glamorous from 'glamorous';
import globalStyles from 'globalStyles';

const StyledButton = glamorous.button({
  textTransform: 'uppercase',
  fontSize: '14px',
  padding: '1.7em',
  width: '100%',
  color: `hsla(${globalStyles.colors.white}, 1)`,
  backgroundColor: 'transparent',
  ':hover': {
    color: `hsla(${globalStyles.colors.success}, 1)`
  },
  ':focus': {
    color: `hsla(${globalStyles.colors.success}, 1)`
  }
});

const SecondaryButton = ({ children, ...rest }) => (
  <StyledButton {...rest}>{children}</StyledButton>
);

export default SecondaryButton;
