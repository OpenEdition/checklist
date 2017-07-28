const path = require("path");
const LessPluginAutoPrefix = require("less-plugin-autoprefix");

const jsRule = {
  test: /\.js$/,
  exclude: [/node_modules/],
  use: [{
    loader: "babel-loader",
    options: { presets: ["es2015"] }
  }],
};

const lessRule = {
  test: /\.less$/,
  use: [
    "style-loader",
    "css-loader",
    {
      loader: "less-loader",
      options: {
        plugins: [
          // See .browserslistrc
          new LessPluginAutoPrefix()
        ]
      }
    }
  ],
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
      rules: [jsRule, lessRule],
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
