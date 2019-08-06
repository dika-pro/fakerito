# Fakerito

CLI for boosting opinioned phabricator workflow.

## Getting Started

You may install this tool with this command:

```
npm install fakerito --save-dev
```

### Prerequisites

You will need to install [arcanist](https://github.com/phacility/arcanist) to starting using commands.


### Usage


#### Config

You can set next options to customize your project.

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

Release data

##### releases[].platform
Type: `String`

Release platform. For now, it should be always set to phabricator.

#### Releases

Generate release notes will create task with summary of upcoming taskas and notes.

```
fakerito releases create-release-notes -c yourconfig.config.json
```

## Contributing

Please read [CONTRIBUTING.md](https://gist.github.com/PurpleBooth/b24679402957c63ec426) for details on our code of conduct, and the process for submitting pull requests to us.

## Versioning

We use [SemVer](http://semver.org/) for versioning. For the versions available, see the [tags on this repository](https://github.com/your/project/tags). 

## Authors

* **Billie Thompson** - *Initial work* - [PurpleBooth](https://github.com/PurpleBooth)

See also the list of [contributors](https://github.com/your/project/contributors) who participated in this project.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details
