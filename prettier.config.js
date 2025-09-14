import baseConfig from "@mcous/prettier-config";

export default {
  ...baseConfig,
  plugins: ["prettier-plugin-jsdoc"],
  tsdoc: true,
  semi: true,
  singleQuote: false,
  trailingComma: "es5",
};
