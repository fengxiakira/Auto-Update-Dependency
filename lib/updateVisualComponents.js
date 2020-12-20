// This file is cooperated others.
const { isEmpty, isNil, find } = require('lodash');
const npmCheck = require('npm-check');
const retry = require('async-retry');
const fs = require('fs');
const runShellScript = require('./utils/runShellScript');
const { config } = require('../config');
const logDependency = require('./utils/logDependency');
const { updatesSuccess, updatesFailed } = require('./constants/usernameAndResult');

const {
    dependenciesToUpdateArtifact,
    dependencyVersionsDiffArtifact,
    summaryDirectory,
    dependenciesToIgnoreArtifact,
    dependenciesToIgnoreMajorArtifact,
    dependenciesToIgnorePrereleaseArtifact,
} = require('./constants/automatedDependencyUpdatesSummary');

const NUMBER_OF_RETRIES_TO_RETRIEVE_NPM_PACKAGE_INFORMATION = 5;

const logDependenciesThatWillNotBeUpdated = (visualDependenciesByVersionUpdateType) => {
    if (!isEmpty(visualDependenciesByVersionUpdateType.major)) {
        console.log(
            'The following visual dependencies are outdated by a major version and will not be attempted for update:\n'
        );
        visualDependenciesByVersionUpdateType.major.forEach(logDependency);
        console.log('\n\n');
    }

    if (!isEmpty(visualDependenciesByVersionUpdateType.prerelease)) {
        console.log(
            'The following visual dependencies are outdated by a prerelease version and will not be attempted for update:\n'
        );
        visualDependenciesByVersionUpdateType.prerelease.forEach(logDependency);
        console.log('\n\n');
    }
};

const produceDependenciesArtifacts = (
    visualDependenciesByVersionUpdateType,
    dependenciesToUpdate,
    dependenciesToIgnore,
    folderName
) => {
    if (!fs.existsSync(summaryDirectory(folderName))) {
        console.log('Creating Summary directory');
        fs.mkdirSync(summaryDirectory(folderName));
    }
    console.log('Writing dependencies diff artifact');
    fs.writeFileSync(
        dependencyVersionsDiffArtifact(folderName),
        JSON.stringify(visualDependenciesByVersionUpdateType, null, 2)
    );
    console.log('Writing dependencies that will not be attempted for update -- major');
    fs.writeFileSync(
        dependenciesToIgnoreMajorArtifact(folderName),
        JSON.stringify(visualDependenciesByVersionUpdateType.major, null, 2)
    );
    console.log('Writing dependencies that will not be attempted for update -- prerelease');
    fs.writeFileSync(
        dependenciesToIgnorePrereleaseArtifact(folderName),
        JSON.stringify(visualDependenciesByVersionUpdateType.prerelease, null, 2)
    );
    console.log('Writing dependencies to update artifact');
    fs.writeFileSync(dependenciesToUpdateArtifact(folderName), JSON.stringify(dependenciesToUpdate, null, 2));
    console.log('Writing ignored dependencies to ignore artifact');
    fs.writeFileSync(dependenciesToIgnoreArtifact(folderName), JSON.stringify(dependenciesToIgnore, null, 2));
};

const updateDependencies = (dependencies) => {
    const npmInstallExpression = `npm install --save-exact ${dependencies
        .map(({ moduleName, latest }) => `${moduleName}@${latest}`)
        .join(' ')}`;

    runShellScript(npmInstallExpression);
};

const compareInstalledDependenciesWithAvailable = (folderPath) =>
    retry(
        async () => {
            console.log('Attempting to retrieve package information from npm registry');
            const currentNpmState = await npmCheck({ cwd: folderPath, debug: true });
            const dependencies = currentNpmState.get('packages');

            const packageInError = dependencies.find(
                ({ regError, moduleName }) =>
                    !isNil(regError) && !isNil(find(config.dependencies, { packageName: moduleName }))
            );
            if (!isNil(packageInError)) {
                console.error(
                    `Error retrieving latest available version for package [${packageInError.moduleName}]: ${packageInError.regError}`
                );
                throw new Error(`Information on package [${packageInError.moduleName}] could not be retrieved`);
            }

            // Filter to the visual libraries we care about that have a newer version and are not at the latest
            return dependencies.filter(
                ({ moduleName, latest, installed }) =>
                    !isNil(find(config.dependencies, { packageName: moduleName })) &&
                    !isNil(latest) &&
                    latest !== installed
            );
        },
        { retries: NUMBER_OF_RETRIES_TO_RETRIEVE_NPM_PACKAGE_INFORMATION }
    );

const updateVisualComponents = async (folderPath, folderName) => {
    console.log('Comparing dependency versions with the latest updates available');

    const visualDependenciesOutOfVersion = await compareInstalledDependenciesWithAvailable(folderPath);

    console.log('The following visual dependencies are outdated:\n');
    visualDependenciesOutOfVersion.forEach(logDependency);
    console.log('\n\n');

    // Group dependencies by update type
    const visualDependenciesByVersionUpdateType = visualDependenciesOutOfVersion.reduce(
        (versionUpdateToDependencyMap, dependency) => {
            // A safety to keep track of dependencies reported outside an expected update type
            if (isNil(versionUpdateToDependencyMap[dependency.bump])) {
                versionUpdateToDependencyMap[dependency.bump] = [];
            }
            versionUpdateToDependencyMap[dependency.bump].push(dependency);
            return versionUpdateToDependencyMap;
        },
        { major: [], minor: [], patch: [], prerelease: [] }
    );

    const getVersionsToUpdateBy = (updateByVersion) => {
        const hierarchy = ['prerelease', 'major', 'minor', 'patch'];
        return hierarchy.slice(hierarchy.indexOf(updateByVersion));
    };

    const dependenciesToUpdate = visualDependenciesOutOfVersion.filter(({ bump, moduleName }) => {
        const item = find(config.dependencies, { packageName: moduleName });
        if (item) {
            return (
                moduleName === item.packageName &&
                getVersionsToUpdateBy(item.updateByVersion).includes(bump) &&
                !item.ignore
            );
        }
        return false;
    });

    const dependenciesToIgnore = visualDependenciesOutOfVersion.filter(({ moduleName }) => {
        const item = find(config.dependencies, { packageName: moduleName });
        if (item) {
            return moduleName === item.packageName && item.ignore;
        }
        return false;
    });

    logDependenciesThatWillNotBeUpdated(visualDependenciesByVersionUpdateType);

    produceDependenciesArtifacts(
        visualDependenciesByVersionUpdateType,
        dependenciesToUpdate,
        dependenciesToIgnore,
        folderName
    );

    if (isEmpty(dependenciesToUpdate)) {
        console.log('There are no dependencies eligible to be automatically updated');
        return updatesFailed(folderName);
    } else {
        updateDependencies(dependenciesToUpdate);
        return updatesSuccess(folderName);
    }
};

module.exports = { compareInstalledDependenciesWithAvailable, updateVisualComponents };
