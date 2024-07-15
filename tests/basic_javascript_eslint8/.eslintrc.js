module.exports = {
  "root": true, // Tell eslint to not look for config file up the hierarchy
  "extends": [
    // "eslint:recommended",
    // "plugin:@typescript-eslint/recommended"
  ],
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "EXPERIMENTAL_useProjectService": true
  },
  "plugins": [
    // "@typescript-eslint",
    "eslint-plugin-safety-web"
  ],
  "rules": {
    "safety-web/trusted-types-checks": "error"
  }
};
