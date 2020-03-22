#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const express = require('express')
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const bodyParser = require('body-parser')
const cors = require('cors');
const shortid = require('shortid')
const _  = require('lodash');

const platform = require('./src/phabricator/platform');
const releaseApp = require('./src/apps/releases');
const phabricatorApi = require('./src/phabricator/index');
const api = {
  releases: releaseApp
};
const config = require('./src/defaultConfig.js');
const adapter = new FileSync('db.json')
const db = low(adapter)
const app = express();
const port = 3000

phabricatorApi.connect({
  api: config.get('phabricator.api'),
  token: config.get('phabricator.token')
});
platform.createPlatform(config);

app.use(bodyParser.json())
app.use(cors())

function insterDefaultData() {
  let defualtData = {};
  let rawdata;
  const omit = ["releases"]
  try{
    rawdata = fs.readFileSync(path.resolve(process.cwd(), 'config/defaultData.json'), 'UTF-8');
    defualtData = JSON.parse(rawdata);
  }catch(e) {
    console.log(e);
  }
  
  _.forEach(defualtData, function(value, key) {
    if (omit.indexOf(key) === -1) {
      db.set(key, value).write();
    }
  });

  if (!db.has('releases').value()) {
    db.set('releases', [])
    .write();
  }
}

insterDefaultData();

app.get('/applications', (req, res) => {
  const result = db.get('applications')
  .value();
  res.json({result: result});
});

app.get('/releases', (req, res) => {
  const result = db.get('releases')
  .orderBy(['updatedAt'], ['desc'])
  .value();
  const applications = db.get('applications')
  .value();


  result.forEach((release) => {
    release.application = _.find(applications, {id: release.applicationId});
  });

  // take
  // page

  res.json({result: result});
});

app.post('/releases/create', async (req, res) => {
  const result = db.get('releases')
  const applications = db.get('applications').value();
  let data = req.body;
  let application = _.find(applications, {id: data.release.applicationId});;
  let phabResponse = null;

  data.release.id = shortid.generate();
  data.release.createdAt = Date.now();
  data.release.updatedAt = Date.now();

  result.push(data.release)
  .write();
  
  // call to phab
  phabResponse = await api.releases['generate-release-notes'](
    data.params, 
    {
      ...data.release,
      projectTag: application.projectTag,
      projectName: application.projectName
    }
  )

  res.json({
    release: data.release,
    message: phabResponse.message,
    platformRelease: phabResponse.release
  });
});

app.put('/releases/:id/update', (req, res) => {
  const releaseId = req.params.id;
  let newData = req.body;
  newData.updatedAt = Date.now();

  const result = db.get('releases')
    find({ id: releaseId })
    .assign(newData) // kako ovaj assign radi?
    .value();
 
  res.json({result: result});
});

app.put('/releases/:projectTag.:nextVersion/update-tasks', (req, res) => {
  const nextVersion = req.params.nextVersion;
  const projectTag = req.params.projectTag;

  const result = db.get('releases')
    find({ nextVersion: nextVersion, projectTag: projectTag })
    .value();


  // update taskas
 
  res.json({result: result});
});

app.get('/releases/templates', (req, res) => {
  const result = db.get('releaseTemplates')
  .value();
  res.json({result: result});
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`))