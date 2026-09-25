# DecTox
Decorative text processor extension for VS Code. \
This project was developed as a part of 1 Grade lab in ITMO. The main idea of this extension is to provide a way to make your code cooler 
than it ever was.

## Main Functions
- `Place jpg/png/bmp picture as an ascii drawing comment.`
- `Querrying pictures from pinterest. (Requires setting)`
- `Smart tabbing.`

## User Guide

### ASCII Picture placement
By default it is bound to keybind `ctrl+shift+l`. You can also call it with `dectox.ChoosePlacePicture` command. It will ask you to choose file and convert it into ascii drawing for your code.

Settings:
|key|type|default|
|---|---|---|
|dectox.DepthMethod|enum[string]|`"rgb/3"`|
|dectox.ASCIILayers|enum[string]|`"14"`|
|dectox.InvertASCIIOrder|boolean|`false`|
|dectox.PicWidth|integer>0|`50`|
|dectox.PicHeight|integer>0|`50`|
|dectox.DisableCommentSigns|boolean|`false`|

### Pinterest requests
Called with `dectox.grabpics` command. It will ask you to enter pinterest query and then will get some pictures by this. Pictures are saved in global extension storage, in directory "bufp".

Settings:
|key|type|default|
|---|---|---|
|dectox.BrowserPath|string|firefox|
|dectox.RequestDelay|integer>0|500|
|dectox.ShouldClearBufp|boolean|true|
|dectox.OpenBufpFolderAfterRequest|boolean|false|

### Smart tab
Called with `dectox.smartTab` or keybind `shift+right`(Will be changed soon). Automatically defines optimal spaces amount for your tab. There is not much i can say about it.
