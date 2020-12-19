const path = require('path');

const PROJECT_TO_UPDATE_FOLDER = '../../projects-to-update';
const ROOT_DIRECTORY = '../..';
const projectToUpdateDirectory = path.resolve(__dirname, PROJECT_TO_UPDATE_FOLDER);
const rootDirectory = path.resolve(__dirname, ROOT_DIRECTORY);
const projectDirectory = (folderName) => path.resolve(projectToUpdateDirectory, folderName);
const GIT_IGNORE = '.gitignore';
const gitIgnoreFile = (folderName) => path.resolve(projectDirectory(folderName), GIT_IGNORE);

module.exports = { projectToUpdateDirectory, rootDirectory, gitIgnoreFile };
