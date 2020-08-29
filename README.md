[![Version](https://vsmarketplacebadge.apphb.com/version-short/kotfire.php-add-property.svg?style=for-the-badge)](https://marketplace.visualstudio.com/items?itemName=kotfire.php-add-property)
[![Rating](https://vsmarketplacebadge.apphb.com/rating-short/kotfire.php-add-property.svg?style=for-the-badge)](https://marketplace.visualstudio.com/items?itemName=kotfire.php-add-property)
[![Installs](https://vsmarketplacebadge.apphb.com/installs/kotfire.php-add-property.svg?style=for-the-badge)](https://marketplace.visualstudio.com/items?itemName=kotfire.php-add-property)

# PHP Add Property

Visual Code Studio extension to manage PHP class properties

## Support my work

[![Github sponsors](https://img.shields.io/badge/Sponsor%20now-181717?style=for-the-badge&logo=github)](https://github.com/sponsors/kotfire)
[![Buy me a tea](https://img.shields.io/badge/Buy%20me%20a%20tea-555555?style=for-the-badge&logo=Ko-fi)](https://ko-fi.com/M4M71TVH1)
[![Buy the world a tree](https://img.shields.io/badge/Buy%20the%20world%20a%20tree-%F0%9F%8C%B3-242424?labelColor=276749&style=for-the-badge)](https://plant.treeware.earth/kotfire/vscode-php-add-property)

## Features

### Add a property

![Add a property demo](images/add.gif)

### Add existing properties

> It gets the property type from the docblock!

![Add existing properties demo](images/existing.gif)

### Remove a property

![Remove a property demo](images/remove.gif)

### Rename a property

![Remove a property demo](images/rename.gif)

### Change property type

![Remove a property demo](images/type.gif)

### Insert constructor

Automatically insert a constructor if it does not exist.

![Insert constructor demo](images/constructor.gif)

### Multi-line constructor support

![Multi-line constructor demo](images/multiline.gif)

### Highly customizable

![Highly customizable demo](images/customizable.gif)

## Extension Settings

This extension contributes the following settings:

* `phpAddProperty.property.visibility.choose`: Specifies whether to choose property visibility when inserting
* `phpAddProperty.property.visibility.default`: Specifies the default property visibility
* `phpAddProperty.property.stopToImport`: Specifies whether to stop after typing the type to refer to an external fully qualified name with an alias or importing
* `phpAddProperty.property.docblock.add`: Specifies whether to add a docblock @var type to the property
* `phpAddProperty.property.docblock.multiline`: Specifies whether to use a multiline docblock
* `phpAddProperty.property.docblock.withParameter`: Specifies whether to add the docblock @var type to the property and the constructor parameter type at the same time
* `phpAddProperty.property.docblock.stopToImport`: Specifies whether to stop after typing the type to refer to an external fully qualified name with an alias or importing
* `phpAddProperty.property.types`: Specifies whether to enable PHP 7.4+ typed properties [More info](https://wiki.php.net/rfc/typed_properties_v2)
* `phpAddProperty.constructor.docblock.enable`: Specifies whether to add/update the docblock to the constructor
* `phpAddProperty.constructor.docblock.withParameter`: Specifies whether to add the docblock @param type together with the constructor parameter type
* `phpAddProperty.constructor.docblock.stopToImport`: Specifies whether to stop after typing the @param type to refer to an external fully qualified name with an alias or importing
* `phpAddProperty.constructor.docblock.stopForDescription`: Specifies whether to stop after typing the @var type to add a description
* `phpAddProperty.constructor.visibility.choose`: Specifies whether to choose constructor visibility when inserting
* `phpAddProperty.constructor.visibility.default`: Specifies the default constructor visibility
* `phpAddProperty.constructor.breakIntoMultilineIfLengthExceeded.enabled`: Specifies whether to break the constructor into multiple lines if the given line length is exceeded
* `phpAddProperty.constructor.breakIntoMultilineIfLengthExceeded.maxLineLength`: Specifies the maximum line length before using a multiline constructor
* `phpAddProperty.showMessagesOnStatusBar`: Specifies whether to show messages on status bar instead of notification box
* `phpAddProperty.contextMenuOptions.enable`: Specifies whether to show the context menu options
* `phpAddProperty.contextMenuOptions.addProperty`: Specifies whether to show the add property command in the context menu options
* `phpAddProperty.contextMenuOptions.appendProperty`: Specifies whether to show the append property command in the context menu options
* `phpAddProperty.contextMenuOptions.renameProperty`: Specifies whether to show the rename property command in the context menu options
* `phpAddProperty.contextMenuOptions.changePropertyType`: Specifies whether to show the change property type command in the context menu options
* `phpAddProperty.contextMenuOptions.removeProperty`: Specifies whether to show the remove property command in the context menu options
* `phpAddProperty.contextMenuOptions.breakConstructorIntoMultiline`: Specifies whether to show the break constructor into multiline command in the context menu options
