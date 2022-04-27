import { ChildProcess, spawn } from "child_process";
import { join } from "path";
import Serverless from "serverless";
import { promises as fs } from "fs";
import { ServerlessPluginCommand } from "../types/serverless-plugin-command";
import { ElasticMQLaunchOptions, ElasticMQConfig } from "../types/elasticMQ";
import internal from "stream";
import { chunksToLinesAsync } from "@rauschma/stringio";

const MQ_LOCAL_PATH = join(__dirname, "../bin");

class ServerlessOfflineElasticMqPlugin {
  public readonly commands: Record<string, ServerlessPluginCommand>;
  public readonly hooks: Record<string, () => Promise<any>>;
  private elasticMqConfig: ElasticMQConfig;
  private mqInstances: Record<string, ChildProcess> = {};

  public constructor(private serverless: Serverless) {
    this.commands = {};

    this.elasticMqConfig = this.serverless.service?.custom?.elasticmq || {};

    this.hooks = {
      "before:offline:start:end": this.stopElasticMq,
      "before:offline:start": this.startElasticMq,
      "before:offline:start:init": this.startElasticMq,
    };
  }

  private spawnElasticMqProcess = async (options: ElasticMQLaunchOptions) => {
    // We are trying to construct something like this:
    // java -jar bin/elasticmq-server-0.15.7.jar

    const port = (options.port || 9324).toString();

    const args = [];

    const confFile = `
    include classpath("application.conf")

// What is the outside visible address of this ElasticMQ node
// Used to create the queue URL (may be different from bind address!)
node-address {
    protocol = http
    host = localhost
    port = ${port}
    context-path = ""
}

rest-sqs {
    enabled = true
    bind-port = ${port}
    bind-hostname = "0.0.0.0"
    // Possible values: relaxed, strict
    sqs-limits = strict
}

// Should the node-address be generated from the bind port/hostname
// Set this to true e.g. when assigning port automatically by using port 0.
generate-node-address = false

queues {
    // See next section
}

// Region and accountId which will be included in resource ids
aws {
    region = us-west-2
    accountId = 000000000000
}
`;
    await fs.writeFile(`${MQ_LOCAL_PATH}/custom.conf`, confFile);

    args.push(
      "-jar",
      "-Dconfig.file=custom.conf",
      "elasticmq-server-0.15.7.jar",
    );

    const proc = spawn("java", args, {
      cwd: MQ_LOCAL_PATH,
      env: process.env,
    });

    const startupLog: string[] = [];
    const started = await this.waitForStart(proc.stdout, startupLog);

    if (proc.pid == null || !started) {
      throw new Error("Unable to start the Pact Local process");
    }
    proc.stdout.on("data", (data) => {
      this.serverless.cli.log(`ElasticMq Offline: ${data.toString()}`);
    });

    proc.on("error", (error) => {
      this.serverless.cli.log(`ElasticMq Offline error: ${error.toString()}`);
      throw error;
    });

    this.mqInstances[port] = proc;

    (([
      "beforeExit",
      "exit",
      "SIGINT",
      "SIGTERM",
      "SIGUSR1",
      "SIGUSR2",
      "uncaughtException",
    ] as unknown) as NodeJS.Signals[]).forEach((eventType) => {
      process.on(eventType, () => {
        this.killElasticMqProcess(this.elasticMqConfig.start);
      });
    });

    return { proc, port, startupLog };
  };

  private waitForStart = async (
    readable: internal.Readable,
    startupLog: string[],
  ) => {
    let started = false;
    for await (const line of chunksToLinesAsync(readable)) {
      startupLog.push(line);
      this.serverless.cli.log(line);
      if (line.includes("ElasticMQ server (0.15.7) started")) {
        return (started = true);
      }
    }
    return started;
  };

  private killElasticMqProcess = (options: ElasticMQLaunchOptions) => {
    const port = (options.port || 9324).toString();

    if (this.mqInstances[port] != null) {
      this.mqInstances[port].kill("SIGKILL");
      delete this.mqInstances[port];
    }
  };

  private shouldExecute = () => {
    if (
      this.elasticMqConfig.stages &&
      this.elasticMqConfig.stages.includes(
        this.serverless.service.provider.stage,
      )
    ) {
      return true;
    }
    return false;
  };

  private startElasticMq = async () => {
    if (this.elasticMqConfig.start.noStart || !this.shouldExecute()) {
      this.serverless.cli.log(
        "ElasticMq Offline - [noStart] options is true. Will not start.",
      );
      return;
    }

    const { port, proc } = await this.spawnElasticMqProcess(
      this.elasticMqConfig.start,
    );

    this.serverless.cli.log(
      `ElasticMq Offline - Started, curl http://0.0.0.0:${port} -d {}`,
    );

    await Promise.resolve(proc.pid);
  };

  private stopElasticMq = async () => {
    this.killElasticMqProcess(this.elasticMqConfig.start);
    this.serverless.cli.log("ElasticMq Process - Stopped");
  };
}

export = ServerlessOfflineElasticMqPlugin;
