const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

// ===== ANSI Colors =====
const c = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",
  bgGreen: "\x1b[42m",
  bgRed: "\x1b[41m",
  black: "\x1b[30m",
};

const PASS = `${c.bgGreen}${c.black}${c.bold} PASS ${c.reset}`;
const FAIL = `${c.bgRed}${c.white}${c.bold} FAIL ${c.reset}`;

// ===== Parse CLI args =====
const args = process.argv.slice(2);
const filterIdx = args.indexOf("--filter");
const filter = filterIdx !== -1 ? args[filterIdx + 1] : null;

// ===== Run dotnet test =====
const resultsDir = path.join(__dirname, "MusicStreaming.Tests", "TestResults");
const trxFile = path.join(resultsDir, "results.trx");

// Clean old results
if (fs.existsSync(resultsDir)) {
  fs.rmSync(resultsDir, { recursive: true });
}

console.log(`${c.dim}Running dotnet test...${filter ? ` (filter: ${filter})` : ""}${c.reset}\n`);

let exitCode = 0;
const filterArg = filter ? ` --filter "FullyQualifiedName~${filter}"` : "";
try {
  execSync(
    `dotnet test MusicStreaming.Tests --logger "trx;LogFileName=results.trx" --results-directory "${resultsDir}" --verbosity quiet${filterArg}`,
    { stdio: "pipe", cwd: __dirname }
  );
} catch (e) {
  exitCode = e.status || 1;
}

// ===== Parse TRX =====
if (!fs.existsSync(trxFile)) {
  console.log(`${c.red}No test results found at ${trxFile}${c.reset}`);
  process.exit(1);
}

const xml = fs.readFileSync(trxFile, "utf-8");

// Parse test results from TRX XML
const results = [];
const testRegex = /<UnitTestResult\s[^>]*?\/?>[\s\S]*?(?:<\/UnitTestResult>|(?=<UnitTestResult\s)|$)/g;
let match;

while ((match = testRegex.exec(xml)) !== null) {
  const block = match[0];

  const nameMatch = block.match(/testName="([^"]*)"/);
  const outcomeMatch = block.match(/outcome="([^"]*)"/);
  const durationMatch = block.match(/duration="([^"]*)"/);

  if (!nameMatch || !outcomeMatch) continue;

  const fullName = nameMatch[1];
  const outcome = outcomeMatch[1];
  const duration = durationMatch ? durationMatch[1] : "00:00:00.000";

  // Extract error message if test failed
  let errorMessage = "";
  if (outcome === "Failed") {
    const msgMatch = block.match(/<Message>([\s\S]*?)<\/Message>/);
    if (msgMatch) {
      errorMessage = msgMatch[1]
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&amp;/g, "&")
        .replace(/&#xD;/g, "")
        .replace(/&#xA;/g, "\n");
    }
  }

  // Parse duration to ms
  const timeParts = duration.split(/[:.]/).map(Number);
  let ms = 0;
  if (timeParts.length >= 4) {
    ms =
      timeParts[0] * 3600000 +
      timeParts[1] * 60000 +
      timeParts[2] * 1000 +
      Math.round(timeParts[3] / 10000);
  }

  results.push({
    fullName,
    className: fullName.split(".").slice(0, -1).join("."),
    testName: fullName.split(".").pop(),
    outcome,
    ms,
    errorMessage,
  });
}

// ===== Group by class =====
const groups = {};
for (const r of results) {
  if (!groups[r.className]) groups[r.className] = [];
  groups[r.className].push(r);
}

// ===== Display =====
let totalPassed = 0;
let totalFailed = 0;
let totalTime = 0;

for (const [className, tests] of Object.entries(groups)) {
  const hasFailed = tests.some((t) => t.outcome === "Failed");
  const badge = hasFailed ? FAIL : PASS;
  const shortName = className.split(".").pop();
  const filePath = `${c.dim}${className}${c.reset}`;

  console.log(`${badge} ${c.bold}${shortName}${c.reset}`);

  for (const t of tests) {
    totalTime += t.ms;
    const timeStr =
      t.ms > 0 ? ` ${c.dim}(${t.ms} ms)${c.reset}` : "";
    // Nếu testName có chứa dấu cách thì dùng trực tiếp (DisplayName)
    // Nếu không thì convert PascalCase sang readable
    const displayName = t.testName.includes(" ")
      ? t.testName
      : t.testName.replace(/_/g, " → ").replace(/([a-z])([A-Z])/g, "$1 $2");

    if (t.outcome === "Passed") {
      totalPassed++;
      console.log(`  ${c.green}✓${c.reset} ${c.dim}${displayName}${c.reset}${timeStr}`);
    } else {
      totalFailed++;
      console.log(`  ${c.red}✕ ${displayName}${c.reset}${timeStr}`);
      if (t.errorMessage) {
        const lines = t.errorMessage.trim().split("\n");
        for (const line of lines.slice(0, 5)) {
          console.log(`    ${c.red}${line.trim()}${c.reset}`);
        }
      }
    }
  }

  console.log("");
}

// ===== Summary =====
const suiteCount = Object.keys(groups).length;
const failedSuites = Object.values(groups).filter((tests) =>
  tests.some((t) => t.outcome === "Failed")
).length;
const passedSuites = suiteCount - failedSuites;

console.log(`${c.bold}Test Suites:${c.reset} ${failedSuites > 0 ? `${c.red}${failedSuites} failed${c.reset}, ` : ""}${c.green}${passedSuites} passed${c.reset}, ${suiteCount} total`);
console.log(`${c.bold}Tests:      ${c.reset} ${totalFailed > 0 ? `${c.red}${totalFailed} failed${c.reset}, ` : ""}${c.green}${totalPassed} passed${c.reset}, ${totalPassed + totalFailed} total`);
console.log(`${c.bold}Time:       ${c.reset} ${(totalTime / 1000).toFixed(3)} s`);

process.exit(totalFailed > 0 ? 1 : 0);
