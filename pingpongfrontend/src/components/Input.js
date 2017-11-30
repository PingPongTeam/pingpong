import React from 'react';
import { css } from 'glamor';
import glamorous from 'glamorous';
import globalStyles from 'globalStyles';

const Wrapper = glamorous.div({
  display: 'flex',
  flexDirection: 'column',
  position: 'relative',
  margin: '5px 0'
});
const StyledInput = glamorous.input({
  border: `1px dashed rgb(${globalStyles.colors.dinboxBlue})`,
  color: `rgb(${globalStyles.colors.dinboxBlue})`,
  padding: globalStyles.inputPadding,
  borderRadius: globalStyles.borderRadius,
  ':hover': {
    backgroundColor: `rgba(${globalStyles.colors.dinboxBlue}, .1)`
  }
});
const StyledLabel = glamorous.label({
  color: 'black',
  backgroundColor: 'white'
});

const Input = ({
  value,
  label,
  notice,
  status,
  ...rest
}) => {

  const statusColor = status ? `rgb(${globalStyles.colors[status]})` : 'black';
  const noticeColor = statusColor === 'transparent' ? `rgb(${globalStyles.colors.white})` : statusColor;

  return (
    <Wrapper>
      <StyledLabel>{label} {notice && (<span style={{color: noticeColor}}>{notice}</span>)}</StyledLabel>
      <StyledInput
        style={{borderColor: statusColor}}
        value={value}
        {...rest}
      />
    </Wrapper>
  );
}

export default Input;
