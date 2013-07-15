module.exports = function (grunt) {

  var YUIConfigurator = require('./lib/yui_configurator');

  grunt.registerMultiTask('yuiConfig', 'Configure YUI with automatic module definitions', function() {
    var options   = this.options({ dest: 'yui_config.js', applyConfig: true }),
        dest      = options.dest,
        template  = options.template,
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
      fileContent = grunt.template.process(tmplFile, { data: config.config });
    }
    else {
      fileContent = config.output;
    }

    grunt.file.write(dest, fileContent);
  });

};
