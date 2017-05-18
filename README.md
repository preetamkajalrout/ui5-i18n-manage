# ui5-i18n-manage

A command line tool created using Node.js to find the diff between two i18n files or merge the changes to one

## Getting Started/Installing

You can simply get the node module and install it globally to access it as a command line tool

```
npm install -g ui5-i18n-manage
```

### Prerequisites

Node.js should be available for the tool to work

### How to use

Based on provided language code (default: "en"). input file names are created. e.g. If language code is *pt* then files will be *i18n_pt.properties* (initial) and *i18n_pt_mod.properties* (modified).
Currently, the tools work in two different modes: **diff** and **merge** (default). *diff* mode can be selected using *-m* or *--mode* option.
Following are the simplest use case for the tool
```
ui5-i18n-manage -i "C:\Users\user.name\development.project\i18n\"
```
The above example assumes other options default value:
1. Language Code => en
2. Operation mode => merge
3. Output filename => i18n_en_final.properties

Following is an sample for diff mode

```
ui5-i18n-manage -m diff -i "C:\Users\user.name\development.project\i18n\" -l pt -o i18n_pt_diff.properties
```

To know about more properties of the tool. You can read the help in tool itself

```
ui5-i18n-manage -h
```

## Authors

* **Preetam Kajal Rout** - *Initial work* - [preetamkajalrout](https://github.com/preetamkajalrout)

See also the list of [contributors](https://github.com/preetamkajalrout/ui5-i18n-manage/contributors) who participated in this project.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details
