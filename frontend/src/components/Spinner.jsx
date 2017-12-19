// credit to tobiasahlin.com/spinkit/
import React, { Component } from 'react';
import { css } from 'glamor';
import globalStyles from 'globalStyles';


const animation = css.keyframes({
  '0%, 80%, 100%': { transform: 'scale(0)' },
  '40%': { transform: 'scale(1.0)' }
})
const wrapper = css({
  margin: '0 auto',
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  textAlign: 'center',
  '> div': {
    margin: '0 2px',
    width: '10px',
    height: '20px',
    borderRadius: globalStyles.borderRadius,
    display: 'inline-block',
    animationName: `${animation}`,
    animationDuration: '1.4s',
    animationTimingFunction: 'ease-in-out',
    animationIterationCount: 'infinite',
    animationDirection: 'both'
}
});
const bounce1 = css({
  animationDelay: '-0.32s',
});
const bounce2 = css({
  animationDelay: '-0.16s',
});

class Spinner extends Component {

  constructor(props) {
    super(props);
    this.color = props.color ?
      `rgb(${globalStyles.colors[props.color]})` :
      `rgb(${globalStyles.colors.white})`;
  }

  render() {
    return (
      <div {...this.props} className={wrapper}>
        <div style={{backgroundColor: this.color}} className={bounce1} />
        <div style={{backgroundColor: this.color}} className={bounce2} />
        <div style={{backgroundColor: this.color}} />
      </div>
    );
  }
}

export default Spinner;
