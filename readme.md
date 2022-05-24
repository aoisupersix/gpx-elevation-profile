[![CI](https://github.com/aoisupersix/gpx-elevation-profile/actions/workflows/ci.yml/badge.svg)](https://github.com/aoisupersix/gpx-elevation-profile/actions/workflows/ci.yml)
[![Coverage Status](https://coveralls.io/repos/github/aoisupersix/gpx-elevation-profile/badge.svg?branch=master)](https://coveralls.io/github/aoisupersix/gpx-elevation-profile?branch=master)

# gpx-elevation-profile

![](./docs/assets/demo.gif)

[日本語版 Readme はこちら](./docs/readme-ja.md)

A web application that generates color-coded elevation profiles from GPX files according to gradient.

All processing is done client-side (on the browser), so the GPX file is never uploaded to the server.

The application is under development and destructive changes, etc. will be made without notice. Use at your own risk.

## Requirement

All major browsers except IE.

## Application

https://aoisupersix.github.io/gpx-elevation-profile/

## Feature

- Generate elevation graph from GPX file
- Change the distance at which the average slope is calculated
- Changing the background color of the graph
- Setting the color to be painted for each average slope

## Development

```sh
npm install
npm run start # Start development server
npm run build # Build for production
```

## Roadmap

- i18n
- Responsive support

## License

This project is licensed under the MIT License - see the [license](./license) file for details
