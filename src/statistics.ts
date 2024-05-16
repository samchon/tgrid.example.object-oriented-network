import { Driver, WorkerServer } from "tgrid";

import { ICalcConfig } from "./interfaces/ICalcConfig";
import { ICalcEventListener } from "./interfaces/ICalcEventListener";
import { StatisticsCalculator } from "./providers/StatisticsCalculator";

const main = async () => {
  const server: WorkerServer<
    ICalcConfig,
    StatisticsCalculator,
    ICalcEventListener
  > = new WorkerServer();

  const header: ICalcConfig = await server.getHeader();
  const listener: Driver<ICalcEventListener> = server.getDriver();
  const provider: StatisticsCalculator = new StatisticsCalculator(
    header,
    listener,
  );
  await server.open(provider);
};
main().catch((exp) => {
  console.error(exp);
  process.exit(-1);
});
