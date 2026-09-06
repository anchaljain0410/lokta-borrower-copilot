import { evaluate } from "../lib/engine/evaluate";
import { priya, ravi, anita } from "../lib/engine/personas";

for (const [name, p] of [["Priya", priya], ["Ravi", ravi], ["Anita", anita]] as const) {
  console.log(`\n=== ${name} ===`);
  console.log(JSON.stringify(evaluate(p), null, 2));
}
