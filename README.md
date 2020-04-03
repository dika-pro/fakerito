# Fakerito

CLI for boosting opinioned phabricator workflow.

## Installation

You will need to install [arcanist](https://github.com/phacility/arcanist) to starting using commands.

You may install this tool with this command:

```
npm install fakerito --save-dev
```

## Usage

Installing the CLI globally provides access to the fakerito CLI command and a fakerito server.

```
fakerito [command]

# Run `help` for detailed information about CLI commands
fakerito [command] help

# Brings up server
fakerito-server
```

## fakerito

### Config

You can set next options for your project. Config is passed using `-c path/to/config.json`.

##### projectName
Type: `string`

Display name for project that will be used in generating titles and names.

##### projectTag
Type: `string`

Project tag created by phabricator.

##### projectTeam
Type: `string`

Project team tag created by phabricator.

##### slackChannel
Type: `string`

Slack channel.

##### releases
Type: `Array`

Release data.

##### releases.platform
Type: `String`
Default: `phabricator`

Release platform. For now, it should be always set to phabricator.

##### releases.previousVersion
Type: `String`
Default:`undefined`


##### releases.nextVersion
Type: `String`
Default: `undefined`

##### releases.releaseDate
Type: `String`
Default: `undefined`

Release date in next format `YYYY-MM-DD`.

##### releases.releaseTimeFrom
Type: `String`
Default: `undefined`

Release time from in next format `HH:mm`.

##### releases.releaseTimeTo
Type: `String`
Default: `undefined`

Release time to in next format `HH:mm`.

##### releases.owner
Type: `String`
Default: `undefined`
Usage:

`gates.bill`

##### releases.projects
Type: `Array`
Default: `undefined`


##### releases.subscribers
Type: `Array`
Default: `undefined`


##### releases.additionalInfo
Type: `Array`
Default: `undefined`


##### releases.additionalInfo.title
Type: `String`
Default: `null`

Title of an additonal info.

##### releases.additionalInfo.entries
Type: `Array`
Default: `null`


##### releases.additionalInfo.entries.value
Type: `String`
Default: `null`

##### releases.additionalInfo.entries.visible
Type: `Boolean`
Default: `true`


#### Example config

```
{
  "projectName": "Awsom app",
  "projectTag": "awsapp",
  "projectTeam": "team_aws",
  "slackChannel": "https://slack.com/messages/C5NAQH/cono/C9V22GG4D-153462077.0100",
  "phabricator": {
    "url": "https://phabricator.com",
    "task": {
      "customFields": {
        "slack": "custom.aha:slack-channel"   
      }
    }
  },
  "releases": {
    "platform": "phabricator",
    "previousVersion": "1.45.0",
    "nextVersion": "1.46.0",
    "releaseDate": "2019-08-19",
    "releaseTimeFrom": "12:00",
    "releaseTimeTo": "12:30",
    "owner": "gates.bill",
    "projects": ["some_other_tag"],
    "subscribers": [
      "torvalds.linus",
      "qa.user"
    ],
    "additionalInfo": [
      {
        "title": "Notes",
        "entries": [
          {
            "value": "Downtime: NA"
          },
          {
            "value": "All changes will be on *BETA* channel on 2019-08-12 12:00 - 12:30"
          },
          {
            "value": "Team Sports and Team Ngs create release branch with changes (if any) until 16:00 day before *BETA* channel release."
          },
          {
            "value": "Tasks: [Link](https://phabricator.com/maniphest/query/mxJvw0TSPt1v/#R)"
          }
        ]
      },
      {
        "title": "Before Release",
        "entries": [
          {
            "value": "Merge Team X and Team Y branches (if any)"
          },
          {
            "value": "Check did we introduce any errors on beta channel with this release."
          }
        ]
      },
      {
        "title": "After Release",
        "entries": [
          {
            "value": "[] .placeholder"
          },
          {
            "value": "Send changelog."
          }
        ]
      }
    ]
  ]
}

```
### Commands

`releases`

It handles project releases.

`releases generate-release-notes`

It will create task with summary of upcoming taskas and notes.

## fakerito-server

### Config

## Contributing

Please read [CONTRIBUTING.md](https://gist.github.com/PurpleBooth/b24679402957c63ec426) for details on our code of conduct, and the process for submitting pull requests to us.

## Versioning

We use [SemVer](http://semver.org/) for versioning. For the versions available, see the [tags on this repository](https://github.com/your/project/tags). 


## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details
