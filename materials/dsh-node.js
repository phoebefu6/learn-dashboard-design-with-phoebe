// Node runner: loads assets/dsh-daily.js and assets/dsh-live.js exactly as the browser does and
// prints the canon as JSON. Compare with: python3 materials/dsh-reference.py --json <repo>
const fs = require("fs"), path = require("path"), vm = require("vm");
const repo = path.resolve(process.argv[2] || path.join(__dirname, ".."));
const ctx = { window: {} }; ctx.window.window = ctx.window;
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(repo, "assets/dsh-daily.js"), "utf8"), ctx);
const api = require(path.join(repo, "assets/dsh-live.js"));
if (!api.selfTest()) { process.stderr.write("selfTest failed\n"); process.exit(2); }
process.stdout.write(JSON.stringify(api.canon(ctx.window.DSH_DAILY)));
