Salary Data Toolkit
===================

Scripts to download and process data retrieved from Sodra.

monthly.js - Downloads most recent data. Must be run once a month.
Most probably using cron.

E.g. following cron command might work:

```cron
0 6 2 * * cd /home/dalius/salary-data && node monthly.js /home/dalius/pinigai/data/
```

simplify.js - Extract data for specific month and simplify it.

buildindex.js - Build index.json file.

Data sources
============

* http://atvira.sodra.lt/imones/rinkiniai/index.html

* https://www.sodra.lt/lt/paslaugos/informacijos-rinkmenos
