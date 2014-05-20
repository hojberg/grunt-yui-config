var merge = require('merge');
var YUIConfigurator = require('./lib/yui_configurator');

var gruntYUIConfig = function (grunt) {

  grunt.registerMultiTask('yuiConfig', 'Configure YUI with automatic module definitions', function() {
    var options   = this.options({ dest: 'yui_config.js', applyConfig: true }),
        dest      = options.dest,
        template  = options.template,
        templateVars = options.templateVars || {},
        fileContent,
        config;

    console.log('Building: ' + dest);

    delete options.dest;

    if (grunt.option('debug')) {
      grunt.log.debug(options);
    }

    if (template) {
      options.applyConfig = false;
    }

    if (!('allowModuleOverwrite' in options)) {
      options.allowModuleOverwrite = false;
    }

    config = new YUIConfigurator(options, grunt);
    config.build();

    if (template) {
      tmplFile = grunt.file.read(template);
      templateVars = merge(config.config, templateVars);
      fileContent = grunt.template.process(tmplFile, {
        data: templateVars
      });
    }
    else {
      fileContent = config.output;
    }

    grunt.file.write(dest, fileContent);
  });

};

module.exports = gruntYUIConfig;
