var path    = require('path'),
    crypto  = require('crypto'),
    clone   = require('clone');

/**
@class YUIConfigurator
@constructor
**/
var YUIConfigurator = function (options, grunt) {
  this.applyConfig = options.applyConfig;

  delete options.applyConfig;

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
    this.extractModuleDefinitions(this.options);
    this.serializeConfig(this.config);
  },

  /**
  @method serializeConfig
  **/
  serializeConfig: function (cfg) {
    var config = clone(cfg),
        group, modules,
        output;

    for (var key in config.groups) {
      group = config.groups[key];
      modules = group.modules;

      if (config.groups[key].comboBase) {
        group.comboBase = group.comboBase.replace('{{hash}}', group.hash);
      }

      delete group.hash;

      group.modules = {};

      modules.forEach(function (mod) {
        group.modules[mod.name] = {
          requires: mod.requires
        };

        if (mod.path) {
          group.modules[mod.name].path = mod.path;
        }
        else {
          group.modules[mod.name].fullpath = mod.fullpath;
        }
      });

      config.groups[key] = group;
    }

    output = JSON.stringify(config);

    if (this.applyConfig) {
      output = "YUI.applyConfig(" + output + ");";
    }

    this.output = output;
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
        k, shasum;

    if (groups) {
      for (k in groups) {
        groups[k] = this._buildGroup(groups[k]);
      }
    }

    this.config = this._buildGroup(config);
  },

  /**
  @method _buildGroup
  @param {Object} group
  @returns {Object} group
  @protected
  **/
  _buildGroup: function (group) {
    var shasum        = crypto.createHash('sha1'),
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
      shasum.update(definitions.contents.join(''));
      group.hash = shasum.digest('hex');

      delete group.excludeFiles;
      delete group.useFullPath;
      delete group.processPath;
      delete group.processPath;
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
        modules   = [];

    // expand glob
    paths       = grunt.file.expand(paths);
    exclusions  = grunt.file.expand(exclusions);

    paths.forEach(function (p) {
      var resolvedPath  = path.resolve(p),
          content       = grunt.file.read(resolvedPath),
          modMeta       = { requires: [] },
          modpath,
          parts,
          name;

      // add to contents for sha
      contents.push(content);

      if (exclusions.indexOf(p) !== -1) return;

      // process the path if a processor is provided
      modpath = (processPath ? processPath(p) : p);
      modMeta[pathKey] = modpath;

      // is it a yui module?
      if (content.indexOf('YUI.add') !== -1) {

        // overwrite add on the YUI global for each path to record the path
        global.YUI = {
          add: function (name, moduleBody, version, options) {
            modMeta.name = name;
            modMeta.requires = options.requires || [];

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
        modMeta.name = name;

        console.log("✓ " + name + ' added');
      }

      modules.push(modMeta);
    });

    return {
      modules:  modules,
      contents: contents
    }
  }

};

// Expose module
module.exports = YUIConfigurator;
