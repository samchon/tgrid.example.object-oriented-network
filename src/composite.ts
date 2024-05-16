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
  public constructor(
    config: ICalcConfig,
    listener: Driver<ICalcEventListener>,
    public readonly scientific: Driver<IScientificCalculator>,
    public readonly statistics: Driver<IStatisticsCalculator>,
  ) {
    super(config, listener);
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
  const header: ICalcConfig = await server.getHeader();
  const listener: Driver<ICalcEventListener> = server.getDriver();

  // constructor provider combining with remote worker-servers
  const provider: CompositeCalculator = new CompositeCalculator(
    header,
    listener,
    await connect(header, listener, `${__dirname}/scientific.${EXTENSION}`),
    await connect(header, listener, `${__dirname}/statistics.${EXTENSION}`),
  );
  await server.open(provider);
};
main().catch((exp) => {
  console.error(exp);
  process.exit(-1);
});
