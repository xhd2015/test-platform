const path = require("path")
module.exports = {
    "transpileDependencies": [
        "vuetify"
    ],
    outputDir: "dist",
    pages: {
        index: {  // all options are passed to html-webpack-plugin
            entry: "index.js", // entry js
            template: "public/index.html", // entry template, 
        }
    },
    // publicPath:path.join(__dirname,"dist"), // refer to static root, the default is "/", which is not suitable in the context of electron. By setting the publicPath, vue-route gets correctly trimmed
    // event when  document.location.hostname === ""
    // publicPath: process.env.PUBLIC_PATH, // "/static"
}