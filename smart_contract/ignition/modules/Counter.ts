import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const CounterModule = buildModule("CounterModule", (m) => {

const counter = m.contract("Counter", [
    m.getAccount(0) // admin initial
  ]);

return { counter };

});

export default CounterModule;
