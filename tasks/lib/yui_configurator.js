var path    = require('path'),
    crypto  = require('crypto');

/**
@class YUIConfigurator
@constructor
**/
var YUIConfigurator = function (options, grunt) {
  global.YUI    = undefined;
  this.options  = options;
  this.grunt    = grunt;
};

YUIConfigurator.prototype = {

  /**
  add all the modules from paths and create the
  config file from the template

  @method build
  **/
  build: function () {
    this.createConfig();
  },

  /**
  @method createConfig
  **/
  createConfig: function () {
    var opts        = this.options,
        applyConfig = opts.applyConfig,
        config      = this.extractModuleDefinitions(opts),
        output;

    config = JSON.stringify(config);

    if (applyConfig) {
      config = "YUI.applyConfig(" + config + ");";
    }

    this.output = config;
  },

  /**
  replaces `modules` keys with the complete
  definition of name, path and requirements

  @method extractModuleDefinitions
  @param {Object}
  @returns {Object}
  **/
  extractModuleDefinitions: function (config) {
    var groups = config.groups,
        k, comboBase, shasum;

    delete config.applyConfig;

    if (groups) {
      for (k in groups) {
        groups[k] = this._buildGroup(groups[k]);
      }
    }

    config = this._buildGroup(config);

    return config;
  },

  /**
  @method _buildGroup
  @param {Object} group
  @returns {Object} group
  @protected
  **/
  _buildGroup: function (group) {
    var shasum        = crypto.createHash('sha1'),
        fileContents  = [],
        comboBase     = group.comboBase || '',
        definitions;

    if ('modules' in group) {
      definitions = this.buildModuleDefinition(
        group.modules,
        group.useFullPath,
        group.excludeFiles || [],
        group.processPath,
        group.processName
      );

      group.modules = definitions.modules;
      fileContents  = definitions.contents;

      delete group.excludeFiles;
      delete group.useFullPath;
      delete group.processPath;
      delete group.processPath;

      if (comboBase.indexOf('{{hash}}')) {
        shasum.update(fileContents.join(''));
        group.comboBase = comboBase.replace('{{hash}}', shasum.digest('hex'));
      }
    }

    return group;
  },

  /**
  @method buildModuleDefinition
  @param {Array} paths
  @param {Boolean} useFullPath
  @param {Array} exclusions
  @param {Function} processPath - optional
  @param {Function} processName - optional
  **/
  buildModuleDefinition: function (paths, useFullPath, exclusions, processPath, processName) {
    var grunt     = this.grunt,
        pathKey   = useFullPath ? 'fullpath' : 'path',
        contents  = [],
        modules   = {};

    // expand glob
    paths       = grunt.file.expand(paths);
    exclusions  = grunt.file.expand(exclusions);

    paths.forEach(function (p) {
      var resolvedPath  = path.resolve(p),
          content       = grunt.file.read(resolvedPath),
          modpath,
          parts,
          name;

      if (exclusions.indexOf(p) !== -1) return;

      // process the path if a processor is provided
      modpath = (processPath ? processPath(p) : p);

      // is it a yui module?
      if (content.indexOf('YUI.add') !== -1) {

        // overwrite add on the YUI global for each path to record the path
        global.YUI = {
          add: function (name, module, version, options) {
            modules[name] = {
              requires: options.requires || []
            };

            modules[name][pathKey] = modpath;
            console.log("✓ " + name + ' added');
          }
        };

        // load in the YUI module to sniff the meta data
        require(resolvedPath);
        delete require.cache[resolvedPath];
      }
      else {

    	parts = modpath.split('/');
      	name  = parts[parts.length - 1].replace('.js', '');

        if (processName) {
        	name = processName(name, p);
        }

        modules[name] = {};
        modules[name][pathKey] = modpath;

        console.log("✓ " + name + ' added');
      }

      contents.push(content);
    });

    return {
      modules:  modules,
      contents: contents
    }
  }

};

// Expose module
module.exports = YUIConfigurator;
