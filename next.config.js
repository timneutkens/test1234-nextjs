/** @type {import('next').NextConfig} */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable no-console */

const {
  NEXT_PUBLIC_SENTRY_DSN: SENTRY_DSN,
  SENTRY_ORG,
  SENTRY_PROJECT,
  SENTRY_AUTH_TOKEN,
  NODE_ENV,
  VERCEL_GIT_COMMIT_SHA: COMMIT_SHA,
} = process.env;

console.log(`building for ${process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT}`);

const basePath = "";

const nextConfiguration = {
  // swcMinify: true, // causing some weird errors for now, so we'll need to disable it
  distDir: process.env.BUILD_DIR || ".next",
  trailingSlash: false,
  productionBrowserSourceMaps:
    process.env.NEXT_PUBLIC_ENVIRONMENT !== "production",
  reactStrictMode: false,
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: false,
  },
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: false,
  },
  // Prefer loading of ES Modules over CommonJS
  // Enable after problems here are fixed https://github.com/vercel/next.js/discussions/27876
  experimental: {
    esmExternals: true,
    scrollRestoration: true,
    swcTraceProfiling: true,
    appDir: true,
    middlewarePrefetch: "flexible",
    // nextScriptWorkers: true,
  },
  transpilePackages: [
    "lightweight-charts",
    "fancy-canvas",
    "@7879-packages/api",
    "@7879-packages/ui",
    "@7879-packages/data",
  ],
  env: {
    // Make the COMMIT_SHA available to the client so that Sentry events can be
    // marked for the release they belong to. It may be undefined if running
    // outside of Vercel
    NEXT_PUBLIC_COMMIT_SHA: COMMIT_SHA,
  },
  webpack(config, options) {
    const { isServer, dev: isDevelopmentMode } = options;
    console.log("Building production", !isDevelopmentMode, {
      SENTRY_DSN,
      COMMIT_SHA,
      NODE_ENV,
    });
    // In `pages/_app.js`, Sentry is imported from @sentry/browser. While
    // @sentry/node will run in a Node.js environment. @sentry/node will use
    // Node.js-only APIs to catch even more unhandled exceptions.
    //
    // This works well when Next.js is SSRing your page on a server with
    // Node.js, but it is not what we want when your client-side bundle is being
    // executed by a browser.
    //
    // Luckily, Next.js will call this webpack function twice, once for the
    // server and once for the client. Read more:
    // https://nextjs.org/docs/api-reference/next.config.js/custom-webpack-config
    //
    // So ask Webpack to replace @sentry/node imports with @sentry/browser when
    // building the browser's bundle
    if (!isServer) {
      // config.optimization.mergeDuplicateChunks = true
      // config.optimization.splitChunks.cacheGroups = {
      //   ...config.optimization.splitChunks.cacheGroups,
      //   '@sentry': {
      //     test: /[\\/]node_modules[\\/](@sentry)[\\/]/,
      //     name: '@sentry',
      //     priority: 10,
      //     reuseExistingChunk: false,
      //   },
      // }
      config.resolve.alias["@sentry/node"] = "@sentry/browser/esm";
      // config.resolve.fallback = {
      //   ...config.resolve.fallback,
      //   fs: false,
      // }
      // https://docs.sentry.io/platforms/javascript/configuration/tree-shaking
      config.plugins.push(
        new options.webpack.DefinePlugin({
          __SENTRY_DEBUG__: false,
          __SENTRY_TRACING__: false,
        })
      );
      // config.plugins.push(
      //   new options.webpack.IgnorePlugin({
      //     checkResource(resource, context) {
      //       // If I am including something from my backend directory, I am sure that this shouldn't be included in my frontend bundle
      //       if (
      //         resource.includes('/server/') &&
      //         !context.includes('node_modules')
      //       ) {
      //         return true
      //       }
      //       return false
      //     },
      //   })
      // )
    }

    // Define an environment variable so source code can check whether or not
    // it's running on the server so we can correctly initialize Sentry
    config.plugins.push(
      new options.webpack.DefinePlugin({
        "process.env.NEXT_IS_SERVER": JSON.stringify(isServer.toString()),
      })
    );

    // When all the Sentry configuration env variables are available/configured
    // The Sentry webpack plugin gets pushed to the webpack plugins to build
    // and upload the source maps to sentry.
    // This is an alternative to manually uploading the source maps
    // Note: This is disabled in development mode.
    // if (
    //   SENTRY_DSN &&
    //   SENTRY_ORG &&
    //   SENTRY_PROJECT &&
    //   SENTRY_AUTH_TOKEN &&
    //   COMMIT_SHA &&
    //   NODE_ENV === 'production' &&
    //   process.env.BUILD_DIR !== '.pregen'
    // ) {
    //   config.plugins.push(
    //     new SentryWebpackPlugin({
    //       include: '.next',
    //       ignore: ['node_modules'],
    //       // stripPrefix: ['webpack://_N_E/'],
    //       // urlPrefix: `~${basePath}/_next`,
    //       release: COMMIT_SHA,
    //     })
    //   )
    // }

    // config.module.rules.push({
    //   test: /\.svg$/,
    //   use: [
    //     {
    //       loader: '@svgr/webpack',
    //       // https://react-svgr.com/docs/options/
    //     },
    //   ],
    // })

    // config.module.rules.push({
    //   test: /\.m?js/,
    //   resolve: {
    //     fullySpecified: false,
    //   },
    // })

    // config.module.rules.push({
    //   test: /\.po$/,
    //   use: [
    //     {
    //       loader: 'ignore-loader',
    //     },
    //   ],
    // })

    // Attempt to ignore storybook files when doing a production build,
    // see also: https://github.com/vercel/next.js/issues/1914
    if (!isDevelopmentMode) {
      config.module.rules.push({
        test: /\.stories.(js|tsx?)/,
        loader: "ignore-loader",
      });
    }

    // config.experiments = {
    //   ...config.experiments,
    //   topLevelAwait: true,
    //   layers: true,
    // }

    config.performance.hints = "warning";

    return config;
  },
  poweredByHeader: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.7879.io",
      },
      {
        protocol: "https",
        hostname: "7879.co",
      },
      {
        protocol: "https",
        hostname: "**.7879.co",
      },
      {
        protocol: "http",
        hostname: "localhost",
      },
    ],
    // minimumCacheTTL: 86400, // 1 day
    // minimumCacheTTL: 60, // 1 minute
    // minimumCacheTTL: 3600, // 1 hour
    // minimumCacheTTL: 86400, // 1 day
    minimumCacheTTL: 31536000, // 1 year
    formats: ["image/avif", "image/webp"], //Since AVIF is first, it will be served if the browser supports AVIF. If not, WebP will be served if the browser supports WebP. If neither format is supported, the original image format will be served.
    deviceSizes: [210, 420, 720, 1080, 1366, 1440, 1920, 2560, 3840],
  },
  async headers() {
    return [
      {
        source: "/.well-known/apple-app-site-association",
        headers: [
          {
            key: "Content-Type",
            value: "application/json",
          },
        ],
      },
      {
        source: "/:all*(svg|jpg|jpeg|png|otf|ico|webp)",
        locale: false,
        headers: [
          {
            key: "Cache-Control",
            // value: 'public, max-age=3600, stale-while-revalidate=300', // 1 hour 5 minutes
            value: "public, max-age=31536000, stale-while-revalidate=300", // 1 week
          },
        ],
      },
      //   //https://github.com/vercel/next.js/issues/19914
      // {
      //   // This doesn't work for 'Cache-Control' key (works for others though):
      //   source: '/_next/image(.*)',
      //   headers: [
      //     {
      //       key: 'Cache-Control',
      //       // Instead of this value:
      //       value:
      //         'public, max-age=180, s-maxage=180, stale-while-revalidate=180',
      //       // Cache-Control response header is `public, max-age=60` in production
      //       // and `public, max-age=0, must-revalidate` in development
      //     },
      //   ],
      // },
    ];
  },

  async redirects() {
    console.log({
      DISABLE_ACCOUNT: process.env.NEXT_PUBLIC_DISABLE_ACCOUNT,
      DISABLE_STORE: process.env.NEXT_PUBLIC_DISABLE_STORE,
    });
    let redirects = [
      //     // {
      //     //   source: '/me',
      //     //   has: [
      //     //     {
      //     //       type: 'header',
      //     //       key: 'User-Agent',
      //     //       value:
      //     //         '((?!Android|webOS|iPhone|iPod|BlackBerry|BB|PlayBook|IEMobile|Windows Phone|Kindle|Silk|Opera Mini).)*',
      //     //     },
      //     //   ],
      //     //   destination: '/me/orders',
      //     //   permanent: false,
      //     // },
      //     {
      //       source: '/signin',
      //       destination: '/auth',
      //       permanent: false,
      //     },
      //     {
      //       source: '/signup',
      //       destination: '/auth',
      //       permanent: false,
      //     },
      //     // {
      //     //   source: '/pricing',
      //     //   destination: '/learn/pricing',
      //     //   permanent: true,
      //     // },
      //     {
      //       source: '/shop/all',
      //       destination: '/shop',
      //       permanent: true,
      //     },
      //     {
      //       source: '/shop/all/charms',
      //       destination: '/shop/charms',
      //       permanent: true,
      //     },
      //     {
      //       source: '/shop/all/rings',
      //       destination: '/shop/rings',
      //       permanent: true,
      //     },
      //     {
      //       source: '/shop/all/necklace-chains',
      //       destination: '/shop/necklace-chains',
      //       permanent: true,
      //     },
      //     {
      //       source: '/shop/all/pendants',
      //       destination: '/shop/pendants',
      //       permanent: true,
      //     },
      //     {
      //       source: '/shop/all/earrings',
      //       destination: '/shop/earrings',
      //       permanent: true,
      //     },
      //     {
      //       source: '/shop/all/bracelet-chains',
      //       destination: '/shop/bracelet-chains',
      //       permanent: true,
      //     },
      //     {
      //       source: '/shop/all/cuffs',
      //       destination: '/shop/cuffs',
      //       permanent: true,
      //     },
      //     {
      //       source: '/shop/all/men',
      //       destination: '/shop?gender=men',
      //       permanent: true,
      //     },
      //     {
      //       source: '/shop/all/women',
      //       destination: '/shop?gender=women',
      //       permanent: true,
      //     },
      //     // {
      //     //   source: '/shop/men',
      //     //   destination: '/shop?gender=men',
      //     //   permanent: true,
      //     // },
      //     // {
      //     //   source: '/shop/women',
      //     //   destination: '/shop?gender=women',
      //     //   permanent: true,
      //     // },
      //     // {
      //     //   source: '/shop/men/:slug*',
      //     //   destination: '/shop/:slug*?gender=men', // This handles source URLs with existing query params
      //     //   permanent: true,
      //     // },
      //     // {
      //     //   source: '/shop/women/:slug*',
      //     //   destination: '/shop/:slug*?gender=women', // This handles source URLs with existing query params
      //     //   permanent: true,
      //     // },
      //     // {
      //     //   source: '/collections/all/shop-the-look',
      //     //   destination: '/collections/shop-the-look-220222',
      //     //   permanent: true,
      //     // },
      //     // {
      //     //   source: '/collections/faith-and-protection',
      //     //   destination: '/collections/faith',
      //     //   permanent: true,
      //     // },
      //     // {
      //     //   source: '/api/images-v/:slug*',
      //     //   destination: '/api/images/:slug*', // Matched parameters can be used in the destination
      //     //   permanent: true,
      //     // },
      {
        source: "/api/images-variant/:slug*",
        destination: "/api/images/:slug*", // Matched parameters can be used in the destination
        permanent: true,
      },
      //     // {
      //     //   source: '/api/images-product-secondary/:slug*',
      //     //   destination: '/api/images/:slug*', // Matched parameters can be used in the destination
      //     //   permanent: true,
      //     // },
      //     // {
      //     //   source: '/api/images-product/:slug*',
      //     //   destination: '/api/images/:slug*', // Matched parameters can be used in the destination
      //     //   permanent: true,
      //     // },
    ];

    return redirects;
  },
  async rewrites() {
    return [
      {
        source: "/sitemap.xml",
        destination: "/api/sitemap",
      },
      // {
      //   source: '/cdn/ga/:path*',
      //   destination: 'https://www.google-analytics.com/:path*',
      // },
      // {
      //   source: '/cdn/om/:path*',
      //   destination: 'https://cdn.ometria.com/:path*',
      // },
      // {
      //   source: '/cdn/om/:path*',
      //   destination: 'https://cdn.ometria.com/:path*',
      // },
      // {
      //   source: '/cdn/tp/:path*',
      //   destination: 'https://widget.trustpilot.com/:path*',
      // },
      // {
      //   source: '/cdn/termly/:path*',
      //   destination: 'https://app.termly.io/:path*',
      // },
      // {
      //   source: '/cdn/ga',
      //   has: [
      //     {
      //       type: 'query',
      //       key: 'url',
      //       value: '(?<url>.*)', // Named capture group to match anything on the value
      //     },
      //   ],
      //   destination: 'https://www.google-analytics.com/:url',
      // },
      // {
      //   source: '/cdn/:provider/:path',
      //   destination: 'https://:provider/:path',
      // },
      // // {
      // //   source: '/cdn',
      // //   has: [
      // //     {
      // //       type: 'query',
      // //       key: 'url',
      // //       value: '(?<url>.*)', // Named capture group to match anything on the value
      // //     },
      // //   ],
      // //   destination: 'https://:url',
      // // },
      // {
      //   source: '/cdn/:provider',
      //   has: [
      //     {
      //       type: 'query',
      //       key: 'url',
      //       value: '(?<url>.*)', // Named capture group to match anything on the value
      //     },
      //   ],
      //   destination: 'https://:provider:url',
      // },
    ];
  },
};

// const withTM = require('next-transpile-modules')([
//   'lightweight-charts',
//   'fancy-canvas',
//   '@7879-packages/api',
//   '@7879-packages/ui',
// ])

// module.exports = withTM(nextConfiguration)
module.exports = nextConfiguration;
