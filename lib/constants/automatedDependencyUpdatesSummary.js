const path = require('path');

const PROJECT_AUTO_SUMMARY_DIRECTORY = (folder) => `../../projects-to-update/${folder}/updateSummary`;
const DEPENDENCIES_TO_UPDATE_ARTIFACT_NAME = 'dependenciesToUpdate.json';
const DEPENDENCY_DIFF_ARTIFACT_NAME = 'dependencyVersionsDiff.json';
const DEPENDENCIES_TO_IGNORE_ARTIFACT_NAME = 'dependenciesToIgnore.json';
const DEPENDENCIES_TO_IGNORE_ARTIFACT_MAJOR_NAME = 'dependenciesToIgnoreMajor.json';
const DEPENDENCIES_TO_IGNORE_ARTIFACT_PRERELEASE_NAME = 'dependenciesToIgnorePrerelease.json';
const summaryDirectory = (folder) => path.resolve(__dirname, PROJECT_AUTO_SUMMARY_DIRECTORY(folder));
const dependenciesToUpdateArtifact = (folder) =>
    path.resolve(summaryDirectory(folder), DEPENDENCIES_TO_UPDATE_ARTIFACT_NAME);
const dependencyVersionsDiffArtifact = (folder) =>
    path.resolve(summaryDirectory(folder), DEPENDENCY_DIFF_ARTIFACT_NAME);
const dependenciesToIgnoreArtifact = (folder) =>
    path.resolve(summaryDirectory(folder), DEPENDENCIES_TO_IGNORE_ARTIFACT_NAME);
const dependenciesToIgnoreMajorArtifact = (folder) =>
    path.resolve(summaryDirectory(folder), DEPENDENCIES_TO_IGNORE_ARTIFACT_MAJOR_NAME);
const dependenciesToIgnorePrereleaseArtifact = (folder) =>
    path.resolve(summaryDirectory(folder), DEPENDENCIES_TO_IGNORE_ARTIFACT_PRERELEASE_NAME);

module.exports = {
    summaryDirectory,
    dependenciesToUpdateArtifact,
    dependencyVersionsDiffArtifact,
    dependenciesToIgnoreArtifact,
    dependenciesToIgnoreMajorArtifact,
    dependenciesToIgnorePrereleaseArtifact,
};
