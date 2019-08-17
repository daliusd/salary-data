const util = require('util');
const exec = util.promisify(require('child_process').exec);
const path = require('path');

async function main() {
    if (process.argv.length < 3) {
        console.log('node monthly.js working_directory');
        return;
    }
    let workDir = process.argv[2];

    let current = new Date();

    year = current.getFullYear();
    month = current.getMonth();
    // We can get only one month old data
    if (current.getMonth() < 2) {
        year -= 1;
    }
    month = (month + 10) % 12 + 1; // month, which data we have

    year = year.toString();

    let dataUrl = `http://atvira.sodra.lt/imones/downloads/${year}/monthly-${year}.json.zip`;
    let dataZipFilename = path.join(workDir, `monthly-${year}.json.zip`);

    const curlResult = await exec(`curl -o ${dataZipFilename} ${dataUrl}`);
    if (curlResult.stdout) {
        console.error(`Error downloading data: ${curlResult.stdout}`);
        return;
    }

    const unzipResult = await exec(`unzip ${dataZipFilename} -d ${workDir}`);
    if (unzipResult.stderr) {
        console.error(`Error unzipping downloaded data: ${unzipResult.stderr}`);
        return;
    }

    const simplifyResult = await exec(`node simplify.js ${workDir} ${year} ${month}`);
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

main()
