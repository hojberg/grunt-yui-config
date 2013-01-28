module.exports = function (grunt) {

  var YUIConfigurator = require('./lib/yui_configurator');

  grunt.registerTask('yuiConfig', 'Configure YUI with automatic module definitions', function() {
    var options = this.options({ dest: 'yui_config.js' }),
        dest    = options.dest,
        config;

    delete options.dest;

    if (grunt.option('debug')) {
      grunt.log.debug(options);
    }

    config = new YUIConfigurator(options, grunt);
    config.build();

    grunt.file.write(dest, config.output);
  });

};
