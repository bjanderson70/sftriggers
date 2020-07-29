sftriggers
==========

set triggers on/off

# Make Triggers in the Org Active
- $  sfdx org:setTriggerStatus --targetusername \<target-org-username\> -s Active
- $  sfdx org:setTriggerStatus --targetusername \<target-org-username\> -s A
- $  sfdx org:setTriggerStatus --targetusername \<target-org-username\> -s true
- $  sfdx org:setTriggerStatus --targetusername \<target-org-username\> -s 1

# Make Triggers in the Org Inactive
- $  sfdx org:setTriggerStatus --targetusername  \<target-org-username\> -s Inactive
- $  sfdx org:setTriggerStatus --targetusername  \<target-org-username\> -s I
- $  sfdx org:setTriggerStatus --targetusername  \<target-org-username\> -s false
- $  sfdx org:setTriggerStatus --targetusername  \<target-org-username\> -s 0

[![Version](https://img.shields.io/npm/v/sftriggers.svg)](https://npmjs.org/package/sftriggers)
[![CircleCI](https://circleci.com/gh/bjanderson70/sftriggers/tree/master.svg?style=shield)](https://circleci.com/gh/bjanderson70/sftriggers/tree/master)
[![Appveyor CI](https://ci.appveyor.com/api/projects/status/github/bjanderson70/sftriggers?branch=master&svg=true)](https://ci.appveyor.com/project/heroku/sftriggers/branch/master)
[![Codecov](https://codecov.io/gh/bjanderson70/sftriggers/branch/master/graph/badge.svg)](https://codecov.io/gh/bjanderson70/sftriggers)
[![Greenkeeper](https://badges.greenkeeper.io/bjanderson70/sftriggers.svg)](https://greenkeeper.io/)
[![Known Vulnerabilities](https://snyk.io/test/github/bjanderson70/sftriggers/badge.svg)](https://snyk.io/test/github/bjanderson70/sftriggers)
[![Downloads/week](https://img.shields.io/npm/dw/sftriggers.svg)](https://npmjs.org/package/sftriggers)
[![License](https://img.shields.io/npm/l/sftriggers.svg)](https://github.com/bjanderson70/sftriggers/blob/master/package.json)

<!-- toc -->
* [Debugging your plugin](#debugging-your-plugin)
<!-- tocstop -->
<!-- install -->
<!-- usage -->
```sh-session
$ npm install -g sftriggers
$ sfdx COMMAND
running command...
$ sfdx (-v|--version|version)
sftriggers/1.0.0 win32-x64 node-v12.18.1
$ sfdx --help [COMMAND]
USAGE
  $ sfdx COMMAND
...
```
<!-- usagestop -->
<!-- commands -->

<!-- commandsstop -->
<!-- debugging-your-plugin -->
# Debugging your plugin
We recommend using the Visual Studio Code (VS Code) IDE for your plugin development. Included in the `.vscode` directory of this plugin is a `launch.json` config file, which allows you to attach a debugger to the node process when running your commands.

To debug the `action:setTriggerStatus` command: 
1. Start the inspector
  
If you linked your plugin to the sfdx cli, call your command with the `-s Active` switch: 
```sh-session
$ sfdx action:setTriggerStatus -u myOrg@example.com -s Active
```
  
Alternatively, to call your command using the `bin/run` script, set the `NODE_OPTIONS` environment variable to `--inspect-brk` when starting the debugger:
```sh-session
$ NODE_OPTIONS=--inspect-brk bin/run action:setTriggerStatus -u myOrg@example.com
```

2. Set some breakpoints in your command code
3. Click on the Debug icon in the Activity Bar on the side of VS Code to open up the Debug view.
4. In the upper left hand corner of VS Code, verify that the "Attach to Remote" launch configuration has been chosen.
5. Hit the green play button to the left of the "Attach to Remote" launch configuration window. The debugger should now be suspended on the first line of the program. 
6. Hit the green play button at the top middle of VS Code (this play button will be to the right of the play button that you clicked in step #5).
<br><img src=".images/vscodeScreenshot.png" width="480" height="278"><br>
Congrats, you are debugging!
