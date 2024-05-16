import { Driver, WorkerConnector, WorkerServer } from "tgrid";

import { ICalcConfig } from "./interfaces/ICalcConfig";
import { ICalcEventListener } from "./interfaces/ICalcEventListener";
import { IScientificCalculator } from "./interfaces/IScientificCalculator";
import { IStatisticsCalculator } from "./interfaces/IStatisticsCalculator";
import { SimpleCalculator } from "./providers/SimpleCalculator";

const EXTENSION = __filename.endsWith(".ts") ? "ts" : "js";

/// `CompositeCalculator` has two additional properties
///
/// - `scientific` from remote worker server
/// - `statistics` from remote worker server
class CompositeCalculator extends SimpleCalculator {
  public readonly scientific: Driver<IScientificCalculator>;
  public readonly statistics: Driver<IStatisticsCalculator>;

  public constructor(props: {
    config: ICalcConfig;
    listener: Driver<ICalcEventListener>;
    scientific: Driver<IScientificCalculator>;
    statistics: Driver<IStatisticsCalculator>;
  }) {
    super(props.config, props.listener);
    this.scientific = props.scientific;
    this.statistics = props.statistics;
  }
}

/// connect to remote worker server
const connect = async <T extends object>(
  header: ICalcConfig,
  listener: Driver<ICalcEventListener>,
  file: string,
): Promise<Driver<T>> => {
  const connector: WorkerConnector<ICalcConfig, ICalcEventListener, T> =
    new WorkerConnector(header, listener, "process");
  await connector.connect(file);
  return connector.getDriver();
};

const main = async () => {
  const server: WorkerServer<
    ICalcConfig,
    CompositeCalculator,
    ICalcEventListener
  > = new WorkerServer();
  const config: ICalcConfig = await server.getHeader();
  const listener: Driver<ICalcEventListener> = server.getDriver();

  // constructor provider combining with remote worker-servers
  const provider: CompositeCalculator = new CompositeCalculator({
    config,
    listener,
    scientific: await connect<Driver<IScientificCalculator>>(
      config,
      listener,
      `${__dirname}/scientific.${EXTENSION}`,
    ),
    statistics: await connect<Driver<IStatisticsCalculator>>(
      config,
      listener,
      `${__dirname}/statistics.${EXTENSION}`,
    ),
  });
  await server.open(provider);
};
main().catch((exp) => {
  console.error(exp);
  process.exit(-1);
});
