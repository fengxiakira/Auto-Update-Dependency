// This file is cooperated with others.
const asciiArt = require('ascii-art');

const logDependency = ({ moduleName, latest, installed, packageWanted, packageJson, bump }) => {
    const tableData = {
        'Depency Name': moduleName,
        'package.json version wanted': packageJson,
        'package-lock.json version wanted': packageWanted,
        'Version installed': installed,
        'Latest available version': latest,
        'Version update type': bump,
        ...(packageWanted !== installed && {
            'Installed dependency vs package-lock.json':
                'WARNING: package-lock.json version wanted does not match version installed',
        }),
    };

    const table = new asciiArt.Table();
    table.setHeading('Inspection', 'Result');
    Object.keys(tableData).forEach((key) => table.addRow(key, tableData[key]));
    console.log(table.write());
};

module.exports = logDependency;
