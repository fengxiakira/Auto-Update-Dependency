#!/usr/bin/env node

const commandArgv = require('yargs/yargs')(process.argv.slice(2)).options({
    configFile: {
        demandOption: true,
        default: '/config.js',
        describe: 'The config file path',
        type: 'string',
    },
    unitTest: { alias: 't', default: true, type: 'boolean' },
    componentTest: { alias: 'c', default: true, type: 'boolean' },
    SSH: {demandOption: true, default : false, type : 'boolean'},
    HTTPS: {demandOption: true, default : false, type : 'boolean'},
}).argv;

module.exports = { commandArgv };
