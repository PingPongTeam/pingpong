function logoutRoutine() {
  window.localStorage.removeItem('jwt');
  window.location.reload();
}

export default logoutRoutine;
