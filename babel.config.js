module.exports = function (api) {
    api.cache(false);
    return {
        'presets': [
            [
                '@babel/preset-env',
                {
                    'targets': {
                        'node': 'current'
                    }
                }
            ]
        ],
        'plugins': [
            [
                '@babel/plugin-proposal-decorators',
                {
                    'legacy': true
                }
            ],
            [
                '@babel/plugin-proposal-class-properties'
            ]
        ]
    };
};
