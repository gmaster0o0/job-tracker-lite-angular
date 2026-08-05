module.exports = async function () {
  // Deliberately does not kill the api's port. This suite does not own the
  // server: locally it comes from the `api:serve` dependency, which nx tears
  // down itself, and in CI it is a shared process started before the nx run
  // and also used by frontend-e2e. Killing the port here took that server
  // down mid-run and failed every Playwright test that followed.
  console.log(globalThis.__TEARDOWN_MESSAGE__);
};
