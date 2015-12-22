@objParser = {}

objParser.mtlParse = (text) ->
    mtl = {}
    current = null

    addCurrent = () ->
        if current
            mtl[current.name] = current
        current = {}

    lines = text.split '\n'

    for i in [0...lines.length]
        line = lines[i]
        words = line.split(' ')

        switch words[0]
            when 'newmtl'
                do addCurrent
                current.name = words[1]
            when 'Kd'
                current.kd = vec3.fromValues +words[1],+words[2],+words[3]
            when 'Ks'
                current.ks = vec3.fromValues +words[1],+words[2],+words[3]
            when 'Ns'
                current.ns = +words[1]
            when 'map_Kd'
                current.texture = words[1]


    do addCurrent
    return mtl


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

                    face.push {vindex:vindex,tindex:tindex,nindex:nindex,mtlName:mtlName}

                faces.push(face)

            else

    return {
        vertices: vertices,
        normals: normals,
        texcoords: texcoords,
        faces: faces
    }

objParser.createGLObject = (obj,mtl) ->
    # ポリゴンの枚数を特定する
    numTriangles = 0
    for i in [0...obj.faces.length]
        numTriangles += obj.faces[i].length - 2

    vertices = new Float32Array numTriangles * 9

    normals = new Float32Array numTriangles * 9

    #頂点ごとに法線ベクトルの和用配列
    normalAtVertex = new Array numTriangles * 3
    #頂点ごとの法線ベクトルの計算用関数
    addNormal = (index,n) ->
        if !normalAtVertex[index]
            normalAtVertex[index] = vec3.clone n
            return
        else
            normal = normalAtVertex[index]
            vec3.add normal,normal,n
        return

    currentMtlName = ""
    mtlInfos = []

    saveMtlInfo = () ->
        if !mtl
            mtlInfos.push {
                endPos: triangleCount * 9
                kd: vec3.fromValues 0.5,0.5,0.5
                ks: vec3.fromValues 0.0,0.0,0.0
                ns: 1
            }
        else if currentMtlName
            mtlInfos.push {
                endPos: triangleCount * 9
                kd: mtl[currentMtlName].kd
                ks: mtl[currentMtlName].ks
                ns: mtl[currentMtlName].ns
            }


    triangleCount = 0

    for i in [0...obj.faces.length]
        face = obj.faces[i]

        if currentMtlName != face[0].mtlName
            do saveMtlInfo
            currentMtlName = face[0].mtlName

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

            addNormal vi0,n
            addNormal vi1,n
            addNormal vi2,n

            ++triangleCount

    do saveMtlInfo

    triangleCount = 0
    for i in [0...obj.faces.length]
        face = obj.faces[i]
        for j in [1...face.length - 1]
            vi0 = face[0].vindex - 1
            vi1 = face[j].vindex - 1
            vi2 = face[j+1].vindex - 1

            n0 = normalAtVertex[vi0]
            n1 = normalAtVertex[vi1]
            n2 = normalAtVertex[vi2]

            vec3.normalize n0,n0
            vec3.normalize n1,n1
            vec3.normalize n2,n2

            normals.set n0,triangleCount * 9
            normals.set n1,triangleCount * 9 + 3
            normals.set n2,triangleCount * 9 + 6

            ++triangleCount

    return {
        vertices: vertices,
        normals:normals,
        mtlInfos:mtlInfos
    }
