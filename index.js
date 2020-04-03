#!/usr/bin/env node

const express = require('express')
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const bodyParser = require('body-parser')
const cors = require('cors');
const shortid = require('shortid')
const _  = require('lodash');
const basicAuth = require('express-basic-auth')
 

const platform = require('./src/phabricator/platform');
const releaseApp = require('./src/apps/releases');
const pastePhabApi = require('./src/phabricator/paste');
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
app.use(basicAuth({
  users: { admin: 'c2RzZDpzZHNk' },
}))


async function insterDefaultData() {
  const omit = ["releases"]
  const defData = await pastePhabApi.getPasteByIds([config.get('release.pasteId')]);
  let defualtData = {};
  if (defData.data && defData.data.length) {
    defualtData = JSON.parse(defData.data[0].attachments.content.content);
    _.forEach(defualtData, function(value, key) {
      if (omit.indexOf(key) === -1) {
        db.set(key, value).write();
      }
    });
  }
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
  .take(30)
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
  let application = _.find(applications, {id: data.release.applicationId});
  let phabResponse = null;

  data.release.id = shortid.generate();
  data.release.createdAt = Date.now();
  data.release.updatedAt = Date.now();

  // do not inster if dry run
  if (!data.params.dryRun) {
    result.push(data.release).write();
  }
  
  // call to phab
  phabResponse = await api.releases['generate-release-notes'](
    data.params, 
    {
      ...data.release,
      projectTag: application.projectTag,
      projectName: application.projectName
    }
  );

  res.json({
    release: data.release,
    message: phabResponse.message,
    platformRelease: phabResponse.release
  });
});

app.get('/releases/release/:id', (req, res) => {
  const releaseId = req.params.id;

  const result = db.get('releases')
    .find({ id: releaseId })
    .value();
 
  res.json({result: result});
});

app.put('/releases/:id/update', async (req, res) => {
  const releaseId = req.params.id;
  let newData = req.body;
  const applications = db.get('applications').value();
  const result = {};
  newData.release.updatedAt = Date.now();
  let application = _.find(applications, {id: newData.release.applicationId});

  if (!newData.params.dryRun) {
    result = db.get('releases')
    find({ id: releaseId })
    .assign(_.omit(newData.release, [
      'createdAt', 'id', 'applicationId', 'platform'
    ])) 
    .write();
 
  }

   // call to phab
   phabResponse = await api.releases['generate-release-notes'](
    newData.params, 
    {
      ...newData.release,
      projectTag: application.projectTag,
      projectName: application.projectName
    }
  );

  res.json({
    result: result,
    message: phabResponse.message,
    platformRelease: phabResponse.release
  });
});

app.put('/releases/:projectTag.:nextVersion/update-tasks', async (req, res) => {
  const nextVersion = req.params.nextVersion;
  const projectTag = req.params.projectTag;
  const applications = db.get('applications').value();
  const result = db.get('releases')
  find({ nextVersion: nextVersion, projectTag: projectTag })
  .value();
  let application = _.find(applications, {id: result.applicationId});

    // call to phab
   phabResponse = await api.releases['generate-release-notes'](
    newData.params, 
    {
      ...result,
      projectTag: application.projectTag,
      projectName: application.projectName
    }
  );

  // update taskas
 
  res.json({
    result: result,
    message: phabResponse.message,
    platformRelease: phabResponse.release
  });
});

app.get('/releases/templates', (req, res) => {
  const result = db.get('releaseTemplates')
  .value();
  res.json({result: result});
});

app.listen(port, () => console.log(`Fakerito-server listening on port ${port}!`))