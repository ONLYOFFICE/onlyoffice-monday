const express = require('express');
const bodyParser = require('body-parser');
const passport = require('passport');
const OAuth2Strategy = require('passport-oauth2');
const monday = require('monday-sdk-js')();
const core = require('./core');
const configuration = require('./config');
const jwt = require('jsonwebtoken');
const logger = require('./logger');

const CALLBACK_STATUS = {
  NotFound: 0,
  Editing: 1,
  MustSave: 2,
  Corrupted: 3,
  Closed: 4,
  MustForceSave: 6,
  CorruptedForceSave: 7,
};

var app = express();

var usersDB = { };
var curruser;

passport.serializeUser((user, cb) => {
    cb(null, user.id);
});
 
passport.deserializeUser((id, cb) => {
    cb(null, usersDB.id);
});

passport.use(new OAuth2Strategy({
    authorizationURL: 'https://auth.monday.com/oauth2/authorize',
    tokenURL: 'https://auth.monday.com/oauth2/token',
    clientID: '1',
    clientSecret: '1',
    callbackURL: "http://localhost:8305/auth/callback"
  },
  async (accessToken, refreshToken, profile, cb) => {
    let res = await monday.api('query { me { id, name, title } }', { token: accessToken })
    let user = res.data.me;
    user.token = accessToken;
    user.refreshToken = refreshToken;
    usersDB[res.data.me.id] = user;
    
    logger.debug("Verify user", { user: user });

    curruser = user;
    cb(null, user);
  }
));

app.use(bodyParser.json());

app.get('/', (req, res) => { res.end('user ' + JSON.stringify(curruser)); }); // remove

app.get('/editor/:docId/:itemId/:boardId', async (req, res) => {
  logger.http("Got request", { method: req.method, url: req.url });
  logger.silly(req);

  res.header("Access-Control-Allow-Origin", "*"); // *.monday.com
  // get current user
  let json = await monday.api(`query { assets (ids: [ ${req.params.docId} ]) { id, name, public_url } }`, { token: curruser.token });
  let file = json.data.assets[0];

  logger.debug("Got info about asset", { json: json });

  config = {
    "document": {
        "fileType": "docx",
        "key": new Date().getTime().toString(), // key should be probably saved in their storage
        "title": file.name,
        "url": file.public_url
    },
    "editorConfig": {
      "callbackUrl": "http://localhost:8305/editor/" + jwt.sign({ filename: file.name, docId: req.params.docId, itemId: req.params.itemId, boardId: req.params.boardId }, configuration.get("jwtkey")),
      "mode": "edit",
    },
    "documentType": "word",
  };

  logger.debug("Formed configuration for editors", { config: config });

  res.json(config);
});

app.post('/editor/:jwt', async (req, res) => {
  logger.http("Got request", { method: req.method, url: req.url });
  logger.silly(req);

  let body = null;
  let decoded = null;

  try {
    decoded = jwt.verify(req.params.jwt, configuration.get("jwtkey"));

    // check editors jwt
    // get user and his token

    body = req.body;

    logger.debug("Got POST", { request: decoded, body: body });
  
    switch(body.status) {
      case CALLBACK_STATUS.Editing:
        // user connected/disconnected
        break;
      case CALLBACK_STATUS.MustSave:
      case CALLBACK_STATUS.Corrupted:
        await core.processSave(body, curruser, decoded);
        break;
    }
  } catch (error) {
    logger.error("Error while processing POST", { request: decoded, body: body, error: error });

    res.json({error: 1, message: error.message});
    return;
  }
  
  logger.debug("Success POST", { request: decoded, body: body });
  res.json({error: 0});
});

app.get('/auth',
  passport.authenticate('oauth2'));

app.get('/auth/callback',
  passport.authenticate('oauth2', { failureRedirect: '/login' }),
  (req, res) => {
    res.redirect('/');
  });


let port = configuration.get("port");
logger.verbose(`Starting server on ${port}`);

app.listen(port, () => {
  logger.verbose(`Started server on ${port}`);
});