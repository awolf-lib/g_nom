module.exports = {
  reactScriptsVersion: "react-scripts" /* (default value) */,
  typescript: {
    enableTypeChecking: true /* (default value)  */,
  },
  webpack: {
    configure: {
      resolve: {
        fallback: {
          zlib: require.resolve("browserify-zlib"),
          buffer: require.resolve("buffer/"),
          url: require.resolve("url/"),
          stream: require.resolve("stream-browserify"),
          path: require.resolve("path-browserify"),
          os: require.resolve("os-browserify/browser"),
          http: require.resolve("stream-http"),
          assert: require.resolve("assert/"),
          fs: false,
        },
      },
    },
  },
};
