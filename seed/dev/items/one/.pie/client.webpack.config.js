 
  //auto generated on: Mon Apr 03 2017 21:06:33 GMT+0100 (IST)
  
  module.exports = {
  "module": {
    "rules": [
      {
        "test": /\.css$/,
        "use": [
          "style-loader",
          "css-loader"
        ]
      },
      {
        "test": /\.less$/,
        "use": [
          "style-loader",
          "css-loader",
          "less-loader"
        ]
      },
      {
        "test": /\.(jsx)?$/,
        "use": [
          {
            "loader": "babel-loader",
            "options": {
              "babelrc": false,
              "presets": [
                "/mnt/biggie-one/dev/github/PieLabs/pie-cli/node_modules/babel-preset-react/lib/index.js"
              ]
            }
          }
        ]
      }
    ]
  },
  "resolveLoader": {
    "modules": [
      "/mnt/biggie-one/dev/github/PieLabs/pie-store-demo/seed/dev/items/one/.pie/node_modules",
      "node_modules",
      "/mnt/biggie-one/dev/github/PieLabs/pie-cli/node_modules",
      "/mnt/biggie-one/dev/github/PieLabs/pie-cli/node_modules/pie-support-base/node_modules",
      "/mnt/biggie-one/dev/github/PieLabs/pie-cli/node_modules/pie-support-less/node_modules"
    ]
  },
  "context": "/mnt/biggie-one/dev/github/PieLabs/pie-store-demo/seed/dev/items/one/.pie",
  "entry": "./client.entry.js",
  "output": {
    "filename": "pie-view.js",
    "path": "/mnt/biggie-one/dev/github/PieLabs/pie-store-demo/seed/dev/items/one"
  },
  "resolve": {
    "extensions": [
      ".js",
      ".jsx"
    ],
    "modules": [
      "/mnt/biggie-one/dev/github/PieLabs/pie-store-demo/seed/dev/items/one/.pie/.configure/node_modules",
      "/mnt/biggie-one/dev/github/PieLabs/pie-store-demo/seed/dev/items/one/.pie/.controllers/node_modules",
      "/mnt/biggie-one/dev/github/PieLabs/pie-store-demo/seed/dev/items/one/.pie/node_modules",
      "node_modules",
      "/mnt/biggie-one/dev/github/PieLabs/pie-cli/node_modules",
      "/mnt/biggie-one/dev/github/PieLabs/pie-cli/node_modules/pie-support-base/node_modules",
      "/mnt/biggie-one/dev/github/PieLabs/pie-cli/node_modules/pie-support-less/node_modules"
    ]
  }
};
  