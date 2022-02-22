# RPGMaker MZ Spellcheck

## Purpose
This is a node js command line tool to quick pull out all of the Talk strings from a RPGMaker MZ data files (JSON format)
It will write out the lines and run a spellchecker against the words found, and will highlight things that might be wrong.

## Usage
To get started
* npm install
* node rpgm_spellcheck.js [PATH TO YOUR DATAFILES]

Or you can put your data files in the /datafiles directory and the script will check there by default

## Options
You can add the path to your datafiles as an argument
You can use the -a flag to display all Talk strings found (not just the ones with spelling flags)
e.g.
node rpgm_spellcheck.js -a [PATH TO YOUR DATAFILES]

## Output
After running the script the output is [File Name] [Talk String]
It will be red if it's not in the spellchecker dictionary, but as you can see below that can make for a lot of false positives.

![image](https://user-images.githubusercontent.com/7127233/153902540-e894cb40-6b8d-48f5-95d5-2e30b0ce4190.png)
