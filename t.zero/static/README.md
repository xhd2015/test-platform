# About


# Use Nodejs module
```bash
npm install webpack-cli webpack -g  # install webpack-cli first
# or:
# npm install webpack-cli webpack --save-dev 

npx webpack --help  # show help message

G=`npm root -g`  # node modules root
npx webpack --entry "$G/json-bigint/index.js" -o json-bigint

# get the output file
mv json-bigint/main.js json-bigint.js
rmdir json-bigint


```
