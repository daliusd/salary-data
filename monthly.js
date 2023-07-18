const util = require("util");
const exec = util.promisify(require("child_process").exec);
const path = require("path");
const fs = require("fs");
const os = require("os");

async function main() {
  if (process.argv.length < 3) {
    console.log(
      "node monthly.js working_directory [year] [month, numbering starts from 1]",
    );
    return;
  }
  let workDir = process.argv[2];
  let tempDir = fs.mkdtempSync(os.tmpdir() + "/");

  let year;
  let month;
  if (process.argv.length > 3) {
    year = parseInt(process.argv[3], 10);
    month = parseInt(process.argv[4], 10) - 1;
  } else {
    let current = new Date();
    current.setMonth(current.getMonth() - 2);

    year = current.getFullYear();
    month = current.getMonth();
  }

  let dataUrl = `https://atvira.sodra.lt/imones/downloads/${year}/monthly-${year}.json.zip`;
  let dataZipFilename = path.join(tempDir, `monthly-${year}.json.zip`);

  // Get averages
  const curlResult = await exec(`curl -k -o ${dataZipFilename} ${dataUrl}`);
  if (curlResult.stdout) {
    console.error(`Error downloading data: ${curlResult.stdout}`);
    return;
  }

  const unzipResult = await exec(`unzip -o ${dataZipFilename} -d ${tempDir}`);
  if (unzipResult.stderr) {
    console.error(`Error unzipping downloaded data: ${unzipResult.stderr}`);
    return;
  }

  const monthlyInWorkDir = path.join(workDir, `monthly-${year}.json`);
  try {
    fs.unlinkSync(monthlyInWorkDir);
  } catch (err) {}

  fs.renameSync(path.join(tempDir, `monthly-${year}.json`), monthlyInWorkDir);

  // Process results
  const simplifyResult = await exec(
    `node simplify.js ${workDir} ${year} ${month + 1}`,
  );
  if (simplifyResult.stderr) {
    console.error(`Error simplifying data: ${simplifyResult.stderr}`);
    return;
  }

  const indexResult = await exec(`node buildindex.js ${workDir}`);
  if (indexResult.stderr) {
    console.error(`Error creating index: ${indexResult.stderr}`);
    return;
  }
}

main();
