# serverless-offline-ses

![David](https://img.shields.io/david/YOU54F/serverless-offline-ses.svg)
![GitHub code size in bytes](https://img.shields.io/github/languages/code-size/YOU54F/serverless-offline-ses.svg)
![GitHub repo size](https://img.shields.io/github/repo-size/YOU54F/serverless-offline-ses.svg)
![npm](https://img.shields.io/npm/dw/serverless-offline-ses.svg)
![npm](https://img.shields.io/npm/dm/serverless-offline-ses.svg)
![npm](https://img.shields.io/npm/dy/serverless-offline-ses.svg)
![npm](https://img.shields.io/npm/dt/serverless-offline-ses.svg)
![NPM](https://img.shields.io/npm/l/serverless-offline-ses.svg)
![npm](https://img.shields.io/npm/v/serverless-offline-ses.svg)
![GitHub last commit](https://img.shields.io/github/last-commit/YOU54F/serverless-offline-ses.svg)
![npm collaborators](https://img.shields.io/npm/collaborators/serverless-offline-ses.svg)

Serverless plugin to create local Amazon Simple Email Service Server for consuming requests sent by the API

It is a wrapper around [aws-ses-local](https://github.com/csi-lk/aws-ses-local)

## Installation

To install with npm, run this in your service directory:

```bash
npm install --save-dev serverless-offline-ses
```

or yarn

```bash
yarn add serverless-offline-ses --dev
```

Then add this to your `serverless.yml`

```yml
plugins:
  - serverless-offline-ses
```

## Usage

To use `serverless-offline-ses`, add it to the plugins section of your `serverless.yml`:

```yml
plugins:
  - serverless-offline-ses

custom:
  ses:
    stages:
      - local
```

## Options

To configure custom options, add a `ses` section like this to your `serverless.yml`:

```yml
custom:
  ses:
    stages:
      - local
    port: 9001
    outputDir: "./output"
    clean: true
```

| Option        | Default    | Description                                  |
| ------------- | ---------- | -------------------------------------------- |
| `--outputDir` | `./output` | Specify output directory                     |
| `--port`      | `9001`     | Specify port for server to run on            |
| `--clean`     | none       | Clean output directory (delete all contents) |
