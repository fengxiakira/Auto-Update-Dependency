#!/usr/bin/env node

// main logic here

const runShellScript = require('../lib/utils/runShellScript');
const runShellScriptNoExit = require('../lib/utils/runShellScriptNoExit');
const { config } = require('../config');
const fs = require('fs');
const { commandArgv } = require('../lib/updateDependencyCliOptions');
const { projectToUpdateDirectory, rootDirectory, gitIgnoreFile } = require('../lib/constants/folderPath');
const packageJsonFinder = require('find-package-json');
const { updateVisualComponents } = require('../lib/updateVisualComponents');
const path = require('path');
const open = require('open');
const { projectsToUpdate } = config;
const { userName,updatesSuccess } = require('../lib/constants/usernameAndResult');
const shelljs = require('shelljs');
const ESLINT_FILE = '.eslintrc.js';
const ESLINT_RENAME = 'ignoreLint.js';
const SUMMARY_FILE = 'summary.txt';


const projectGitPath = (userName) => {
    if(commandArgv.SSH){
        return projectsToUpdate.map(({name}) => `git@github.com:${userName}/${name}.git`);
    }
    if(commandArgv.HTTPS){
        return projectsToUpdate.map(({name}) => `https://github.com/${userName}/${name}.git`);
    }
} ;


const installProjects = () => {
    if (!fs.existsSync(projectToUpdateDirectory)) {
        console.log('Creating projectToUpdate directory');
        fs.mkdirSync(projectToUpdateDirectory);
    }

    const code = projectGitPath(userName).map((package) =>
        runShellScriptNoExit(`cd ./projects-to-update && git clone ${package}`)
    );

};

const commitUpgradedProjectToNewBranch = async (folderName) => {
    const getDatedBranchName = () => {
        const date = new Date()
            .toISOString()
            .substring(0, 16)
            .replace(/:/gi, '-');
        return `dependency-updates-${date}`;
    }

    runShellScript(`git checkout -b ${getDatedBranchName()}`);
    runShellScript('git add . && git commit -m "New packages updates available."');
    runShellScript(`git push -u origin ${getDatedBranchName()}`);
    await open(``);
}

const validateUpgradedProject = async (result,folderName,isPackageJsonInAppFolder) => {
    const updatesToIgnore = (app = '') =>
        `### Dependencies Updates and Unit Tests Results\n${app}/test-reports\nupdateSummary\n${app}/npm-audit.html\n${app}/npm-ls-result.txt\n${app}/.jshintrc`;
    const testScriptForUpdatedProject = (testType) => `mkdir -p test-reports/${testType} && mocha --recursive --exit tests/${testType}  --reporter mochawesome --reporter-options reportDir=test-reports/${testType},reportFilename=${testType}TestReport`

    if (result === updatesSuccess(folderName)) {
        runShellScript('npm ls >> npm-ls-result.txt 2>&1');
        runShellScriptNoExit('npm audit --json --audit-level=high  | npm-audit-html', 'Some vulnerabilities were find:');
        if (commandArgv.unitTest) {
            runShellScriptNoExit(
                testScriptForUpdatedProject('unit'),'Some unit tests failed.'
            );
        }
        if (commandArgv.componentTest) {
            runShellScriptNoExit(
                testScriptForUpdatedProject('component'),'Some component tests failed.'
            );
        }
        if (isPackageJsonInAppFolder) {
            try {
                fs.appendFileSync(gitIgnoreFile(folderName), updatesToIgnore('app'));
            } catch (err) {
                console.error(err);
            }
        } else {
            try {
                fs.appendFileSync(gitIgnoreFile(folderName), updatesToIgnore());
            } catch (err) {
                console.err(err);
            }
        }

        return true;
    }
}

const upgradeAndValidateProject = async (folderName) => {
    let isPackageJsonInAppFolder =
        packageJsonFinder(`./projects-to-update/${folderName}`).next().filename === packageJsonFinder().next().filename;
    const folderWithPackageJson = isPackageJsonInAppFolder
        ? `./projects-to-update/${folderName}/app`
        : `./projects-to-update/${folderName}`;
    const folderPath = path.resolve(rootDirectory, folderWithPackageJson);
    const resetWorkingDirectory = () => process.chdir(rootDirectory);

    process.chdir(folderPath);
    runShellScript(`npm install`);
    const result = await updateVisualComponents(folderPath,folderName);
    if(await validateUpgradedProject(result,folderName,isPackageJsonInAppFolder)){
        await commitUpgradedProjectToNewBranch(folderName);
    };
    resetWorkingDirectory();
    return result;
};


console.log(projectGitPath(userName));

 (async () => {
    installProjects();
    runShellScript(`touch ${SUMMARY_FILE}`);
    // rename .eslintrc.js temporarily to avoid the duplicated prettier config
    runShellScript(`mv ${ESLINT_FILE} ${ESLINT_RENAME}`);

    try {
        for (let i = 0; i < projectsToUpdate.length; i++) {
            const updateResult = await upgradeAndValidateProject(projectsToUpdate[i].name);
            fs.appendFileSync(SUMMARY_FILE, updateResult);
        }
    } catch (err) {
        console.error(err);
    } finally {
        runShellScript(`mv ${ESLINT_RENAME} ${ESLINT_FILE}`);
        console.log('Here is the summary of the automated dependencies update:');
        shelljs.exec(`cat ${SUMMARY_FILE}`);
    }
})();
