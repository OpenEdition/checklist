const path = require("path");

const jsRule = {
  test: /\.js$/,
  exclude: [/node_modules/],
  use: [{
    loader: "babel-loader",
    options: { presets: ["es2015"] }
  }],
};

const cssRule = {
  test: /\.css$/,
  use: ["style-loader", "css-loader"],
};

module.exports = [
  {
    context: path.resolve(__dirname, "./src"),
    entry: {
      app: "./main.js",
    },
    output: {
      path: path.resolve(__dirname, "./dist"),
      filename: "checklist.js"
    },
    module: {
      rules: [jsRule, cssRule],
    }
  },
  {
    context: path.resolve(__dirname, "./test/src"),
    entry: {
      app: "./main.js",
    },
    output: {
      path: path.resolve(__dirname, "./test/dist"),
      filename: "tests.js"
    },
    module: {
      rules: [jsRule],
    }
  }
];
