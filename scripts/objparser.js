(function() {
  this.objParser = {};

  objParser.objParse = function(text) {
    var face, faces, i, k, l, line, lines, mtlName, nindex, normals, nums, ref, ref1, texcoords, tindex, vertices, vindex, words;
    vertices = [];
    normals = [];
    texcoords = [];
    faces = [];
    lines = text.split('\n');
    mtlName = "";
    for (i = k = 0, ref = lines.length; 0 <= ref ? k < ref : k > ref; i = 0 <= ref ? ++k : --k) {
      line = lines[i];
      words = line.split(' ');
      switch (words[0]) {
        case "usemtl":
          mtlName = words[1];
          break;
        case "v":
          vertices.push(+words[1]);
          vertices.push(+words[2]);
          vertices.push(+words[3]);
          break;
        case "vt":
          texcoords.push(+words[1]);
          texcoords.push(+words[2]);
          break;
        case "vn":
          normals.push(+words[1]);
          normals.push(+words[2]);
          normals.push(+words[3]);
          break;
        case "f":
          face = [];
          for (i = l = 1, ref1 = words.length; 1 <= ref1 ? l < ref1 : l > ref1; i = 1 <= ref1 ? ++l : --l) {
            nums = (words[i] + '//').split('/');
            vindex = +nums[0];
            tindex = NaN;
            nindex = NaN;
            if (nums[1].length) {
              tindex = +nums[1];
            }
            if (nums[2].length) {
              nindex = +nums[2];
            }
            face.push({
              vindex: vindex,
              tindex: tindex,
              nindex: nindex,
              nindex: nindex,
              mtlName: mtlName
            });
          }
          faces.push(face);
          break;
      }
    }
    return {
      vertices: vertices,
      normals: normals,
      texcoords: texcoords,
      faces: faces
    };
  };

  objParser.createGLObject = function(obj) {
    var face, i, j, k, l, m, n, normals, numTriangles, ref, ref1, ref2, triangleCount, v0, v1, v2, vertices, vi0, vi1, vi2;
    numTriangles = 0;
    for (i = k = 0, ref = obj.faces.length; 0 <= ref ? k < ref : k > ref; i = 0 <= ref ? ++k : --k) {
      numTriangles += obj.faces[i].length - 2;
    }
    vertices = new Float32Array(numTriangles * 9);
    normals = new Float32Array(numTriangles * 9);
    triangleCount = 0;
    for (i = l = 0, ref1 = obj.faces.length; 0 <= ref1 ? l < ref1 : l > ref1; i = 0 <= ref1 ? ++l : --l) {
      face = obj.faces[i];
      for (j = m = 1, ref2 = face.length - 1; 1 <= ref2 ? m < ref2 : m > ref2; j = 1 <= ref2 ? ++m : --m) {
        vi0 = face[0].vindex - 1;
        vi1 = face[j].vindex - 1;
        vi2 = face[j + 1].vindex - 1;
        v0 = vec3.fromValues(obj.vertices[vi0 * 3], obj.vertices[vi0 * 3 + 1], obj.vertices[vi0 * 3 + 2]);
        v1 = vec3.fromValues(obj.vertices[vi1 * 3], obj.vertices[vi1 * 3 + 1], obj.vertices[vi1 * 3 + 2]);
        v2 = vec3.fromValues(obj.vertices[vi2 * 3], obj.vertices[vi2 * 3 + 1], obj.vertices[vi2 * 3 + 2]);
        vertices.set(v0, triangleCount * 9);
        vertices.set(v1, triangleCount * 9 + 3);
        vertices.set(v2, triangleCount * 9 + 6);
        n = vec3.create();
        vec3.sub(v1, v1, v0);
        vec3.sub(v2, v2, v0);
        vec3.cross(n, v1, v2);
        vec3.normalize(n, n);
        normals.set(n, triangleCount * 9);
        normals.set(n, triangleCount * 9 + 3);
        normals.set(n, triangleCount * 9 + 6);
        ++triangleCount;
      }
    }
    return {
      vertices: vertices,
      normals: normals
    };
  };

}).call(this);
