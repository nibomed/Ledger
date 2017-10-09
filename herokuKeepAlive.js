const KoaServer = require('koa-server');
const server = new KoaServer();
 
server.get('/', function*(){
  this.body = 'Keep alive!';
})
 
server.listen(process.env.PORT || 8000);

const { exec } = require('child_process');
function keepAliveRequest() {
    exec('curl https://immense-brook-88047.herokuapp.com/', (err, stdout, stderr) => console.log(stdout));
}
setInterval(keepAliveRequest, 12 * 60 * 1000);