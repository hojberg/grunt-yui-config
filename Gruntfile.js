module.exports = function(grunt) {
  grunt.initConfig({
    yuiConfig: {
      devTemplate: {
        options: {
          dest: 'yui_config_from_tmpl.js',
          template: 'test/yui_config.tmpl',
          groups: {
            myGroup: {
              modules: ['test/fixtures/**/*.js'],
              processPath: function (p) {
                return p.replace('test', 'public');
              },
              excludeFiles: ['test/fixtures/not_me.js']
            }
          }
        }
      },

      dev: {
        options: {
          dest: 'yui_config.js',
          applyConfig: true,
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
              modules: ['test/fixtures/**/*.js'],
              excludeFiles: ['test/fixtures/not_me.js']
            }
          }
        }
      }
    }
  });

  grunt.loadTasks('tasks');
};
