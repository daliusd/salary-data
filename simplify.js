const fs = require('fs');
const path = require('path');
const nReadlines = require('n-readlines');
const CSV = require('csv-string');

if (process.argv.length < 5) {
  console.log('node simplify.js working_directory year month');
  process.exit(-1);
}

let workDir = process.argv[2];

let year = process.argv[3];
let month = process.argv[4];

let intYear = parseInt(year, 10);
let intMonth = parseInt(month, 10);

// Read data
let csvFilename = path.join(workDir, `monthly-${year}.csv`);

const data = new nReadlines(csvFilename);

let monthInt = (intYear * 100 + intMonth).toString();


let result = [];
while (line = data.next()) {
  info = CSV.parse(line.toString())[0];

  if (info[7] && info[6] === monthInt) {
    let row = {
      n: info[2],
      w: parseFloat(info[7]),
      e: info[5] || undefined,
      m: info[3],
      i: parseInt(info[8], 10),
    }
    result.push(row)
  }

}

fs.writeFileSync(path.join(workDir, `${monthInt}.json`),JSON.stringify(result, null, 2));
