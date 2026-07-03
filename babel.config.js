module.exports = {
  presets: ['@babel/preset-env', '@babel/preset-typescript'],
  plugins: ['@babel/plugin-transform-runtime'],
  // Enable the JSX transform only for .jsx/.tsx so that generic arrow
  // functions (e.g. `<T>(...)`) in plain .ts files are not misparsed as JSX.
  overrides: [
    {
      test: /\.(jsx|tsx)$/,
      presets: ['@babel/preset-react'],
    },
  ],
}
