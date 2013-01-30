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
      }
    }
  });

  grunt.loadTasks('tasks');
};
