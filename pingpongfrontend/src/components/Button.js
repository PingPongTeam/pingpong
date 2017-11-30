import React from 'react';
import glamorous from 'glamorous';
import globalStyles from 'globalStyles';

const StyledButton = glamorous.button({
  border: `1px dashed rgb(${globalStyles.colors.dinboxBlue})`,
  color: `rgb(${globalStyles.colors.dinboxBlue})`,
  margin: '5px 0',
  borderRadius: globalStyles.borderRadius,
  padding: globalStyles.inputPadding,
  textTransform: 'uppercase',
  cursor: 'pointer',
  ':hover': {
    backgroundColor: `rgba(${globalStyles.colors.dinboxBlue}, .1)`
  },
  ':focus': {
    backgroundColor: `rgba(${globalStyles.colors.dinboxBlue}, .2)`
  }
});

const Form = ({
  children,
  ...rest
}) => {
  return (
    <StyledButton {...rest} >
      {children}
    </StyledButton>
  );
}

export default Form;
