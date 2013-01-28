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
    var groups = config.groups;

    if (groups) {
      for (var key in groups) {
        group.modules = this.buildModuleDefinition(group.modules);

        config.groups[key] = group;
      }
    }

    if (config.modules) {
      config.modules = this.buildModuleDefinition(config.modules);
    }

    return config;
  },

  /**
  @method buildModuleDefinition
  @param {Array} paths
  **/
  buildModuleDefinition: function (paths) {
    var modules = {};

    // expand glob
    paths = this.grunt.file.expand(paths);

    paths.forEach(function (path) {
      // overwrite add on the YUI global for each path to record the path
      YUI.add = function (name, module, version, options) {
        modules[name] = {
          fullpath: path,
          requires: options.requires || []
        };
      };

      // load in the YUI module to sniff the meta data
      require('../../' + path);
    });

    return modules;
  }

};

// Expose module
module.exports = YUIConfigurator;
