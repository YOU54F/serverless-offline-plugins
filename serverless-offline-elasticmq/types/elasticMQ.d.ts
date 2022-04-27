export interface ElasticMQLocalOptions {
  installPath?: string
  downloadUrl?: string
  verbose?: boolean
  detached?: boolean
  configFile?: string
  start?: boolean
}


export interface ElasticMQLaunchOptions {
  port?: number | string | null;
}


export interface ElasticMQConfig {
  stages?: string[];
  start: ElasticMQStartConfig;
}

interface ElasticMQStartConfig extends ElasticMQLaunchOptions {
  noStart?: boolean | null;
}
