do ->
    window.onload = () ->
        initialize
        return

    gl = null
    prog = null
    initialize = () ->
        canvas = document.getElementById 'canvas'
        gl = canvas.getContext 'experimental-webgl' || canvas.getContext 'webgl'

        if !gl
            document.write 'This browser does not support webgl'
            return

        vs = gl.createShader(gl.VERTEX_SHADER)
        gl.shaderSource(vs,document.getElementById('vs').text)
        gl.compileShader(vs)

        if !gl.getShaderParameter(vs,gl.COMPILE_STATUS)
            console.log 'Vertex shader compile error'
            console.log gl.getShaderInfoLog(vs)
            return

        fs = gl.createShader(gl.FRAGMENT_SHADER)
        gl.shaderSource(fs,document.getElementById('fs').text)
        gl.compileShader(fs)

        if !gl.getShaderParameter(fs,gl.COMPILE_STATUS)
            console.log 'Fragment shader compile error'
            console.log gl.getShaderInfoLog(fs)
            return

        prog = gl.createProgram()
        gl.attachShader(prog,vs)
        gl.attachShader(prog,fs)
        gl.linkProgram(prog)

        if !gl.getProgramParameter(prog,gl.LINK_STATUS)
            console.log 'link error'
            console.log gl.getShaderInfoLog(fs)
            return

        # use linked program
        gl.useProgram prog
        do loadBuffer
        do drawFrame

        return

    vbuf = null
    nbuf = null
    loadBuffer = () ->
        #頂点座標に関し、バッファを生成してデータを指定
        vbuf = do gl.createBuffer
        gl.bindBuffer gl.ARRAY_BUFFER,vbuf
        gl.bufferData gl.ARRAY_BUFFER,new Float32Array([-0.5,-0.5,0,0.5,-0.5,0,0.5,0.5,0]),gl.STATIC_DRAW



    return
