const util = require('util');
const exec = util.promisify(require('child_process').exec);
const path = require('path');
const fs = require('fs');

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

    let dataUrl = `https://atvira.sodra.lt/imones/downloads/${year}/monthly-${year}.json.zip`;
    let dataZipFilename = path.join(workDir, `monthly-${year}.json.zip`);

    // Get averages
    const curlResult = await exec(`curl -k -o ${dataZipFilename} ${dataUrl}`);
    if (curlResult.stdout) {
        console.error(`Error downloading data: ${curlResult.stdout}`);
        return;
    }

    const unzipResult = await exec(`unzip -o ${dataZipFilename} -d ${workDir}`);
    if (unzipResult.stderr) {
        console.error(`Error unzipping downloaded data: ${unzipResult.stderr}`);
        return;
    }

    // Get detailed data for last month
    let vidurkiaiDataZipFilename = path.join(workDir, `vidurkiai.zip`);
    const curlResult2 = await exec(`curl -k -o ${vidurkiaiDataZipFilename} http://sodra.is.lt/Failai/Vidurkiai.zip`);
    if (curlResult2.stdout) {
        console.error(`Error downloading data: ${curlResult2.stdout}`);
        return;
    }

    const unzipResult2 = await exec(`unzip -o ${vidurkiaiDataZipFilename} -d ${workDir}`);
    if (unzipResult2.stderr) {
        console.error(`Error unzipping downloaded data: ${unzipResult2.stderr}`);
        return;
    }

    let monthStr = month.toString().padStart(2, '0');
    let vidurkiaiDataCsvFilename = path.join(workDir, `vidurkiai${year}${monthStr}.csv`);
    fs.renameSync(path.join(workDir, 'VIDURKIAI.CSV'), vidurkiaiDataCsvFilename);

    // Process results
    const simplifyResult = await exec(`node simplify.js ${workDir} ${year} ${monthStr}`);
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
