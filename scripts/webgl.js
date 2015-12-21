(function() {
  (function() {
    var config, drawFrame, fileCount, files, frame, gl, glObj, initialize, loadBuffer, loadFile, nbuf, prog, vbuf;
    config = {
      objName: "./Marisa/untitled.obj"
    };
    fileCount = 0;
    window.onload = function() {
      var callback;
      callback = function() {
        fileCount--;
        if (fileCount === 0) {
          initialize();
        }
      };
      loadFile(config.objName, "obj", callback);
      return fileCount++;
    };
    files = {};
    loadFile = function(url, name, callback) {
      var xhr;
      xhr = new XMLHttpRequest();
      xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
          files[name] = xhr.responseText;
          return callback();
        }
      };
      xhr.open("GET", url, true);
      return xhr.send("");
    };
    gl = null;
    prog = null;
    glObj = null;
    initialize = function() {
      var canvas, fs, obj, vs;
      obj = objParser.objParse(files.obj);
      glObj = objParser.createGLObject(obj);
      canvas = document.getElementById('canvas');
      gl = canvas.getContext('experimental-webgl' || canvas.getContext('webgl'));
      if (!gl) {
        document.write('This browser does not support webgl');
        return;
      }
      vs = gl.createShader(gl.VERTEX_SHADER);
      gl.shaderSource(vs, document.getElementById('vs').text);
      gl.compileShader(vs);
      if (!gl.getShaderParameter(vs, gl.COMPILE_STATUS)) {
        console.log('Vertex shader compile error');
        console.log(gl.getShaderInfoLog(vs));
        return;
      }
      fs = gl.createShader(gl.FRAGMENT_SHADER);
      gl.shaderSource(fs, document.getElementById('fs').text);
      gl.compileShader(fs);
      if (!gl.getShaderParameter(fs, gl.COMPILE_STATUS)) {
        console.log('Fragment shader compile error');
        console.log(gl.getShaderInfoLog(fs));
        return;
      }
      prog = gl.createProgram();
      gl.attachShader(prog, vs);
      gl.attachShader(prog, fs);
      gl.linkProgram(prog);
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
        console.log('link error');
        console.log(gl.getShaderInfoLog(fs));
        return;
      }
      gl.useProgram(prog);
      loadBuffer();
      drawFrame();
    };
    vbuf = null;
    nbuf = null;
    loadBuffer = function() {
      vbuf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, vbuf);
      gl.bufferData(gl.ARRAY_BUFFER, glObj.vertices, gl.STATIC_DRAW);
      nbuf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, nbuf);
      return gl.bufferData(gl.ARRAY_BUFFER, glObj.normals, gl.STATIC_DRAW);
    };
    frame = 0;
    drawFrame = function() {
      var mv_mat, npos, proj_mat, vpos;
      frame++;
      proj_mat = mat4.create();
      mat4.frustum(proj_mat, -1, 1, -1, 1, 3, 10);
      mv_mat = mat4.create();
      mat4.translate(mv_mat, mv_mat, [0, -2, -7]);
      mat4.rotate(mv_mat, mv_mat, frame * 0.01, [0, 1, 0]);
      gl.uniformMatrix4fv(gl.getUniformLocation(prog, "projectionMatrix"), false, proj_mat);
      gl.uniformMatrix4fv(gl.getUniformLocation(prog, "modelviewMatrix"), false, mv_mat);
      gl.clearColor(0, 0, 0, 1);
      gl.clear(gl.COLOR_BUFFER_BIT || gl.DEPTH_BUFFER_BIT);
      gl.enable(gl.DEPTH_TEST);
      vpos = gl.getAttribLocation(prog, "vertex");
      npos = gl.getAttribLocation(prog, "normal");
      gl.bindBuffer(gl.ARRAY_BUFFER, vbuf);
      gl.vertexAttribPointer(vpos, 3, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(vpos);
      gl.bindBuffer(gl.ARRAY_BUFFER, nbuf);
      gl.vertexAttribPointer(npos, 3, gl.FLOAT, true, 0, 0);
      gl.enableVertexAttribArray(npos);
      gl.drawArrays(gl.TRIANGLES, 0, glObj.vertices.length / 3);
      return setTimeout(drawFrame, 16);
    };
  })();

}).call(this);
