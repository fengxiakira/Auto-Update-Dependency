const prompt = require('prompt-sync')();
const userName = prompt('What is your GitHub user name?');

const updatesSuccess = (folderName) => `- The project received updates: ${folderName}\n`;
const updatesFailed = (folderName) => `- The project has no dependencies eligible to be automatically updated: ${folderName}\n`;


module.exports = { userName, updatesSuccess, updatesFailed};

