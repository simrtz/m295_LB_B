const express = require('express');
const fs = require('fs');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yaml');
const session = require('express-session');

const app = express();

app.use((req, res, next) => {
  // eslint disabled because of needed logging
  //
  // eslint-disable-next-line no-console
  console.log(req.path);
  // eslint-disable-next-line no-console
  console.log(req.method);
  // eslint-disable-next-line no-console
  console.log(res.statusCode);

  next();
});

const file = fs.readFileSync('../resources/todoSpecification.yaml', 'utf8');
const swaggerDocument = YAML.parse(file);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use(session({
  secret: 'supersecret',
  resave: false,
  saveUninitialized: true,
  cookie: {},
}));

const port = 3000;
const taskEndpoints = require('./endpoints/taskEndpoints');
const userEndpoints = require('./endpoints/userEndpoints');

app.use('/tasks', taskEndpoints);
app.use('/', userEndpoints);

app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint does not exist',
  });
});

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Example app listening on port ${port}`);
});
