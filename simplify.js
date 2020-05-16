const fs = require('fs');
const path = require('path');

if (process.argv.length < 5) {
    console.log('node simplify.js working_directory year month');
    process.exit(-1);
}


let workDir = process.argv[2];

let year = process.argv[3];
let month = process.argv[4];

function calcMaxPossibleSalary(data) {
    // This is fun calculation with many assumptions.
    // The main assumption is that there is only one
    // person in company that gets maximum salary.
    // Second assumption is that removing this person
    // from calculation will attract median to mean.
    // Third assumption is that 25th and 75th quantiles
    // correspond to real situation in company.
    // Forth assumption is that all people get either salary
    // like 25th or 75th quantile persons.
    // Basically treat it as fun exercise that maximum salary
    // might be getting the main person in the company.
    let group1 = data.i >> 1;
    let group2 = data.i >> 1 - (data.i % 2 === 0 ? 1 : 0);

    let stdPartFromOthers = (data.m3 - data.f3)**2 * group1 + (data.m3 - data.l3)**2 * group2;

    let b = -2 * data.m3;
    let c = stdPartFromOthers + data.m3**2 - data.s3**2 * data.i;

    if (b**2 - 4*c < 0) {
        return undefined;
    }

    let D = Math.sqrt(b**2 - 4*c)
    let maxSalary = Math.trunc((-b + D) / 2);

    return maxSalary;
}

// Read CSV data
let dataByCode = {};

let csvFilename = path.join(workDir, `vidurkiai${year}${month}.csv`);
if (fs.existsSync(csvFilename)) {
  let csvdata = fs.readFileSync(csvFilename).toString().split('\n');

  function extractNumber(str) {
      return parseFloat(str.trim().replace(',', '.'));
  }

  for (let line of csvdata) {
      let data = line.split(';')

      if (data.length > 11 && data[1].length > 0) {
          let code = data[1];
          dataByCode[code] = {
              'a': extractNumber(data[2]),
              'a3': extractNumber(data[7]) || undefined, // average
              'm3': extractNumber(data[8]) || undefined, // median
              'f3': extractNumber(data[9]) || undefined, // first 25%
              'l3': extractNumber(data[10]) || undefined, // last 25%
              's3': extractNumber(data[11]) || undefined, // std
          }
      }
  }
}

// Read JSON data
let jsonFilename = path.join(workDir, `monthly-${year}.json`);

let rawdata = fs.readFileSync(jsonFilename);
let monthly = JSON.parse(rawdata);

let monthInt = parseInt(year, 10) * 100 + parseInt(month, 10);

let processed = [];
for (let monthData of monthly) {
    if (monthData.avgWage && monthData.month === monthInt) {
        let processedData = {
            n: monthData.name,
            w: monthData.avgWage,
            e: monthData.ecoActName || undefined,
            m: monthData.municipality,
            i: monthData.numInsured,
        }

        if (monthData.code in dataByCode) {
            if (monthData.avgWage === dataByCode[monthData.code].a) {
                let detailedData = dataByCode[monthData.code];
                processedData = {
                    ...processedData,
                    ...detailedData,
                }

                if (processedData.a3 && processedData.m3 && processedData.f3 && processedData.l3 && processedData.s3) {
                    processedData.wi = calcMaxPossibleSalary(processedData);
                }
            } else {
                console.log('Problem with data', monthData.name, monthData.avgWage, dataByCode[monthData.code].a);
            }
        }

        processed.push(processedData);
    }
}

fs.mkdirSync('data', { recursive: true });

let data = JSON.stringify(processed, null, 2);
fs.writeFileSync(path.join(workDir, `${monthInt}.json`), data);
