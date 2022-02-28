# RPGMaker MZ Spellcheck

## Purpose
This is a node js command line tool to quick pull out all of the Talk strings from a RPGMaker MZ data files (JSON format)
It will write out the lines and run a spellchecker against the words found, and will highlight things that might be wrong.

## Usage
To get started
- npm install
- Copy files to scan into datafiles directory
- node rpgm_spellcheck.js 
- Flags:
- - -d, Provide path to directory to scan. 
- - -a, Display all lines, not just ones with flagged words
- - -i, Interactive add to ignore step
- - -p, Page results by file

Results are written to datafiles/lastreport.json

You can add words to ignore when flagged as misspelled to the ignore.json file. Add it as an entry in the ignorelist array.

## Examples

You can put your data files in the /datafiles directory and the script will check there by default

### Scan folder in project or any other directory you have access to
- node rpgm_spellcheck.js -d /mnt/c/User/name/Documents/RMMZ/project/data

### Scan default /datasources, display all lines, and prompt to add common flagged words to ignored file
- node rpgm_spellcheck.js -ia


## Notes
If you're on windows with an ubuntu subsystem you may need to navigate to your files with /mnt/[DISK LETTER]
node rpgm_spellcheck.js -a '/mnt/c/Users/USERNAME/Documents/Output/GAME NAME/data'

## Output
After running the script the output is [File Name] [Talk String] in the console.
It will be red if it's not in the spellchecker dictionary, but as you can see below that can make for a lot of false positives.
A JSON file with the full report is written to datafiles/lastreport.json.

![image](https://user-images.githubusercontent.com/7127233/153902540-e894cb40-6b8d-48f5-95d5-2e30b0ce4190.png)
