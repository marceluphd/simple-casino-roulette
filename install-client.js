// Copied from
// https://github.com/fullstackreact/food-lookup-demo/blob/master/start-client.js
// See: https://www.fullstackreact.com/articles/using-create-react-app-with-a-server/
const args = [ 'install' ];
const opts = { stdio: 'inherit', cwd: 'client', shell: true };
require('child_process').spawn('npm', args, opts);
