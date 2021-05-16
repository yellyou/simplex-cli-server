const request = require('@simplex-cli-dev/request');

module.exports = function() {
  return request({
    url: '/project/template',
  });
};