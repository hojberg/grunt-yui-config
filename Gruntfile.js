module.exports = function(grunt) {
  grunt.initConfig({
    yuiConfig: {
      options: {
        dest: 'yui_config.js',
        comboBase: 'my_base_path',
        groups: {
          myGroup: {
            comboBase: 'super/cool/path',
            modules: ['./test/fixtures/**/*.js']
          }
        }
      }
    }
  });

  grunt.loadTasks('tasks');
};
