var path = require('path');

// overwrite the global YUI object to sniff module meta data
global.YUI = {
  add: function () {}
};

/**
@class YUIConfigurator
@constructor
**/
var YUIConfigurator = function (options, grunt) {
  this.options = options;
  this.grunt = grunt;
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
    var config = this.extractModuleDefinitions(this.options);

    this.output = "YUI.applyConfig(" + JSON.stringify(config) + ");"
  },

  /**
  replaces `mouldes` keys with the complete 
  definition of name, path and requirements

  @method extractModuleDefinitions
  @param {Object}
  @returns {Object}
  **/
  extractModuleDefinitions: function (config) {
    var groups = config.groups,
        k;

    if (groups) {
      for (k in groups) {
        groups[k].modules = this.buildModuleDefinition(
          config.groups[k].modules,
          config.groups[k].excludeFiles || [],
          config.groups[k].processPath
        );

        delete config.groups[k].excludeFiles;
        delete config.groups[k].processPath;
      }
    }

    if (config.modules) {
      config.modules = this.buildModuleDefinition(
        config.modules,
        config.excludeFiles || [],
        config.processPath
      );

      delete config.excludeFiles;
      delete config.processPath;
    }

    return config;
  },

  /**
  @method buildModuleDefinition
  @param {Array} paths
  @param {Array} exclusions
  @param {Function} processPath - optional
  **/
  buildModuleDefinition: function (paths, exclusions, processPath) {
    var grunt = this.grunt,
        modules = {};

    // expand glob
    paths       = grunt.file.expand(paths);
    exclusions  = grunt.file.expand(exclusions);

    paths.forEach(function (p) {
      if (exclusions.indexOf(p) !== -1) return;

      // process the path if a processor is provided
      fullpath = (processPath ? processPath(p) : p);

      // overwrite add on the YUI global for each path to record the path
      YUI.add = function (name, module, version, options) {
        modules[name] = {
          fullpath: fullpath,
          requires: options.requires || []
        };
      };

      // load in the YUI module to sniff the meta data
      require(path.resolve(p));
    });

    return modules;
  }

};

// Expose module
module.exports = YUIConfigurator;
