# serverless-offline-elasticmq-localhost

Serverless Framework Plugin to download and run an elasticMQ server to use with AWS SQS plugins

Original code from YOU54F (https://github.com/YOU54F/serverless-offline-plugins/tree/main/serverless-offline-elasticmq)

This repository allows to self define the version of elasticmq without requiring a new version of the package.

## Installation

To install with npm, run this in your service directory:

```bash
npm install --save-dev serverless-offline-elasticmq-localhost
```

Then add this to your `serverless.yml`

```yml
plugins:
  - serverless-offline-elasticmq-localhost
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
    # Set the version of ElasticMq you want to use
    version: 1.5.4
    # If you only want to use elasticmq Offline in some stages, declare them here
    stages:
      - dev
    start:
      port: 9432 # The port number that elasticmq uses to communicate with your application. If you don't specify this option, the default port is 9432. If port 8000 is unavailable, this command throws an exception. You can use the port option to specify a different port number
      noStart: false # Does not start elasticmq. This option is useful if you already have a running instance of elasticmq locally
```
