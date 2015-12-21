@objParser = {}

objParser.objParse = (text) ->
    vertices = []
    normals = []
    texcoords = []
    faces = []

    lines = text.split '\n'
    mtlName = ""

    for i in [0...lines.length]
        line = lines[i]
        words = line.split ' '
        switch words[0]
            when "usemtl"
                mtlName = words[1]
            when "v"
                vertices.push +words[1]
                vertices.push +words[2]
                vertices.push +words[3]
            when "vt"
                texcoords.push +words[1]
                texcoords.push +words[2]
            when "vn"
                normals.push +words[1]
                normals.push +words[2]
                normals.push +words[3]
            when "f"
                face = []
                for i in [1...words.length]
                    nums = (words[i] + '//').split('/')
                    vindex = +nums[0]
                    tindex = NaN
                    nindex = NaN
                    if nums[1].length
                        tindex = +nums[1]
                    if nums[2].length
                        nindex = +nums[2]

                    face.push {vindex:vindex,tindex:tindex,nindex,nindex,mtlName:mtlName}

                faces.push(face)

            else

    return {
        vertices: vertices,
        normals: normals,
        texcoords: texcoords,
        faces: faces
    }

objParser.createGLObject = (obj) ->
    # ポリゴンの枚数を特定する
    numTriangles = 0
    for i in [0...obj.faces.length]
        numTriangles += obj.faces[i].length - 2

    vertices = new Float32Array numTriangles * 9

    normals = new Float32Array numTriangles * 9

    triangleCount = 0

    for i in [0...obj.faces.length]
        face = obj.faces[i]
        for j in [1...face.length - 1]
            vi0 = face[0].vindex - 1
            vi1 = face[j].vindex - 1
            vi2 = face[j+1].vindex - 1

            v0 = vec3.fromValues obj.vertices[vi0 * 3],obj.vertices[vi0 * 3 + 1],obj.vertices[vi0 * 3 + 2]
            v1 = vec3.fromValues obj.vertices[vi1 * 3],obj.vertices[vi1 * 3 + 1],obj.vertices[vi1 * 3 + 2]
            v2 = vec3.fromValues obj.vertices[vi2 * 3],obj.vertices[vi2 * 3 + 1],obj.vertices[vi2 * 3 + 2]

            vertices.set v0,triangleCount * 9
            vertices.set v1,triangleCount * 9 + 3
            vertices.set v2,triangleCount * 9 + 6

            n = do vec3.create
            vec3.sub v1,v1,v0
            vec3.sub v2,v2,v0
            vec3.cross n,v1,v2

            vec3.normalize n,n

            normals.set n,triangleCount * 9
            normals.set n,triangleCount * 9 + 3
            normals.set n,triangleCount * 9 + 6

            ++triangleCount

    return {
        vertices: vertices,
        normals: normals
    }
