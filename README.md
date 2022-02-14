#RPGMaker MZ Spellcheck

##Purpose
This is a node js command line tool to quick pull out all of the Talk strings from a RPGMaker MZ data files (JSON format)
It will write out the lines and run a spellchecker against the words found, and will highlight things that might be wrong.

##Usage
To get started
*npm install
*node rpgpm_talk_dump.js [PATH TO YOUR DATAFILES]

Or you can put your data files in the /datafiles directory
It's the default search locations

##Options
You can add the path to your datafiles as an argument
You can use the -a flag to display all Talk strings found (not just the ones with spelling flags)
eg
node rpgpm_talk_dump.js -a [PATH TO YOUR DATAFILES]
