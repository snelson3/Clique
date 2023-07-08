const path = require("path");

module.exports = {
    mode: "production",
    entry: path.resolve(__dirname, "./src/index.ts"),
    module: {
        rules: [{ test: /\.ts?$/, use: "ts-loader", exclude: /(node_modules|public)/ }],
    },
    resolve: {
        extensions: [".ts", ".js"],
        modules: ['src', 'node_modules']
    },
    output: {
        filename: "clique.js",
        path: path.resolve(__dirname, "public", "script"),
    },
    optimization: {
        minimize: false,
    },
};
