import React from 'react';
import glamorous from 'glamorous';
import globalStyles from 'globalStyles';

const StyledButton = glamorous.button({
  textTransform: 'uppercase',
  fontSize: '14px',
  padding: globalStyles.inputPadding,
  width: '100%',
  color: `rgb(${globalStyles.colors.black})`,
  backgroundColor: `rgb(${globalStyles.colors.white})`,
  ':hover': {
    color: `black`,
  }
});

const SecondaryButton = ({
  children,
  ...rest
}) => (
  <StyledButton {...rest}>
    {children}
  </StyledButton>
);

export default SecondaryButton;
