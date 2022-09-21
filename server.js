// PACKAGES
// Create the basic express app
require('dotenv').config();
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3500;
const fs = require('fs');
// Logger
const logger = require('morgan');
const router = express.Router();
// global root variable
const path = require('path');
global.appRoot = path.resolve(__dirname);

const mime = require('mime');
//const mime = require('mime-types')

//The path to HTML and other view related files on disk
const VIEW_PATH = path.join(__dirname, 'view');


// MIDDLEWARE
// Log requests
app.use(logger('dev'));
// Handle url-encoded form data
app.use(express.urlencoded({ extended: false }));
// JSON
app.use(express.json());

// serve our images
app.use('/images', express.static(path.join(__dirname, 'public/images')));

function getMimeType (v, dft) {
  try {
    let ret;
    if (mime.lookup) {
      ret = mime.lookup(v) || dft || 'text/html';
    } else {
      ret = mime.getType(v) || dft || 'text/html';
    }
    return ret;
  } catch (ex) {
    return dft || 'text/html';
  }
}


function removeBase (uri, base, noLeadingSlash) {
  let ret;
  if (!base || !base.length) {
    ret = uri;
  } else if (uri.length < base.length) {
    ret = uri;
  } else if (uri.substring(0,base.length).toLowerCase() !== base) {
    ret = uri;
  } else {
    ret = uri.substring(base.length, uri.length);
  }
  
  if (noLeadingSlash && ret.length > 0 && ret.substring(0,1) === '/') {
    ret = ret.substring(1,ret.length);
  }
  
  return ret;
}



async function start () {
  const IMG_BASE = '/images';
  const SCRIPT_BASE = '/script';
  const VIEW_BASE = '/view';
  
  
  const IMG_URL_PATH = new RegExp(`${IMG_BASE}\..*`,'i');
  const SCRIPT_URL_PATH = new RegExp(`${SCRIPT_BASE}\..*`,'i');
  const VIEW_URL_PATH = new RegExp(`${VIEW_BASE}\..*`,'i');
  
  
  app.get(SCRIPT_URL_PATH, async (req, res, next) => {
    try {
      let name = removeBase(req.path,SCRIPT_BASE,true);
      
      let opfile = path.join(VIEW_PATH, name.trim());
      if (opfile.slice(-3).toLowerCase() !== '.js') opfile+= '.js';
      
      
      res.type(getMimeType(opfile))
      res.sendFile(path.join(appRoot,`/public/script/${name}`));
    } catch (e) {
      console.log(e);
    }
  });
  
  app.get(VIEW_URL_PATH, async (req, res, next) => {
    try {
      let name = removeBase(req.path,VIEW_BASE,true);
      let opfile = path.join(VIEW_PATH, name.trim());
      
      if (opfile.slice(-5).toLowerCase() !== '.html') opfile+= '.html';
      
      
      res.type(getMimeType(opfile))
      res.sendFile(path.join(appRoot,`/public/view/${name}.html`), (err)=>{
        if (err) {
          res.sendFile(path.join(appRoot,`/public/view/not-found.html`));
        }
      });
    } catch (e) {
      res.sendFile(path.join(appRoot,`/public/view/not-found.html`));
      console.error('{0}-[{1}]: (try) {2}', req.method, req.path, e);
      try {
        if (e.code === 'ENOENT') {
          return res.status(404).send(e.message).end();
        }
      } catch (ex) { /* do nothing, response already closed */ }
    }
  });
  
}

// ROUTES
// app.use('/', require('./routes/index'));
// app.use('/demo', require('./routes/demo'));
// app.use('/register', require('./routes/index'));

// app.get('^$|/register', (req, res) => {
//   res.status(200).sendFile(path.join(appRoot+'/public/view/register.html'));
// });

async function initialize () {
 await start();
}

initialize();

// Universal 404 page
app.all('*', (req, res) => {
  // Send response as JSON
  res.status(404).json({ message: '404 Not Found' });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
