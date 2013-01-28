var path    = require('path'),
    crypto  = require('crypto');

// overwrite the global YUI object to sniff module meta data
global.YUI = {
  add: function () {}
};

/**
@class YUIConfigurator
@constructor
**/
var YUIConfigurator = function (options, grunt) {
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
    var config = this.extractModuleDefinitions(this.options);

    this.output = "YUI.applyConfig(" + JSON.stringify(config) + ");";
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
        k, comboBase, shasum;

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
        group.excludeFiles || [],
        group.processPath
      );

      group.modules = definitions.modules;
      fileContents  = definitions.contents;

      delete group.excludeFiles;
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
  @param {Array} exclusions
  @param {Function} processPath - optional
  **/
  buildModuleDefinition: function (paths, exclusions, processPath) {
    var grunt     = this.grunt,
        contents  = [],
        modules   = {};

    // expand glob
    paths       = grunt.file.expand(paths);
    exclusions  = grunt.file.expand(exclusions);

    paths.forEach(function (p) {
      var resolvedPath = path.resolve(p),
          fullpath;

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
      require(resolvedPath);

      contents.push(grunt.file.read(resolvedPath));
    });

    return {
      modules:  modules,
      contents: contents
    }
  }

};

// Expose module
module.exports = YUIConfigurator;
