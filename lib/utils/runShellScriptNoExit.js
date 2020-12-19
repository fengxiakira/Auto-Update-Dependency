const shelljs = require('shelljs');

const runShellScriptNoExit = (script, errMsg) => {
    console.log('Executing shell:');
    console.log(script);

    console.time('-----');
    let { code } = shelljs.exec(script);
    if (code !== 0) {
        console.log(errMsg);
    }
    console.timeEnd('-----');
    return code;
};

module.exports = runShellScriptNoExit;
