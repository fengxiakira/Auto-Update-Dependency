const dependenciesItem = ({ packageName, updateByVersion = 'minor', ignore = false }) => ({
    packageName,
    updateByVersion,
    ignore,
});

// NEED TO BE DEFINED BY YOU
const packageInfo = [{ packageName: 'package1' }];

const dependencies = packageInfo.map((element) => dependenciesItem(element));

const config = {
    dependencies: dependencies,
    projectsToUpdate: [{ name: 'package2'}],
};

module.exports = { config };
