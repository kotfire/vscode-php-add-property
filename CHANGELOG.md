## 1.1.0 (2020-09-05)

### Added
- [#28](https://github.com/kotfire/vscode-php-add-property/issues/28) Add support for nullable property types

### Fixed
- [#26](https://github.com/kotfire/vscode-php-add-property/issues/26) Do not add extra space using docblock with param

## 1.0.0 (2020-08-31)

### Added
- Rewrite to use a PHP parser to reduce usage of RegExp
- Rewrite to use typescript
- Add a new command to remove properties
- Add a new command to rename properties
- Add a new command to change properties type
- Add a new command to transform a constructor into multiline
- Allow to configure the context menu commands via settings

### Fixed
- [#22](https://github.com/kotfire/vscode-php-add-property/issues/22) Add existing properties does not work with typed properties
- [#23](https://github.com/kotfire/vscode-php-add-property/issues/23) Decrease the minimum vscode version to 1.31.0

## 0.5.0 (2020-02-07)

### Added
- Support to insert properties in different classes on the same file

### Fixed
- The file indentation was not respected sometimes

## 0.4.1 (2020-02-06)

### Fixed
- Property won't be added if the constructor exists but is empty
- [#13](https://github.com/kotfire/vscode-php-add-property/issues/13) Adding a property does not work when using anonymous classes inside the class

## 0.4.0 (2020-02-04)

### Added
- Add a new option to add/update @param in the constructor docblock

## 0.3.1 (2020-01-22)

### Added
- Add a new command to add existing properties to the constructor
- Add a new option to enable/disable the context menu options

## 0.2.1 (2019-12-19)

### Fixed
- [#4](https://github.com/kotfire/vscode-php-add-property/issues/4) Cursor is sometimes placed in wrong location after generating property

## 0.2.0 (2019-12-19)

### Added
- Add a new option to use multiline docblocks

## 0.1.0 (2019-10-04)

### Added
- Break constructor into multiline if the given line length is exceeded (Configurable)

## 0.0.1 (2019-09-30)

### Initial release
