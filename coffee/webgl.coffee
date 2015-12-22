do ->
    config = {
        objName: "./Marisa/untitled.obj",
        mtlName: "./Marisa/untitled.mtl"
    }

    fileCount = 0

    window.onload = () ->
        callback = () ->
            fileCount--
            if fileCount == 0
                do initialize
            return
        loadFile config.objName,"obj",callback
        loadFile config.mtlName,"mtl",callback

    files = {}
    loadFile = (url,name,callback) ->
        fileCount++
        xhr = new XMLHttpRequest()
        xhr.onreadystatechange = () ->
            if xhr.readyState == 4
                files[name] = xhr.responseText
                do callback

        xhr.open "GET",url,true
        xhr.send ""


    gl = null
    prog = null
    glObj = null
    initialize = () ->
        obj = objParser.objParse files.obj
        mtl = objParser.objParse files.mtl

        glObj = objParser.createGLObject obj,mtl

        canvas = document.getElementById 'canvas'
        gl = canvas.getContext 'experimental-webgl' || canvas.getContext 'webgl'

        if !gl
            document.write 'This browser does not support webgl'
            return

        # compile the vertex shader
        vs = gl.createShader(gl.VERTEX_SHADER)
        gl.shaderSource(vs,document.getElementById('vs').text)
        gl.compileShader(vs)

        if !gl.getShaderParameter(vs,gl.COMPILE_STATUS)
            console.log 'Vertex shader compile error'
            console.log gl.getShaderInfoLog(vs)
            return

        # compile the fragment shader
        fs = gl.createShader(gl.FRAGMENT_SHADER)
        gl.shaderSource(fs,document.getElementById('fs').text)
        gl.compileShader(fs)

        if !gl.getShaderParameter(fs,gl.COMPILE_STATUS)
            console.log 'Fragment shader compile error'
            console.log gl.getShaderInfoLog(fs)
            return

        # link the shaders
        prog = gl.createProgram()
        gl.attachShader(prog,vs)
        gl.attachShader(prog,fs)
        gl.linkProgram(prog)

        if !gl.getProgramParameter(prog,gl.LINK_STATUS)
            console.log 'link error'
            console.log gl.getShaderInfoLog(fs)
            return

        # use the linked program
        gl.useProgram prog
        do loadBuffer
        do drawFrame

        return

    vbuf = null # A buffer for vertex coordinates
    nbuf = null # A buffer for normal vectors
    loadBuffer = () ->
        #頂点座標に関し、バッファを生成してデータを指定
        vbuf = do gl.createBuffer
        gl.bindBuffer gl.ARRAY_BUFFER,vbuf
        gl.bufferData gl.ARRAY_BUFFER,glObj.vertices,gl.STATIC_DRAW

        nbuf = do gl.createBuffer
        gl.bindBuffer gl.ARRAY_BUFFER,nbuf
        gl.bufferData gl.ARRAY_BUFFER,glObj.normals,gl.STATIC_DRAW

    frame = 0
    drawFrame = () ->
        frame++
        proj_mat = do mat4.create
        mat4.frustum proj_mat,-1,1,-1,1,3,10

        mv_mat = do mat4.create
        mat4.translate mv_mat,mv_mat,[0,-2,-7]
        mat4.rotate mv_mat,mv_mat,frame * 0.01 ,[0,1,0]

        gl.uniformMatrix4fv gl.getUniformLocation(prog,"projectionMatrix"),false,proj_mat
        gl.uniformMatrix4fv gl.getUniformLocation(prog,"modelviewMatrix"),false,mv_mat

        gl.clearColor 0,0,0,1
        gl.clear gl.COLOR_BUFFER_BIT || gl.DEPTH_BUFFER_BIT
        gl.enable gl.DEPTH_TEST

        vpos = gl.getAttribLocation prog,"vertex"
        npos = gl.getAttribLocation prog,"normal"

        gl.bindBuffer gl.ARRAY_BUFFER,vbuf
        gl.vertexAttribPointer vpos,3,gl.FLOAT,false,0,0
        gl.enableVertexAttribArray vpos

        gl.bindBuffer gl.ARRAY_BUFFER,nbuf
        gl.vertexAttribPointer npos,3,gl.FLOAT,true,0,0
        gl.enableVertexAttribArray npos

        pos = 0

        for i in [0...glObj.mtlInfos.length]
            mtlInfo = glObj.mtlInfos[i]

            gl.uniform3fv gl.getUniformLocation(prog,"kdcolor"),mtlInfo.kd
            gl.uniform3fv gl.getUniformLocation(prog,"kscolor"),mtlInfo.ks
            gl.uniform1f gl.getUniformLocation(prog,"nscolor"),mtlInfo.ns

            gl.drawArrays gl.TRIANGLES,pos / 3,(mtlInfo.endPos - pos) / 3
            pos = mtlInfo.endPos

        setTimeout drawFrame,16


    return
