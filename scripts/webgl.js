(function() {
  window.onload = function() {
    var c, gl;
    c = document.getElementById('canvas');
    c.width = 500;
    c.height = 300;
    gl = c.getContext('webgl' || c.getContext('experimental-webgl'));
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    return gl.clear(gl.COLOR_BUFFER_BIT);
  };

}).call(this);
