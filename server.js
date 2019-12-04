const express = require('express'); // importing a CommonJS module
const helmet = require('helmet');
const hubsRouter = require('./hubs/hubs-router.js');
const server = express();

server.use(express.json());

function logger(req, res, next) {
  console.log(
    `[${new Date().toISOString()}] ${req.method} to ${req.url} ${req.get('Origin')}`
  )

  next();
}

function gateKeeper(req, res, next) {
  const password = req.headers.password;

  if (password && password.toLowerCase() === 'mellon') {
    next();
  } else {
    res.status(401).json({ You: 'shall not pass!' });
  }
}

function checkRole(role) {
  return function (req, res, next) {
    if (role && role === req.headers.role) {
      next();
    } else {
      res.status(403).json({ message: "can't touch this!" });
    }
  }
}


server.use(helmet());
server.use(logger);

server.use('/api/hubs', hubsRouter);

server.get('/', (req, res) => {
  const nameInsert = (req.name) ? ` ${req.name}` : '';

  res.send(`
    <h2>Lambda Hubs API</h2>
    <p>Welcome${nameInsert} to the Lambda Hubs API</p>
    `);
});

server.get('/echo', (req, res) => {
  res.send(req.headers);
})

server.get('/area51', helmet(), gateKeeper, checkRole('agent'), (req, res) => {
  res.send(req.headers);
})

module.exports = server;
