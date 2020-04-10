module.exports = {
    module: {
        rules: [
            {
                test: /\.jsx?$/,
                exclude: /node_modules/,
                loader: 'babel-loader',
                options: {
                    presets: [
                        [
                            '@babel/env', {
                                targets: {
                                    browsers: [
                                        'last 2 Chrome versions'
                                    ],
                                    node: 'current'
                                }
                            }
                        ],
                        '@babel/react'
                    ],
                    plugins: []
                }
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader']
            }
        ]
    }
}