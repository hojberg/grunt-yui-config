module.exports = function(grunt) {
  grunt.initConfig({
    yuiConfig: {
      dev: {
        options: {
          dest: 'yui_config.js',
          groups: {
            myGroup: {
              comboBase: 'super/{{hash}}/path',
              modules: ['test/fixtures/**/*.js'],
              processPath: function (p) {
                return p.replace('test', 'public');
              },
              excludeFiles: ['test/fixtures/not_me.js']
            }
          }
        }
      },
      server: {
        options: {
          dest: 'yui_config_server.js',
          applyConfig: false,
          groups: {
            myGroup: {
              useFullPath: true,
              modules: ['test/fixtures/**/*.js']
            }
          }
        }
      }
    }
  });

  grunt.loadTasks('tasks');
};
