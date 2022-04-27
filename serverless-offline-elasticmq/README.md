# serverless-offline-elasticmq

![David](https://img.shields.io/david/YOU54F/serverless-offline-elasticmq.svg)
![GitHub code size in bytes](https://img.shields.io/github/languages/code-size/YOU54F/serverless-offline-elasticmq.svg)
![GitHub repo size](https://img.shields.io/github/repo-size/YOU54F/serverless-offline-elasticmq.svg)
![npm](https://img.shields.io/npm/dw/serverless-offline-elasticmq.svg)
![npm](https://img.shields.io/npm/dm/serverless-offline-elasticmq.svg)
![npm](https://img.shields.io/npm/dy/serverless-offline-elasticmq.svg)
![npm](https://img.shields.io/npm/dt/serverless-offline-elasticmq.svg)
![NPM](https://img.shields.io/npm/l/serverless-offline-elasticmq.svg)
![npm](https://img.shields.io/npm/v/serverless-offline-elasticmq.svg)
![GitHub last commit](https://img.shields.io/github/last-commit/YOU54F/serverless-offline-elasticmq.svg)
![npm collaborators](https://img.shields.io/npm/collaborators/serverless-offline-elasticmq.svg)

Serverless Framework Plugin to download and run an elasticMQ server to use with AWS SQS plugins

## Installation

To install with npm, run this in your service directory:

```bash
npm install --save-dev serverless-offline-elasticmq
```

Then add this to your `serverless.yml`

```yml
plugins:
  - serverless-offline-elasticmq
```

> Important:
> To run ElasticMQ on your computer, you must have the Java Runtime Environment
> (JRE) version 6.x or newer. The application doesn't run on earlier JRE versions.

## How it works

The plugin downloads the official ElasticMQ standalone jar on Your
Computer and allows the serverless app to launch it.

## Configuration

To configure ElasticMQ Offline, add a `elasticmq` section like this to your
`serverless.yml`:

```yml
custom:
  elasticmq:
    # If you only want to use elasticmq Offline in some stages, declare them here
    stages:
      - dev
    start:
      port: 9432 # The port number that elasticmq uses to communicate with your application. If you don't specify this option, the default port is 9432. If port 8000 is unavailable, this command throws an exception. You can use the port option to specify a different port number
      noStart: false # Does not start elasticmq. This option is useful if you already have a running instance of elasticmq locally
```
