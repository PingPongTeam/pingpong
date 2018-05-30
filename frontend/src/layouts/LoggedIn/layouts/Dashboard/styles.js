import glamorous from 'glamorous';

export const Wrapper = glamorous.div({
  width: '100%',
  padding: '10vh 4vw',
  userSelect: 'none'
});
export const Menu = glamorous.div({
  position: 'fixed',
  top: 0,
  left: 0,
  padding: '1em'
});
export const TotalScore = glamorous.div({
  display: 'flex',
  justifyContent: 'space-around'
});
export const TotalScoreBox = glamorous.div({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center'
});
export const TotalScoreNumber = glamorous.div({
  fontSize: '20vh',
  lineHeight: 0.9
});
export const StartMatch = glamorous.div({
  position: 'fixed',
  bottom: 0,
  left: 0,
  width: '100%'
});
export const MatchListLabel = glamorous.div({
  textAlign: 'center',
  marginTop: '3em'
});
export const MatchList = glamorous.div({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center'
});
export const Match = glamorous.span({
  display: 'flex',
  width: '100%'
});
export const PlayerBox = glamorous.div({
  flexBasis: '50%',
  flexGrow: 0,
  flexShrink: 0,
  display: 'inline-flex',
  alignItems: 'center'
});
export const PlayerName = glamorous.span({
  fontSize: '10vw',
  fontWeight: 300
});
export const PlayerScore = glamorous.span({
  fontSize: '15vw',
  padding: '0.15em 0 0.15em',
  flexBasis: '23vw',
  textAlign: 'center'
});
