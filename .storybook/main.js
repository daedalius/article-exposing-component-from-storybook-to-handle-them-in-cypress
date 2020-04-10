const myWebpackConfig = require('../webpack.config.js');

module.exports = {
    stories: ['../src/components/**/*.stories.js'],
    webpackFinal: (storybookWebpackConfig) => {
        return {
            ...storybookWebpackConfig,
            ...myWebpackConfig,
            module: {
                ...storybookWebpackConfig.module,
                rules: storybookWebpackConfig.module.rules
            }
        };
    },
};
