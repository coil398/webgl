(function() {
  this.objParser = {};

  objParser.mtlParse = function(text) {
    var addCurrent, current, i, k, line, lines, mtl, ref, words;
    mtl = {};
    current = null;
    addCurrent = function() {
      if (current) {
        mtl[current.name] = current;
      }
      return current = {};
    };
    lines = text.split('\n');
    for (i = k = 0, ref = lines.length; 0 <= ref ? k < ref : k > ref; i = 0 <= ref ? ++k : --k) {
      line = lines[i];
      words = line.split(' ');
      switch (words[0]) {
        case 'newmtl':
          addCurrent();
          current.name = words[1];
          break;
        case 'Kd':
          current.kd = vec3.fromValues(+words[1], +words[2], +words[3]);
          break;
        case 'Ks':
          current.ks = vec3.fromValues(+words[1], +words[2], +words[3]);
          break;
        case 'Ns':
          current.ns = +words[1];
          break;
        case 'map_Kd':
          current.texture = words[1];
      }
    }
    addCurrent();
    return mtl;
  };

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

  objParser.createGLObject = function(obj, mtl) {
    var addNormal, currentMtlName, face, i, j, k, l, m, mtlInfos, n, n0, n1, n2, normalAtVertex, normals, numTriangles, o, p, ref, ref1, ref2, ref3, ref4, saveMtlInfo, triangleCount, v0, v1, v2, vertices, vi0, vi1, vi2;
    numTriangles = 0;
    for (i = k = 0, ref = obj.faces.length; 0 <= ref ? k < ref : k > ref; i = 0 <= ref ? ++k : --k) {
      numTriangles += obj.faces[i].length - 2;
    }
    vertices = new Float32Array(numTriangles * 9);
    normals = new Float32Array(numTriangles * 9);
    normalAtVertex = new Array(numTriangles * 3);
    addNormal = function(index, n) {
      var normal;
      if (!normalAtVertex[index]) {
        normalAtVertex[index] = vec3.clone(n);
        return;
      } else {
        normal = normalAtVertex[index];
        vec3.add(normal, normal, n);
      }
    };
    currentMtlName = "";
    mtlInfos = [];
    saveMtlInfo = function() {
      if (!mtl) {
        return mtlInfos.push({
          endPos: triangleCount * 9,
          kd: vec3.fromValues(0.5, 0.5, 0.5),
          ks: vec3.fromValues(0.0, 0.0, 0.0),
          ns: 1
        });
      } else if (currentMtlName) {
        return mtlInfos.push({
          endPos: triangleCount * 9,
          kd: mtl[currentMtlName].kd,
          ks: mtl[currentMtlName].ks,
          ns: mtl[currentMtlName].ns
        });
      }
    };
    triangleCount = 0;
    for (i = l = 0, ref1 = obj.faces.length; 0 <= ref1 ? l < ref1 : l > ref1; i = 0 <= ref1 ? ++l : --l) {
      face = obj.faces[i];
      if (currentMtlName !== face[0].mtlName) {
        saveMtlInfo();
        currentMtlName = face[0].mtlName;
      }
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
        addNormal(vi0, n);
        addNormal(vi1, n);
        addNormal(vi2, n);
        ++triangleCount;
      }
    }
    saveMtlInfo();
    triangleCount = 0;
    for (i = o = 0, ref3 = obj.faces.length; 0 <= ref3 ? o < ref3 : o > ref3; i = 0 <= ref3 ? ++o : --o) {
      face = obj.faces[i];
      for (j = p = 1, ref4 = face.length - 1; 1 <= ref4 ? p < ref4 : p > ref4; j = 1 <= ref4 ? ++p : --p) {
        vi0 = face[0].vindex - 1;
        vi1 = face[j].vindex - 1;
        vi2 = face[j + 1].vindex - 1;
        n0 = normalAtVertex[vi0];
        n1 = normalAtVertex[vi1];
        n2 = normalAtVertex[vi2];
        vec3.normalize(n0, n0);
        vec3.normalize(n1, n1);
        vec3.normalize(n2, n2);
        normals.set(n0, triangleCount * 9);
        normals.set(n1, triangleCount * 9 + 3);
        normals.set(n2, triangleCount * 9 + 6);
        ++triangleCount;
      }
    }
    return {
      vertices: vertices,
      normals: normals,
      mtlInfos: mtlInfos
    };
  };

}).call(this);
