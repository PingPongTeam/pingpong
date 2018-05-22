import state from 'services/state';
import userState from 'services/state/user';
import matchHistory from 'services/state/matchHistory';
import match from 'services/api/match';

async function loginRoutine(loginData) {
  console.log('userObject:', loginData.userObject);
  userState.setUser(loginData.userObject);
  window.localStorage.setItem('jwt', loginData.token);
  state.loggedIn = true;
  try {
    const result = await match.get();
    matchHistory.matches = result.matches.reverse();
    console.log('routine, got matches!', result.matches);
  } catch (e) {
    console.log('loginRoutine failed to get matches');
  }
}

export default loginRoutine;
