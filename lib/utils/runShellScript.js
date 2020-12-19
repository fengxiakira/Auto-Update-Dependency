const runShellScriptNoExit = require('./runShellScriptNoExit');

const runShellScript = (script) => {
    let code = runShellScriptNoExit(script);
    if (code !== 0) {
        console.error(`Non zero exit code [${code}]`);
        process.exit(code);
    }
};

module.exports = runShellScript;
