grunt-yui-config
====================

Generates a YUI config with Grunt.
Specifically expands file paths to module definitions with
module name, fullpath and requires.

## Install
```
npm install grunt-yui-config --save-dev
```

## Configuration Example
```javascript
grunt.initConfig({
  yuiConfig: {
    hojberg: {
      options: {
        dest: 'yui_config.js',
        comboBase: 'my/base/path',
        groups: {
          myGroup: {
            comboBase: 'my/other/path',
            modules: ['path/to/my/modules/**/*.js'],
            processPath: function (p) {
              return p.replace('path', 'public');
            },
            excludeFiles: ['path/to/exclude/**/*.js']
          }
        }
      }
    }
  }
});
```

Anything you pass to this will be added to the config, 
except `dest`, `excludeFiles` and `processPath` which will be removed
as the config is being generated.

## dest
Give the `dest` option to provide the output file of the YUI config.

## processPath
Provide the `processPath` function to modify the path of the module.
This is useful because Grunt sees the module paths relative to the Gruntfile
itself.

## processName
Provide the `processName` function to modify the generated name of the module.
This is useful when you need to add non YUI modules to your config. By default,
the path to the module is intelligently parsed from the result of `processedPath`, 
but sometimes, you might want your `processPath` to add a `-min` suffix to the 
generated files. This allows you to return the name of the module so that it does
not have the `-min`. 

## excludeFiles
use the `excludeFiles` options to exclude any non YUI modules from to build
the config from.

## `{{hash}}` in `comboBase`

Provide `{{hash}}` in your comboBase string and it will be interpolated with 
a sha of the contents of the files in the associated `group`. This is useful
for providing a fully cachable url.
