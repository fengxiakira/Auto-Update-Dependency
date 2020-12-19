const dependenciesItem = ({ packageName, updateByVersion = 'minor', ignore = false }) => ({
    packageName,
    updateByVersion,
    ignore,
});

const packageInfo = [{ packageName: 'aws-sdk' }, { packageName: 'prettier' }];

const dependencies = packageInfo.map((element) => dependenciesItem(element));

const config = {
    dependencies: dependencies,
    projectsToUpdate: [{ name: 'emaily' }],
};

module.exports = { config };
