// webgpu-ca.js

const global = typeof window !== 'undefined' ? window : null;
const ssr = global === null;

// Save a couple of long function names that are used frequently.
// This optimization saves around 400 bytes.
const addEventListener = 'addEventListener';
const removeEventListener = 'removeEventListener';
const getBoundingClientRect = 'getBoundingClientRect';

// CellularAutomataConfig class definition      //used:  https://highlight.hohli.com/?theme=github
class EZWG {


    static ALL_ZERO = 0
    static ALL_RANDS = 1
    static ALL_BINS = 2

    constructor( config = {}) {
 

        // Define default values
        const defaults = {
            BUFFER_TYPE: 'f32',
            STORAGE_TYPE: 'f32',
            CELL_VALS: 1,
            CHUNK_SIZE: 64,
            CHUNKS_ACROSS: 1,
            PARTS_ACROSS: 1,
            READ_BACK_FREQ: -1,
            CONTAINER_ID: 'putcahhere',
            RAND_SEED: 's'+Date.now() + "L" + Math.random(),
            STARTING_CONFIG: EZWG.ALL_ZERO,
            COMPUTE_WGSL: '',
            FRAGMENT_WGSL: '',
            BY_PIXEL: false,    // if this is true run the fragment shader from the perspective of each pixel instead of WidthxHeightxTriangles
            READ_BACK_FUNC: ( currentStep, entireBuffer ) => {},
            CELL_SIZE: 8,
            //  experimental right now 
                FRAG_PIXEL_MODE: false, // if true, it's a fragment shader, and every pixel gets the fragment code run on it
                //FRAG_PIXEL_PER_COMP: 1,  // how many pixels per comp used in FRAG MODE ONLY 
            STORAGE: null,//(new Float32Array(0)),
            WORKGROUP_SIZE: 5,      // normally i leave it at 8 but it causes this weird flashing bug sometimes - could be a WebGPU bug
            STARTING_BUFFER: []     // if it's empty it will make a default random or all zeros or something
        };

        // Overrider 
 
        // Merge defaults with the provided config
        this.config = { ...defaults, ...config };
 
        // Assign values to instance variables with type checks
        this.BUFFER_TYPE = this.config.BUFFER_TYPE;
        this.STORAGE_TYPE = this.config.STORAGE_TYPE;
        // this.STORAGE_TYPE = ''+this.BUFFER_TYPE;

        this.CELL_VALS = this._validatePositiveInteger(this.config.CELL_VALS, 'CELL_VALS');
        this.CHUNK_SIZE = this._validatePositiveInteger(this.config.CHUNK_SIZE, 'CHUNK_SIZE');
        this.CHUNKS_ACROSS = this._validatePositiveInteger(this.config.CHUNKS_ACROSS, 'CHUNKS_ACROSS');
        this.PARTS_ACROSS = this._validatePositiveInteger(this.config.PARTS_ACROSS, 'PARTS_ACROSS');
        this.READ_BACK_FREQ = this._validateInteger(this.config.READ_BACK_FREQ, 'READ_BACK_FREQ');
        this.CONTAINER_ID = this._validateNonEmptyString(this.config.CONTAINER_ID, 'CONTAINER_ID');
        this.RAND_SEED = this._validateNonEmptyString(this.config.RAND_SEED, 'RAND_SEED');
        this.STARTING_CONFIG = this._validateInteger(this.config.STARTING_CONFIG, 'STARTING_CONFIG');
        this.COMPUTE_WGSL = this._validateString(this.config.COMPUTE_WGSL, 'COMPUTE_WGSL');
        this.FRAGMENT_WGSL = this._validateString(this.config.FRAGMENT_WGSL, 'FRAGMENT_WGSL');
        this.READ_BACK_FUNC = this.config.READ_BACK_FUNC;
        this.CELL_SIZE = this._validatePositiveInteger(this.config.CELL_SIZE, 'CELL_SIZE');
        
        this.FRAG_PIXEL_MODE =  this.config.FRAG_PIXEL_MODE;
            this.FRAG_PIXEL_PER_COMP = 1;   // defualt is 1 and it's not specifiable from the constructor it gets generated
        // If it's not an EVEN fit of parts into cell size then make a noise about it cause it's weird
        if( this.FRAG_PIXEL_MODE ){
            // 
            if( this.CELL_SIZE % this.PARTS_ACROSS !== 0 ){
                throw new Error("when in FRAG_PIXEL_MODE: this.PARTS_ACROSS does not fit evenly in this.CELL_SIZE | " + this.PARTS_ACROSS + " " + this.CELL_SIZE)
            }
            else{
                this.FRAG_PIXEL_PER_COMP = Math.floor( this.CELL_SIZE / this.PARTS_ACROSS );
                if( this.FRAG_PIXEL_PER_COMP !== 1){
                    //throw new Error("ummm zoom wouldnt really work if this was anything other than 1 | this.FRAG_PIXEL_PER_COMP: " + this.FRAG_PIXEL_PER_COMP + " ")
                }
            }
        }
        else{
            //throw new Error("This version of ewzgpu needs fragment mode now... | this.FRAG_PIXEL_MODE: " + this.FRAG_PIXEL_MODE + " ")
        }

        //this.FRAG_PIXEL_PER_COMP = this._validatePositiveInteger(this.config.FRAG_PIXEL_PER_COMP, 'FRAG_PIXEL_PER_COMP');

        this.STORAGE = this.config.STORAGE;         //this._validateArray(this.BUFFER_TYPE, this.config.STORAGE, 'STORAGE');
        this.WORKGROUP_SIZE = this._validatePositiveInteger(this.config.WORKGROUP_SIZE, 'WORKGROUP_SIZE');


        // OVerride for safe execution


        this.STARTING_BUFFER = this.config.STARTING_BUFFER;
        this.STORAGE_SIZE = this.STORAGE ? this.STORAGE.length : 0;     // this._validatePositiveInteger(this.config.STORAGE_SIZE, 'STORAGE_SIZE');

        
 
        // if(this.STORAGE.length < 2){
        //     this.STORAGE; 
        //     if( this.BUFFER_TYPE === 'f32' ){
        //         this.STORAGE = new Float32Array( this.STORAGE_SIZE)
        //         if( this.STARTING_CONFIG === EZWG.ALL_RANDS){
        //             this.initTheInitialCellStateAllRand( this.cellStateArray, this.RAND_SEED, this.GRID_SIZE );
        //         }
        //         else if( this.STARTING_CONFIG === EZWG.ALL_BINS){
        //             this.initTheInitialCellStateAllRandBins( this.cellStateArray, this.RAND_SEED, this.GRID_SIZE );
        //         }
        //         else{//if( this.STARTING_CONFIG === EZWG.ALL_ZERO){
        //             this.initTheInitialCellStateAllZeros( this.cellStateArray, this.RAND_SEED, this.GRID_SIZE );
        //         }
        //     }
        //     // U32 disabled for now but we gotta get back to this
        //     else if( this.BUFFER_TYPE === 'u32' && false){
        //         this.STORAGE = new Uint32Array( this.STORAGE_SIZE );//[1.0, 1.0, 1.0, 1.0 ]); 
        //     } 
        //     for(let v = 0;v < this.STORAGE.length;v++){ 
        //         if(v < this.STORAGE_SIZE ) {
        //             this.STORAGE[v] = this.random();
        //         }
        //         else if(true){
        //             this.STORAGE[v] = this.random();
        //         }
        //     }
        // }


        // Game time specific variables
        //128 x 128
        this.GRID_SIZE = (this.CHUNK_SIZE * this.CHUNKS_ACROSS);

        // Render mode
        // this.render_canv_w = this.GRID_SIZE * this.CELL_SIZE;
        // this.render_canv_h = this.GRID_SIZE * this.CELL_SIZE;

        let goodArea = -1;
        for(let n = 2;n < 9;n++){
            if( this.GRID_SIZE % n === 0 ){
                goodArea = n;
            }
        }
        if( goodArea < 0 ){
            throw new Error("no good owkrpgrup size could be foind for GRID_SIZE: "+ this.GRID_SIZE)
        }
        else{
            this.WORKGROUP_SIZE = goodArea
        }


        this.TOTAL_CELLS = this.GRID_SIZE * this.GRID_SIZE;
        this.UPDATE_INTERVAL = 45;

        this.USER_INPUT_BUFFER_SIZE = 8*8;

        this.loaded = false;
        this.READ_BUFFER_BUSY = false;
        this.step = 0;
        this.suicide = false;

        this.canvas = null;
        this.context = null;


        this.userInputTempStorage = null;
        this.userIn_uniformBuffer = null;
        this.simulationPipeline = null;
        this.bindGroups = [];

        this.cellStateArray = [];

        this.device = null;
        this.cellPipeline = null;
        this.vertexBuffer = null;
        this.vertices = [];              // will end up being the square you draw over and over again (TODO look and see if drawing 2 triangle everytime for each thing

        this.cellStateStorageForRead = [];

        this.cellStateStorage = [];

 

        this.CELL_STIM_LOCATIONS = 4;  


        // this.dragStartX = -1
        // this.dragStartY = -1
        // this.isDragging = false;
        // this.LAST_CELL_X = -1
        // this.LAST_CELL_Y = -1

        this.liveInput = ( new Float32Array( this.USER_INPUT_BUFFER_SIZE ) ).fill(0);
        this.liveInpuUniform = ( new Float32Array( this.USER_INPUT_BUFFER_SIZE ) ).fill(0);
        this.lastKeyDetected = '';
        this.ezweb = {
            isDragging: false,
            CELL_SIZE: this.CELL_SIZE,
            GRID_SIZE: this.GRID_SIZE,
            dragStartX: 0,
            dragStartY: 0,
            dragEndX: 0,
            dragEndY: 0,
            LAST_CELL_X: 0,
            LAST_CELL_Y: 0
          };
  
    }

    killdeath(){

        this.suicide = true;
        
        if (this.device) {
            this.vertexBuffer?.destroy();
            this.cellStateStorage?.forEach(buffer => buffer?.destroy());
            this.userInputTempStorage?.destroy();
            this.userIn_uniformBuffer?.destroy();
            this.cellStateStorageForRead?.destroy();
            this.device = null;
            this.context = null;

            // Remove canvas
            if (this.canvas && this.canvas.parentNode) {
                this.canvas.parentNode.removeChild(this.canvas);
            }
        }
    }

    async init() {
        if (!('gpu' in navigator)) {
            document.addEventListener('DOMContentLoaded', () => this._createNoWebGPUCanvas());
        }
        else{
            await this.getInsideThere()
        }
        // Additional initialization logic for WebGPU compatible environments
    }

    // Method to validate positive integers
    _validatePositiveInteger(value, propertyName) {
        if (typeof value !== 'number' || !Number.isInteger(value) || value <= 0) {
            throw new Error(`${propertyName} must be a positive integer`);
        }
        return value;
    }
    // Method to validate positive integers
    _validateInteger(value, propertyName) {
        if ( !Number.isInteger(value) ) {
            throw new Error(`${propertyName} must be a   integer`);
        }
        return value;
    }
    // Method to validate non-empty strings
    _validateNonEmptyString(value, propertyName) {
        if (typeof value !== 'string' || value.trim().length === 0) {
            throw new Error(`${propertyName} must be a non-empty string`);
        }
        return value;
    }
    // Method to validate non-empty strings
    _validateString(value, propertyName) {
        if (typeof value !== 'string' ) {
            throw new Error(`${propertyName} must be a non-empty string`);
        }
        return value;
    }
    // Method to validate array
    _validateArray(bufrtype, value, propertyName) {
        if( bufrtype === 'f32'){
            if ( value instanceof Float32Array ) {
                throw new Error(`${propertyName} must be an array of f32 val`);
            }
        }
        else if( bufrtype === 'u32' ){
            if ( value instanceof Uint32Array ) {
                throw new Error(`${propertyName} must be an array of u32 val`);
            }
        }
        return value;
    }


    // Method to create a canvas if WebGPU is not supported
    _createNoWebGPUCanvas() {
        this.canvas = document.createElement('canvas');
        this.canvas.width = 400;
        this.canvas.height = 400;
        document.body.appendChild(this.canvas);
        this.context = this.canvas.getContext('2d');
        this.context.fillStyle = 'gray';
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.context.font = `${20}px Arial`;

        let offsetX = 0;
        let offsetY = 0;

        document.getElementById(this.CONTAINER_ID).appendChild( this.canvas )
        
        setInterval(
            ((wobj) => {
                
                const text = 'no web gpu detected';
                const fontSize = 300;
                wobj.context.clearRect(0, 0, wobj.canvas.width, wobj.canvas.height);
                wobj.context.fillStyle = 'gray';
                wobj.context.fillRect(0, 0, wobj.canvas.width, wobj.canvas.height);
    
                function pseudoRandom(x, y, t) {
                    // A simple pseudo-random function
                    return Math.sin(x * 12.9898 + y * 78.233 + t * 0.5) * 43758.5453 % 1;
                }
                
                for (let i = 0; i < wobj.canvas.height / fontSize; i++) {
                    for (let j = 0; j < wobj.canvas.width / fontSize; j++) {
                        const pulse = Math.sin((wobj.step + (i + j) * 100) / 500) * 0.5 + 0.5;
                        wobj.context.fillStyle = `rgba(255, 0, 0, ${pulse})`;
                
                        const angle = (wobj.step / 1000) % (2 * Math.PI);
                        
                        // Add deterministic randomness
                        const offsetX = (pseudoRandom(i, j, wobj.step) - 0.5) * 10; // Adjust the multiplier for more/less spread
                        const offsetY = (pseudoRandom(i + 1, j + 1, wobj.step) - 0.5) * 10; // Adjust the multiplier for more/less spread
                
                        const x = j * fontSize + offsetX;
                        const y = i * fontSize + fontSize + offsetY;
                
                        wobj.context.save();
                        wobj.context.translate(x, y);
                        wobj.context.rotate(angle);
                        wobj.context.fillText(text, -wobj.context.measureText(text).width / 2, 0);
                        wobj.context.restore();
                        wobj.step++
                    }
                }
                
    
                offsetX += 1;
                offsetY += 1;
                if (offsetX > wobj.canvas.width) offsetX = 0;
                if (offsetY > wobj.canvas.height) offsetY = 0; 
                
            })(this), 
             50 );

        //requestAnimationFrame(drawText);
    }

    // The loading logic, buckle up
    async getInsideThere(){

 
        // Navigator i guess?
        if (!navigator.gpu) {
            // document.getElementById("ucantplay").classList.remove("hidden");
            // document.getElementById("canvas2hide").classList.add("hidden");
            this._createNoWebGPUCanvas()
            throw new Error("WebGPU not supported on this browser.");
        }
        else{
            console.log('isogsodo')
        }

        const adapter = await navigator.gpu.requestAdapter();
        if (!adapter) {
            this._createNoWebGPUCanvas()
            throw new Error("No appropriate GPUAdapter found.");
        }
        else{
            console.log('is good')
        } 


 
        this.canvas = document.createElement('canvas'); 

        
		this.canvas.addEventListener('mousedown', this.handleMouseDown.bind(this));
        this.canvas.addEventListener('mouseup', this.handleMouseUp.bind(this));

        //this.canvas.addEventListener('keydown', this.handleKeyDown.bind(this));


		this.canvas.width = this.GRID_SIZE * this.CELL_SIZE;
		this.canvas.height = this.GRID_SIZE *  this.CELL_SIZE
		this.canvas.style.width = this.GRID_SIZE *  this.CELL_SIZE
		this.canvas.style.height = this.GRID_SIZE *  this.CELL_SIZE
        console.log(this.CONTAINER_ID)
        let daparent = document.getElementById(this.CONTAINER_ID)
        if( !daparent ) throw (new Error("The parent container with ID " + this.CONTAINER_ID+ "for EzWebGPU is not found"));
        daparent.appendChild(this.canvas)


 
		if (!adapter) { 
			throw new Error("No appropriate GPUAdapter found!!!!5545445");
		}
		this.device = await adapter.requestDevice(); 
		this.context = this.canvas.getContext("webgpu");
		const canvasFormat = navigator.gpu.getPreferredCanvasFormat();
		this.context.configure({
			device: this.device,
			format: canvasFormat,
		});

		const PUstructType = [
			{ name: "position", type: "vec3" },
			{ name: "color", type: "vec4" }
		];

        let smolr = 1
        if(this.FRAG_PIXEL_MODE){
            this.vertices = new Float32Array([  
                -smolr,     -smolr,  // Bottom-left
                smolr,      -smolr,  // Bottom-right
                -smolr,     smolr,  // Top-left
                -smolr,     smolr,  // Top-left
                smolr,      -smolr,  // Bottom-right
                smolr,      smolr,  // Top-right
             
            ]);
        }
        else{
            this.vertices = new Float32Array([ 
                // X,    Y
                //-1, -1, // Triangle 1
                //1, -1,
                //1,  1, 
                //-1, -1, // Triangle 2
                //1,  1,
                //-1,  1,
    
                -smolr*(1/this.PARTS_ACROSS), -smolr*(1/this.PARTS_ACROSS), // Triangle 1
                smolr*(1/this.PARTS_ACROSS), -smolr*(1/this.PARTS_ACROSS),
                smolr*(1/this.PARTS_ACROSS),  smolr*(1/this.PARTS_ACROSS), 
                -smolr*(1/this.PARTS_ACROSS), -smolr*(1/this.PARTS_ACROSS), // Triangle 2
                smolr*(1/this.PARTS_ACROSS),  smolr*(1/this.PARTS_ACROSS),
                -smolr*(1/this.PARTS_ACROSS),  smolr*(1/this.PARTS_ACROSS), 
            
                //// Front face
                //-1, -1, 1,  // Vertex 0
                //1, -1, 1,   // Vertex 1
                //1, 1, 1,    // Vertex 2
                //-1, 1, 1,   // Vertex 3 
                //// Right face
                //1, -1, 1,   // Vertex 4 (Same as Vertex 1 of Front face)
                //1, -1, -1,  // Vertex 5
                //1, 1, -1,   // Vertex 6
                //1, 1, 1,    // Vertex 7 (Same as Vertex 2 of Front face) 
                //// Top face
                //-1, 1, 1,   // Vertex 8 (Same as Vertex 3 of Front face)
                //1, 1, 1,    // Vertex 9 (Same as Vertex 2 of Front face)
                //1, 1, -1,   // Vertex 10
                //-1, 1, -1,  // Vertex 11
            ]);
        }
        
		// SWUARE DEFINTION
		const vertexBufferLayout = {
			arrayStride: 8,//  2 x 4 byte coordinates = 8
			attributes: [{
				format: "float32x2",//"uint16x4"  <- another possible config
				offset: 0,
				shaderLocation: 0, // Position. Matches @location(0) in the @vertex shader.
			}],
		};
		this.vertexBuffer = this.device.createBuffer({
			label: "Cell this.vertices",
			size: this.vertices.byteLength,
			usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
		});
		this.device.queue.writeBuffer( this.vertexBuffer, /*buffer offset :o*/0, this.vertices );
 














        // Create the bind group layout and pipeline layout.
		const bindGroupLayout = this.device.createBindGroupLayout({
			label: "Cell Bind Group Layout",
			entries: [
				{
					binding: 0,
					visibility: GPUShaderStage.VERTEX | GPUShaderStage.COMPUTE | GPUShaderStage.FRAGMENT,
					buffer: {} // Grid uniform buffer
				}, 
				{
					binding: 1,
					visibility: GPUShaderStage.VERTEX | GPUShaderStage.COMPUTE | GPUShaderStage.FRAGMENT,
					buffer: { type: "read-only-storage" } // Cell state input buffer
				}, 
				{
					binding: 2,
					visibility: GPUShaderStage.COMPUTE,
					buffer: { type: "storage" } // Cell state output buffer
				}, 
				{
					binding: 3,
					visibility: GPUShaderStage.COMPUTE | GPUShaderStage.FRAGMENT,
					buffer: { type: "storage" } // user input
				}, 
				{
					binding: 4,
					visibility: GPUShaderStage.VERTEX | GPUShaderStage.COMPUTE | GPUShaderStage.FRAGMENT,
					buffer: { type: "read-only-storage" } // large static block of config numbers
				},{
                    binding: 5,
                    visibility: GPUShaderStage.VERTEX | GPUShaderStage.COMPUTE | GPUShaderStage.FRAGMENT, // Make sure the visibility includes VERTEX
                    buffer: { type: "uniform" } // Change from 'storage' to 'uniform'
                }
                //,
				//{
				//	binding: 5,
				//	visibility: GPUShaderStage.COMPUTE,
				//	buffer: { type: "storage" } // Cell state output buffer
				//}
			]
		});

		const pipelineLayout = this.device.createPipelineLayout({
			label: "Cell Pipeline Layout",
			bindGroupLayouts: [ bindGroupLayout ],
		});

        var cellShaderWSGL = '';
        
        // Normal vertices (clunky)


                // TODO the CURRENT_ZOOM  DOES NOT EFFECT VERTEX MODE 

        if( !this.FRAG_PIXEL_MODE ){
            cellShaderWSGL = `
                struct VertexOutput {
                    @builtin(position) position: vec4f,
                    @location(0) cell: vec2f,
                    @location(1) red: f32,
                    @location(2) grn: f32,
                    @location(3) blu: f32
                };

                @group(0) @binding(0) var<uniform> grid: vec2f;
                @group(0) @binding(1) var<storage> EZ_STATE_IN: array<${this.BUFFER_TYPE}>;
                @group(0) @binding(3) var<storage, read_write> EZ_USER_INPUT: array<f32>;
                @group(0) @binding(4) var<storage> EZ_STORAGE: array<${this.STORAGE_TYPE}>;
                //@group(0) @binding(5) var<uniform> EZ_USER_INPUT_UNFM: array<f32>;

                // Confines to a chunk location
                fn EZ_helper_cellIndexChkRel(cell: vec2u, ogcx: u32, ogcy: u32, chk: u32) -> u32 {
                    var nuCellX: u32 = cell.x + (ogcx*chk);
                    var nuCellY: u32 = cell.y + (ogcy*chk);
                    return ((nuCellY+u32(grid.y)) % u32(grid.y)) * u32(grid.x) + ((nuCellX+u32(grid.x)) % u32(grid.x));
                }

                // Use any X,Y, deltaX, deltaY, attribute
                fn EZ_CELL_VAL(x: u32, dx: i32, y: u32, dy: i32, att: u32 ) -> ${this.BUFFER_TYPE} {
                    var eex: u32 = u32(( i32(x) + dx) + ${this.CHUNK_SIZE}) % ${this.CHUNK_SIZE};
                    var eey: u32 = u32(( i32(y) + dy) + ${this.CHUNK_SIZE}) % ${this.CHUNK_SIZE};
                    var ocxx: u32 = u32( x / ${this.CHUNK_SIZE} );
                    var ocyy: u32 = u32( y / ${this.CHUNK_SIZE} );
                    return EZ_STATE_IN[ att * u32( grid.x * grid.y ) + EZ_helper_cellIndexChkRel( vec2( eex, eey ), ocxx, ocyy, ${this.CHUNK_SIZE}u )  ];
                }

                
                fn EZ_RAND( seed: u32 ) -> f32 {
                    let a: u32 = 1664525u;
                    var c: u32 = 1013904223u;
                    c = a * seed + c;
                    return f32(c & 0x00FFFFFFu)  / f32(0x01000000u);
                }
                fn EZ_U32_TO_VEC4(value: u32) -> vec4<u32> {
                    // Extract each byte using bitwise operations
                    let byte0: u32 = (value & 0x000000FF);
                    let byte1: u32 = (value >> 8) & 0x000000FF;
                    let byte2: u32 = (value >> 16) & 0x000000FF;
                    let byte3: u32 = (value >> 24) & 0x000000FF;
                
                    // Return as a vector
                    return vec4<u32>(byte0, byte1, byte2, byte3);
                }
                    
                fn EZ_VEC4_TO_U32(v: vec4<u32>) -> u32 {
                    // Combine the bytes using bitwise operations
                    let combined: u32 =
                        (v.x & 0x000000FF) |
                        ((v.y & 0x000000FF) << 8) |
                        ((v.z & 0x000000FF) << 16) |
                        ((v.w & 0x000000FF) << 24);

                    // Return the packed u32 value
                    return combined;
                }

                @vertex
                fn vertexMain(@location(0) position: vec2f, @builtin(instance_index) EZ_INSTANCE: u32) -> VertexOutput {
                    var EZ_OUTPUT: VertexOutput;
                    
                    var i = f32(EZ_INSTANCE);
                    let EZ_PARTS_ACROSS_F: f32 = ${this.PARTS_ACROSS}f;
                    let caWu: u32 = ${this.PARTS_ACROSS}u;

                    const EZ_CELL_VALS: u32 = ${this.CELL_VALS}u;
                    const CHUNKS_ACROSS: u32 = ${this.CHUNKS_ACROSS}u;
                    const EZ_CHUNK_SIZE: u32 = ${this.CHUNK_SIZE}u;
                    var EZ_FRAG_PPC: u32 = ${this.FRAG_PIXEL_PER_COMP}u;  //FRAG_PIXEL_PER_COMP
                    let EZ_CELLS_ACROSS_X: u32 = u32( grid.x );
                    let EZ_CELLS_ACROSS_Y: u32 = u32( grid.y );
                    let EZ_TOTAL_CELLS = EZ_CELLS_ACROSS_X * EZ_CELLS_ACROSS_Y;

                    // Global grid counting each component as a cell
                        // now used in another context
                    // var EZ_RAW_COL: u32 = EZ_INSTANCE % (EZ_CELLS_ACROSS_X * caWu);
                    // var EZ_RAW_ROW: u32 = EZ_INSTANCE / (EZ_CELLS_ACROSS_Y * caWu); 
                    
                    var EZ_RAW_COL: u32 = EZ_INSTANCE % (EZ_CELLS_ACROSS_X * caWu);             // TODO the CURRENT_ZOOM in stimmings doesn't effect this one
                    var EZ_RAW_ROW: u32 = EZ_INSTANCE / (EZ_CELLS_ACROSS_Y * caWu); 
                    
                    let EZ_CELL = vec2f( f32(EZ_RAW_COL / caWu), f32(EZ_RAW_ROW / caWu) );

                    var EZX: u32 = EZ_RAW_COL / caWu;
                    var EZY: u32 = EZ_RAW_ROW / caWu;
                    var EZ_CELL_IND: u32 = EZX + ( EZY * EZ_CELLS_ACROSS_X);

                    var EZ_CHUNK_X: u32 = EZX / EZ_CHUNK_SIZE;
                    var EZ_CHUNK_Y: u32 = EZY / EZ_CHUNK_SIZE;
                    var EZ_CHUNK_IND: u32 = (EZ_CHUNK_X  + EZ_CHUNK_Y * CHUNKS_ACROSS);
                    
                    // Cell coordinates relative to their respective chunk
                    var EZX_R = EZX % EZ_CHUNK_SIZE;
                    var EZY_R = EZY % EZ_CHUNK_SIZE;

                    //--------------------------------------------------------- Extra values for drawing

                    // Component metas
                    var EZ_COMP_X: u32 = EZ_RAW_COL % caWu;
                    var EZ_COMP_Y: u32 = EZ_RAW_ROW % caWu;
                    var EZ_COMP_IND: u32 = EZ_COMP_X + EZ_COMP_Y * caWu;

                    // Gets you to the center of the cell
                    let EZ_h_cellOffset: vec2f = EZ_CELL / grid * 2;
                    var EZ_h_pos = (position+1) / grid - 1 + EZ_h_cellOffset;

                    // Cell size 
                    var EZ_h_clsX: f32 = (1 / grid.x) * 2;
                    var EZ_h_clsY: f32 = (1 / grid.y) * 2;
                    var EZ_h_smlDx: f32 = (1/EZ_PARTS_ACROSS_F) * EZ_h_clsX;
                    var EZ_h_smlDy: f32 = (1/EZ_PARTS_ACROSS_F) * EZ_h_clsY;

                    EZ_h_pos.x = EZ_h_pos.x + (f32(EZ_COMP_X) * EZ_h_smlDx) - (EZ_h_clsX*0.5) + EZ_h_smlDx/2;   // TODO the CURRENT_ZOOM in stimmings doesn't effect this one
                    EZ_h_pos.y = EZ_h_pos.y + (f32(EZ_COMP_Y) * EZ_h_smlDy) - (EZ_h_clsY*0.5) + EZ_h_smlDy/2;

                    EZ_OUTPUT.position = vec4f(EZ_h_pos, 0, 1);
                    EZ_OUTPUT.cell = EZ_CELL / (grid*1);

                    

                    const EZ_cellParts: u32 = ${this.PARTS_ACROSS}u; 
                    
                    

                    ${this.FRAGMENT_WGSL}
                    

                    return EZ_OUTPUT;
                }

                @fragment
                fn fragmentMain(input: VertexOutput) -> @location(0) vec4f { 
                    return vec4f( input.red, input.grn, input.blu, 1);
                }

            `
        }

        
        // Potentially better pixel by pixel way on the fragment shader
        else{
            cellShaderWSGL = `
            
                struct VertexOutput {
                    @builtin(position) position: vec4f,
                };
                struct FragOutput {
                    @location(0) red: f32,
                    @location(1) grn: f32,
                    @location(2) blu: f32
                };
                
                @group(0) @binding(0) var<uniform> grid: vec2f;
                @group(0) @binding(1) var<storage> EZ_STATE_IN: array<${this.BUFFER_TYPE}>;
                @group(0) @binding(3) var<storage, read_write> EZ_USER_INPUT: array<f32>;
                @group(0) @binding(4) var<storage> EZ_STORAGE: array<${this.STORAGE_TYPE}>;
                //@group(0) @binding(5) var<uniform> EZ_USER_INPUT_UNFM: array<f32>;

                // Confines to a chunk location
                fn EZ_helper_cellIndexChkRel(cell: vec2u, ogcx: u32, ogcy: u32, chk: u32) -> u32 {
                    var nuCellX: u32 = cell.x + (ogcx*chk);
                    var nuCellY: u32 = cell.y + (ogcy*chk);
                    return ((nuCellY+u32(grid.y)) % u32(grid.y)) * u32(grid.x) + ((nuCellX+u32(grid.x)) % u32(grid.x));
                }

                // Use any X,Y, deltaX, deltaY, attribute
                fn EZ_CELL_VAL(x: u32, dx: i32, y: u32, dy: i32, att: u32 ) -> ${this.BUFFER_TYPE} {
                    var eex: u32 = u32(( i32(x) + dx) + ${this.CHUNK_SIZE}) % ${this.CHUNK_SIZE};
                    var eey: u32 = u32(( i32(y) + dy) + ${this.CHUNK_SIZE}) % ${this.CHUNK_SIZE};
                    var ocxx: u32 = u32( x / ${this.CHUNK_SIZE} );
                    var ocyy: u32 = u32( y / ${this.CHUNK_SIZE} );
                    return EZ_STATE_IN[ att * u32( grid.x * grid.y ) + EZ_helper_cellIndexChkRel( vec2( eex, eey ), ocxx, ocyy, ${this.CHUNK_SIZE}u )  ];
                }

                
                fn EZ_RAND( seed: u32 ) -> f32 {
                    let a: u32 = 1664525u;
                    var c: u32 = 1013904223u;
                    c = a * seed + c;
                    return f32(c & 0x00FFFFFFu)  / f32(0x01000000u);
                }

                fn EZ_U32_TO_VEC4(value: u32) -> vec4<u32> {
                    // Extract each byte using bitwise operations
                    let byte0: u32 = (value & 0x000000FF);
                    let byte1: u32 = (value >> 8) & 0x000000FF;
                    let byte2: u32 = (value >> 16) & 0x000000FF;
                    let byte3: u32 = (value >> 24) & 0x000000FF;
                
                    // Return as a vector
                    return vec4<u32>(byte0, byte1, byte2, byte3);
                }
                fn EZ_VEC4_TO_U32(v: vec4<u32>) -> u32 {
                    // Combine the bytes using bitwise operations
                    let combined: u32 =
                        (v.x & 0x000000FF) |
                        ((v.y & 0x000000FF) << 8) |
                        ((v.z & 0x000000FF) << 16) |
                        ((v.w & 0x000000FF) << 24);

                    // Return the packed u32 value
                    return combined;
                }


                @vertex
                fn vertexMain(@location(0) position: vec2f) -> VertexOutput {
                    var output: VertexOutput;
                    var translation = vec2<f32>(0.0f, 0.1f);    //EZ_USER_INPUT[9]
                    var transformedPosition = (position + translation) * 1f;//EZ_USER_INPUT_UNFM[9];

                    output.position = vec4f(transformedPosition, 0.0, 1.0);
                    return output;
                }

                @fragment
                fn fragmentMain(@builtin(position) fragCoord: vec4f) -> @location(0) vec4f {

                    var EZ_OUTPUT: FragOutput;
                     
                    let EZ_PARTS_ACROSS_F: f32 = ${this.PARTS_ACROSS}f;
                    let caWu: u32 = ${this.PARTS_ACROSS}u;      // used in the vertex mode 
                    var cFaWu: u32= ${this.PARTS_ACROSS*this.FRAG_PIXEL_PER_COMP}u;

                    const EZ_CELL_VALS: u32 = ${this.CELL_VALS}u;
                    const CHUNKS_ACROSS: u32 = ${this.CHUNKS_ACROSS}u;
                    const EZ_CHUNK_SIZE: u32 = ${this.CHUNK_SIZE}u;
                    var EZ_FRAG_PPC: u32 = ${this.FRAG_PIXEL_PER_COMP}u;  //FRAG_PIXEL_PER_COMP
                    var EZ_CELLS_ACROSS_X: u32 = CHUNKS_ACROSS * EZ_CHUNK_SIZE;
                    var EZ_CELLS_ACROSS_Y: u32 = CHUNKS_ACROSS * EZ_CHUNK_SIZE;
                    let EZ_TOTAL_CELLS = EZ_CELLS_ACROSS_X * EZ_CELLS_ACROSS_Y;

                    // Global grid counting each component as a cell
                    var EZ_RAW_COL: u32 = u32(floor(fragCoord.x)) / 1;                                  // TODO the CURRENT_ZOOM in stimmings doesn't effect the VERTEX version of this variable
                        // TODO this issue right here
                    var EZ_RAW_ROW: u32 = (EZ_CELLS_ACROSS_Y*cFaWu) - (u32(floor(fragCoord.y))/1) - 1u; 
                    
                    let EZ_CELL = vec2f( f32(EZ_RAW_COL / cFaWu), f32(EZ_RAW_ROW / cFaWu) );

                    var EZX: u32 = EZ_RAW_COL / cFaWu;
                    var EZY: u32 = EZ_RAW_ROW / cFaWu;
                    var EZ_CELL_IND: u32 = EZX + ( EZY * EZ_CELLS_ACROSS_X);

                    var EZ_CHUNK_X: u32 = EZX / EZ_CHUNK_SIZE;
                    var EZ_CHUNK_Y: u32 = EZY / EZ_CHUNK_SIZE;
                    var EZ_CHUNK_IND: u32 = (EZ_CHUNK_X  + EZ_CHUNK_Y * CHUNKS_ACROSS);
                    
                    // Cell coordinates relative to their respective chunk
                    var EZX_R = EZX % EZ_CHUNK_SIZE;
                    var EZY_R = EZY % EZ_CHUNK_SIZE;

                    // --------------------------------------------------------- Extra values for drawing

                    // Component metas
                    var EZ_COMP_X: u32 = (EZ_RAW_COL % cFaWu) / EZ_FRAG_PPC;
                    var EZ_COMP_Y: u32 = (EZ_RAW_ROW % cFaWu) / EZ_FRAG_PPC;
                    var EZ_COMP_IND: u32 = EZ_COMP_X + EZ_COMP_Y * (EZ_TOTAL_CELLS*caWu);
					
                    var EZ_cellParts: u32 = ${this.PARTS_ACROSS}u;
 
                    ${this.FRAGMENT_WGSL}
					
                    return vec4f(EZ_OUTPUT.red, EZ_OUTPUT.grn, EZ_OUTPUT.blu, 1.0);
                }

            `;
        }






















		// Create the shader that will render the cells.
		const cellShaderModule = this.device.createShaderModule({
			label: "Cell shader",
			code: cellShaderWSGL
		});

		// Create a pipeline that renders the cell.
		this.cellPipeline = this.device.createRenderPipeline({
			label: "Cell pipeline",
			layout: pipelineLayout,
			vertex: {
				module: cellShaderModule,
				entryPoint: "vertexMain",
				buffers: [ vertexBufferLayout ]
			},
			fragment: {
				module: cellShaderModule,
				entryPoint: "fragmentMain",
				targets: [ {
					format: canvasFormat
				} ]
			}
		});






















        let simulationWSGLCode = `
			@group(0) @binding(0) var<uniform> grid: vec2f;

			@group(0) @binding(1) var<storage> EZ_STATE_IN: array<${this.BUFFER_TYPE}>;
			@group(0) @binding(2) var<storage, read_write> EZ_STATE_OUT: array<${this.BUFFER_TYPE}>;
			@group(0) @binding(3) var<storage, read_write> EZ_USER_INPUT: array<f32>;
			@group(0) @binding(4) var<storage> EZ_STORAGE: array<${this.STORAGE_TYPE}>;
            //@group(0) @binding(5) var<uniform> EZ_USER_INPUT_UNFM: array<f32>;

            // Confines to entire grid space
			// fn EZ_helper_cellIndex(cell: vec2u) -> u32 {
			// 	return ((cell.y+u32(grid.y)) % u32(grid.y)) * u32(grid.x) + ((cell.x+u32(grid.x)) % u32(grid.x));
			// }

            // Confines to a chunk location
            fn EZ_helper_cellIndexChkRel(cell: vec2u, ogcx: u32, ogcy: u32, chk: u32) -> u32 {
                var nuCellX: u32 = cell.x + (ogcx*chk);
                var nuCellY: u32 = cell.y + (ogcy*chk);
				return ((nuCellY+u32(grid.y)) % u32(grid.y)) * u32(grid.x) + ((nuCellX+u32(grid.x)) % u32(grid.x));
			}

            // Use any X,Y, deltaX, deltaY, attribute
            
            fn EZ_CELL_VAL(x: u32, dx: i32, y: u32, dy: i32, att: u32 ) -> ${this.BUFFER_TYPE} {
                var eex: u32 = u32(( i32(x) + dx) + ${this.CHUNK_SIZE}) % ${this.CHUNK_SIZE};
                var eey: u32 = u32(( i32(y) + dy) + ${this.CHUNK_SIZE}) % ${this.CHUNK_SIZE};
                var ocxx: u32 = u32( x / ${this.CHUNK_SIZE} );
                var ocyy: u32 = u32( y / ${this.CHUNK_SIZE} );
                return EZ_STATE_IN[ att * u32( grid.x * grid.y ) + EZ_helper_cellIndexChkRel( vec2( eex, eey ), ocxx, ocyy, ${this.CHUNK_SIZE}u )  ];
            }

            // This old version still works somehow?
            // fn EZ_GET_CELL(x: u32, y: u32, att: u32, ocx: u32, ocy: u32 ) -> f32 {
			// 	  return EZ_STATE_IN[ att * u32( grid.x * grid.y ) + EZ_helper_cellIndexChkRel( vec2( (x+`+this.CHUNK_SIZE+`u)%`+this.CHUNK_SIZE+`u,(y+`+this.CHUNK_SIZE+`u)%`+this.CHUNK_SIZE+`u ), ocx, ocy, `+this.CHUNK_SIZE+`u )  ];
			// }
            
            fn EZ_RAND( seed: u32 ) -> f32 {
                let a: u32 = 1664525u;
                var c: u32 = 1013904223u;
                c = a * seed + c;
                return f32(c & 0x00FFFFFFu)  / f32(0x01000000u);
            }
            fn EZ_RAND_U( seed: u32 ) -> u32 {
                let a: u32 = 1664525u;
                let c: u32 = 1013904223u;
                var result: u32 = a * seed + c;
                result ^= result >> 16;
                return result;
                // let a: u32 = 1664525u;
                // var c: u32 = 1013904223u;
                // c = a * seed + c;
                // return (c & 0x00FFFFFFu);
            }

            fn EZ_RAND2ER(seed_f32: f32) -> f32 {
                // Transform the f32 seed into a u32-based seed
                let seed: u32 = abs(u32(seed_f32 * 1e7)) ^ 0xA5A5A5A5u;

                // Initialize parameters for a linear congruential generator (LCG)
                let a: u32 = 1664525u; // Multiplier
                let c: u32 = 1013904223u; // Increment
                var x: u32 = seed; // Current state

                // Apply several rounds of the LCG
                for (var i: u32 = 0u; i < 4u; i = i + 1u) {
                    x = a * x + c;
                    x = x ^ (x >> 15u); // XOR shift to scramble bits
                    x = x * 747796405u + 2891336453u; // Multiply-add to further mix
                }

                // Generate a floating-point random number in the range [0, 1)
                let result: f32 = f32(x & 0x00FFFFFFu) / f32(0x01000000u);

                // Add a sine-based perturbation for extra randomness
                let perturbation: f32 = sin(seed_f32 * 1.61803398875) * 0.5 + 0.5; // Map to [0, 1)
                return fract(result + perturbation); // Return a value between 0 and 1
            }


            fn EZ_BETTER_RAND(seed_f32: f32) -> f32 {
                var x: u32 = abs(u32(seed_f32 * 43758.5453)) ^ 0xA5A5A5A5u;

                // 4 rounds of bit scramblers
                x ^= (x >> 17u);
                x *= 0x85ebca6bu;
                x ^= (x >> 11u);
                x *= 0xc2b2ae35u;
                x ^= (x >> 15u);

                // Map to [0, 1)
                return f32(x & 0x00FFFFFFu) / f32(0x01000000u);
            }



            fn EZ_U32_TO_VEC4(value: u32) -> vec4<u32> {
                // Extract each byte using bitwise operations
                let byte0: u32 = (value & 0x000000FF);
                let byte1: u32 = (value >> 8) & 0x000000FF;
                let byte2: u32 = (value >> 16) & 0x000000FF;
                let byte3: u32 = (value >> 24) & 0x000000FF;
                // Return as a vector
                return vec4<u32>(byte0, byte1, byte2, byte3);
            }
            fn EZ_VEC4_TO_U32(vec: vec4<u32>) -> u32 {
                // Combine each byte into a single u32 value using bitwise operations
                let value: u32 = (vec.x & 0x000000FF) |
                    ((vec.y & 0x000000FF) << 8) |
                    ((vec.z & 0x000000FF) << 16) |
                    ((vec.w & 0x000000FF) << 24);
                return value;
            }


			@compute @workgroup_size( ${this.WORKGROUP_SIZE}, ${this.WORKGROUP_SIZE} )
			fn computeMain(@builtin(global_invocation_id) EZ_CELL: vec3u) {
                
                const EZ_CELL_VALS: u32  = ${this.CELL_VALS}u;
                const EZ_CHUNKS_ACROSS: u32 = ${this.CHUNKS_ACROSS}u;
                const EZ_CHUNK_SIZE: u32 = ${this.CHUNK_SIZE}u;
                let EZ_CELLS_ACROSS_X: u32 = u32( grid.x );
                let EZ_CELLS_ACROSS_Y: u32 = u32( grid.y );
                let EZ_TOTAL_CELLS = EZ_CELLS_ACROSS_X * EZ_CELLS_ACROSS_Y;
  
                let EZX = EZ_CELL.x;
                let EZY = EZ_CELL.y;                                //  old version
                let EZ_CELL_IND = EZX + ( EZY * EZ_CELLS_ACROSS_X); // EZ_helper_cellIndex(EZ_CELL.xy);
    
                // Chunk logic
                var EZ_CHUNK_X: u32 = EZX / EZ_CHUNK_SIZE;
                var EZ_CHUNK_Y: u32 = EZY / EZ_CHUNK_SIZE;
                var EZ_CHUNK_IND: u32 = EZ_CHUNK_X + EZ_CHUNK_Y*EZ_CHUNKS_ACROSS;

                // Cell coordinates relative to their respective chunk
                let EZX_R = EZX % EZ_CHUNK_SIZE;
                let EZY_R = EZY % EZ_CHUNK_SIZE;

                ${this.COMPUTE_WGSL}

				
			}
		`;
  
		// Create the compute shader that will process the game of life simulation.
		const simulationShaderModule = this.device.createShaderModule({
			label: "Life simulation shader",
			code: simulationWSGLCode
		});

		// Create a compute pipeline that updates the game state.
		this.simulationPipeline = this.device.createComputePipeline({
			label: "Simulation pipeline",
			layout: pipelineLayout,
			compute: {
				module: simulationShaderModule,
				entryPoint: "computeMain",
			}
		});

		// Create a uniform buffer that describes the grid.
		var uniformArray;
        //if( this.BUFFER_TYPE === 'f32' ){
        uniformArray = new Float32Array([ this.GRID_SIZE, this.GRID_SIZE ]);
        //}
        // else if(this.BUFFER_TYPE === 'u32'){
        //     //uniformArray = new Uint32Array([ this.GRID_SIZE, this.GRID_SIZE ]);
        // }
        // else{
        //     //throw new Error('Unkjnown buffer_type')
        // }
         
		const uniformBuffer = this.device.createBuffer({
			label: "Grid Uniforms",
			size: uniformArray.byteLength,
			usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
		});
		this.device.queue.writeBuffer( uniformBuffer, 0, uniformArray );


















		

		// Create an array representing the active state of each cell.
		let dbug_cell_state_buffer_info=false;
        
        if( this.BUFFER_TYPE === 'f32' ){
            this.cellStateArray = (new Float32Array( this.TOTAL_CELLS * this.CELL_VALS )).fill(0);
        }
        else if(this.BUFFER_TYPE === 'u32'){
            this.cellStateArray = (new Uint32Array( this.TOTAL_CELLS * this.CELL_VALS )).fill(0);
        }
        else{
            throw new Error('Unkjnown BUFFER_TYPE: '+ this.BUFFER_TYPE)
        }
		if(dbug_cell_state_buffer_info)console.log('seeed', this.RAND_SEED);
		if(dbug_cell_state_buffer_info)console.log('this.cellStateArray.byteLength', this.cellStateArray.byteLength);
		if(dbug_cell_state_buffer_info)console.log('4 bytes times:', this.CELL_VALS );
		if(dbug_cell_state_buffer_info)console.log('Grid length', this.GRID_SIZE);
		if(dbug_cell_state_buffer_info)console.log('Total cells ', this.TOTAL_CELLS);

		// Create two storage buffers to hold the cell state.
		this.cellStateStorage = [
			this.device.createBuffer({
				label: "Cell State A",
				size: this.cellStateArray.byteLength,
				usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST | GPUBufferUsage.COPY_SRC,
			}),
			this.device.createBuffer({
				label: "Cell State B",
				size: this.cellStateArray.byteLength,
				usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST | GPUBufferUsage.COPY_SRC, //GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
			})
		];

		//0-mouseX pos, 1-mouseY pos, 2- special inst, 3-specialinst
        // This the one that gets changed on the CPU side and is red in
        //this.liveInput = ( new Float32Array( this.USER_INPUT_BUFFER_SIZE ) ).fill(0);
		this.userInputTempStorage = 
			this.device.createBuffer({
				label: "Temp User Input 1",
				size: this.liveInput.byteLength,
				usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
			});
		this.device.queue.writeBuffer( this.userInputTempStorage, 0, this.liveInput );

 
        this.userIn_uniformBuffer = 
            this.device.createBuffer({
            label: "User Input uniform",
            size: this.liveInpuUniform.byteLength,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        });
        // Write data to the uniform buffer
        this.device.queue.writeBuffer(this.userIn_uniformBuffer, 0, this.liveInpuUniform);



















        // console.log(this.STORAGE)


        let finalStorageArray = null;

        // If you specified a storage
        if( this.STORAGE_SIZE > 0 ){
            if( this.STORAGE_TYPE === 'f32' ){
                finalStorageArray = new Float32Array( this.STORAGE );//new Float32Array( this.STORAGE_SIZE );
                // for(let b = 0;b < this.STORAGE_SIZE;b++){
                //     finalStorageArray[b] = this.STORAGE[b];
                // }
            }
            else if( this.STORAGE_TYPE === 'u32' ){
                finalStorageArray = new Uint32Array( this.STORAGE );//new Uint32Array( this.STORAGE_SIZE );
                // for(let b = 0;b < this.STORAGE_SIZE;b++){
                //     finalStorageArray[b] = this.STORAGE[b];
                // }
            }
        }
        else{
            this.STORAGE_SIZE = 1;
            if( this.STORAGE_TYPE === 'f32' ){
                finalStorageArray = new Float32Array( 1 );
            }
            else if( this.STORAGE_TYPE === 'u32' ){
                finalStorageArray = new Uint32Array( 1 );
            }
        }

        
        
		const extraConfigStorage = 
			this.device.createBuffer({
				label: "Extra config sotrage",
				size: finalStorageArray.byteLength,
				usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
			});
		this.device.queue.writeBuffer( extraConfigStorage, 0, finalStorageArray );


        
        // Create the buffer you do the async read back to the CPu from: 
        this.cellStateStorageForRead = 
            this.device.createBuffer({
                label: "Cell State C",
                size: this.cellStateArray.byteLength,
				usage: GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST
                // usage: GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST,
            });
        //this.device.queue.writeBuffer( cellStateStorageForRead, 0, this.cellStateArray );

		// Set each cell to a random state, then copy the JavaScript array into
		// the storage buffer.
		//for (let i = 0; i < TOTAL_CELLS; i++) {
		//    this.cellStateArray[i] = Math.random() > 0.66 ? 1 : 0;
		//}
		// Add the extra bit of information per cell+
		
        // If exact buff not specified just generate it based on starting config
        if(this.STARTING_BUFFER.length !== this.TOTAL_CELLS*this.CELL_VALS ){
            if( this.STARTING_CONFIG === EZWG.ALL_RANDS){
                this.initTheInitialCellStateAllRand( this.cellStateArray, this.RAND_SEED, this.GRID_SIZE );
            }
            else if( this.STARTING_CONFIG === EZWG.ALL_BINS){
                this.initTheInitialCellStateAllRandBins( this.cellStateArray, this.RAND_SEED, this.GRID_SIZE );
            }
            else{//if( this.STARTING_CONFIG === EZWG.ALL_ZERO){
                this.initTheInitialCellStateAllZeros( this.cellStateArray, this.RAND_SEED, this.GRID_SIZE );
            }
        }
        else{
            // console.log('yes using the repbuilt guy:')
            // console.log(this.STARTING_BUFFER)
            this.cellStateArray = this.STARTING_BUFFER
        }

        console.log('starting with : ')
        console.log( this.cellStateArray )
 
		this.device.queue.writeBuffer( this.cellStateStorage[0], 0, this.cellStateArray );


		// Create a bind group to pass the grid uniforms into the pipeline
		this.bindGroups = [
			this.device.createBindGroup({
				label: "Cell renderer bind group A",
				layout: bindGroupLayout,
				entries: [{
					binding: 0,
					resource: { buffer: uniformBuffer }
				}, {
					binding: 1,
					resource: { buffer: this.cellStateStorage[0] }
				}, {
					binding: 2,
					resource: { buffer: this.cellStateStorage[1] }
				}, {
					binding: 3,
					resource: { buffer: this.userInputTempStorage }
				}, {
					binding: 4,
					resource: { buffer: extraConfigStorage }
				}, {
					binding: 5,
					resource: { buffer: this.userIn_uniformBuffer }
				}
                ],
			}),
			this.device.createBindGroup({
				label: "Cell renderer bind group B",
				layout: bindGroupLayout,
				entries: [{
					binding: 0,
					resource: { buffer: uniformBuffer }
				}, {
					binding: 1,
					resource: { buffer: this.cellStateStorage[1] }
				}, {
					binding: 2,
					resource: { buffer: this.cellStateStorage[0] }
				}, {
					binding: 3,
					resource: { buffer: this.userInputTempStorage }
				}, {
					binding: 4,
					resource: { buffer: extraConfigStorage }
				}, {
					binding: 5,
					resource: { buffer: this.userIn_uniformBuffer }
				}
                ],
			}),
		];



        this.loaded = true;
        //and call back?
    }

    // Do a full pass
    run(){
        if( !this.READ_BUFFER_BUSY && this.device){

            let encoder = this.device.createCommandEncoder();
            // Start a compute pass
            let computePass = encoder.beginComputePass();

            // Write value of the buffer w users values 
            this.device.queue.writeBuffer( this.userInputTempStorage, 0, this.liveInput);

            this.device.queue.writeBuffer( this.userIn_uniformBuffer, 0, this.liveInpuUniform)

            this.liveInput[6] = 0;

            this.liveInput[ this.USER_INPUT_BUFFER_SIZE - 1 ] = this.step

            this.liveInput[ 7 ] = 0;
            this.liveInput[ 8 ] = 0;
            this.liveInput[ 9 ] = 0;
            this.liveInput[ 10 ] = 0;   // rendre mode
             


            //}
            //// The real indicator is userIn
            //else{
            //	let deadInput = ( new Float32Array( USER_INPUT_BUFFER_SIZE) ).fill( 0.0 );
            //	this.device.queue.writeBuffer( userInputTempStorage, 0, deadInput);
            //}

            computePass.setPipeline( this.simulationPipeline ); 
            computePass.setBindGroup( 0, this.bindGroups[ this.step % 2 ] );

            let workgroupCount = Math.ceil( this.GRID_SIZE / this.WORKGROUP_SIZE );
            computePass.dispatchWorkgroups( workgroupCount, workgroupCount );
            computePass.end();


            
            // const resolveBuffer = this.device.createBuffer({
            //     size: 16,
            //     usage: GPUBufferUsage.QUERY_RESOLVE | GPUBufferUsage.COPY_SRC,
            // });
            // encoder.resolveQuerySet(myQuerySet, 0, 2, resolveBuffer, 0); 
            // // Currently, we have to create a separate GPUBuffer mapped for reading and use copyBufferToBuffer()...
            // const resultBuffer = this.device.createBuffer({
            //     size: 16,
            //     usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ,
            // });
            // encoder.copyBufferToBuffer(resolveBuffer, 0, resultBuffer, 0, 16);

            let doReadBack = false;
            const encoder_cpu_helper = this.device.createCommandEncoder();
 
            //console.log(this.READ_BACK_FREQ, '---', this.step)
            if( this.READ_BACK_FREQ > -1 && (this.step%this.READ_BACK_FREQ===0) ){ 
                doReadBack = true; 

                // Copy output buffer to staging buffer
                encoder_cpu_helper.copyBufferToBuffer(
                    this.cellStateStorage[((this.step+1) % 2)], 0, // Source offset
                    this.cellStateStorageForRead, 0, // Destination offset
                    this.cellStateArray.byteLength
                );
                //this.device.queue.submit( encoder_cpu_helper ); 
            }




            this.step++; // Increment the this.step count

            // Start a render pass
            const pass = encoder.beginRenderPass( {
                colorAttachments: [ {
                    view: this.context.getCurrentTexture().createView(),
                    loadOp: "clear",
                    clearValue: { r: 0, g: 0, b: 0, a: 1 },//{ r: 0, g: 0, b: 0.4, a: 1.0 },
                    storeOp: "store",
                } ]
            } );

            // Draw the grid.
            pass.setPipeline( this.cellPipeline );
            pass.setBindGroup( 0, this.bindGroups[ this.step % 2 ] ); // Updated!
            pass.setVertexBuffer( 0, this.vertexBuffer );

            if( this.FRAG_PIXEL_MODE ){
                pass.draw( 6, 1 );
            }
            else{
                pass.draw( this.vertices.length / 2, this.GRID_SIZE * this.GRID_SIZE * (this.PARTS_ACROSS*this.PARTS_ACROSS) );
            }

            

            // End the render pass and submit the command buffer
            pass.end();

            if( doReadBack === true ){
                this.device.queue.submit( [
                    encoder.finish(),
                    encoder_cpu_helper.finish()
                ] );
                this.READ_BUFFER_BUSY = true;

                
                // Map the staging buffer
                this.cellStateStorageForRead.mapAsync( GPUMapMode.READ, 0, this.cellStateArray.byteLength ).then(mappedStaginBuffer => {
                    // Read and print the contents 
                    let remaped = this.cellStateStorageForRead.getMappedRange( 0, this.cellStateArray.byteLength );
                    let arrayBufferToAnalyse = remaped.slice(0);
                    //let theUi8 = new Uint8Array( dudata );

                    if(this.BUFFER_TYPE ==='f32'){
                        let float32ArrayBuffer = new Float32Array(arrayBufferToAnalyse); 

                        //console.log(float32ArrayBuffer)
                        //goThroughF32ValsAndReprint( float32ArrayBuffer, this );
                        this.READ_BACK_FUNC( this.step, float32ArrayBuffer )
    
                        this.cellStateStorageForRead.unmap();
                    }
                    else if(this.BUFFER_TYPE === 'u32'){
                        let uint32ArrayBuffer = new Uint32Array(arrayBufferToAnalyse);  
                        this.READ_BACK_FUNC( this.step, uint32ArrayBuffer )
    
                        this.cellStateStorageForRead.unmap();
                    }
                    
                    
                    this.READ_BUFFER_BUSY = false;
                }).catch( error => {
                    console.log('errrr mapping ', error);
                });
                

            }
            else{
                this.device.queue.submit( [ encoder.finish() ] );
            }

            
            //console.log("this.step==>", this.step);
            //console.log(resultBuffer);
            //https://developer.mozilla.org/en-US/docs/Web/API/GPUQuerySet
            //https://github.com/gpuweb/gpuweb/issues/4383
            //what da spruce man

        }
        else if(!this.device){
            
        }
        else{
            console.log('READ BUFFER BUSY: ', this.READ_BUFFER_BUSY, 'at time index', this.step)
        }

    }
 

    // Called to initiate the values in the grid.
    initTheInitialCellStateArray_withNeighbours( cellStateArray, seeed, grid_size ){
        let nuSeed = 'insI2' + seeed;
        
        let rand = new PseudRand( nuSeed  );

        // Intiial bullshi
        for(let ii = 0;ii < this.CHUNKS_ACROSS;ii++){
            for(let jj = 0;jj < this.CHUNKS_ACROSS;jj++){
                
                let offX = ii * this.CHUNK_SIZE;
                let offY = jj * this.CHUNK_SIZE;

                for(let kk = 0;kk < 2;kk++){

                    let theX = Math.floor(rand.random()*this.CHUNK_SIZE) + offX;//locations[k].x;
                    let theY = Math.floor(rand.random()*this.CHUNK_SIZE) + offY;//locations[k].y;

                    for(let rg = 0;rg < 256;rg++){
                        if(rand.random() < 0.42){
                            for(let c = 0;c < this.CELL_VALS;c++){
                                cellStateArray[
                                    (theX+Math.floor(rg/16))*grid_size + (theY+(rg%16)) + c*(grid_size*grid_size)
                                ] = rand.random()<0.5?rand.random():1.0;
                            }
                        }
                    } 
                }
            }
        } 
        
        // Set the neighbours
        for(let xx = 0;xx < this.CHUNKS_ACROSS;xx++){
            for(let yy = 0;yy < this.CHUNKS_ACROSS;yy++){

                
                let offX = xx * this.CHUNK_SIZE;
                let offY = yy * this.CHUNK_SIZE;

                for(let ii = 0;ii < this.CHUNK_SIZE;ii++){
                    for(let jj = 0;jj < this.CHUNK_SIZE;jj++){

                        let theX = Math.floor(ii) + offX;
                        let theY = Math.floor(jj) + offY;
                        let nOffset = 0+Math.floor( rand.random()*259 );//4;//
                        
                        let nnn = 0;
                        for(let c = this.joosValuesPerCell;c < this.CELL_VALS;c++){
                            let wrapNeighbour = (nnn + nOffset)%9;
                            
                            //if( xx === 0 && yy === 1 && ii === 23 && jj === 12){
                            //    console.log('wrapNeighbour', wrapNeighbour, 'c', c);
                            //}

                            if( wrapNeighbour === 4 ){
                                c--;// just skip this middle one of (3x3)
                                    // this works because 'nnn' increases even thouugh this goes back
                            }
                            else{
                                let ngh_offx = Math.floor((wrapNeighbour)%3) - 1;
                                let ngh_offy = Math.floor((wrapNeighbour)/3) - 1;
                                //ngh_offx += ngh_offy;
                                //ngh_offy = 0;
                                cellStateArray[
                                    (theX) + (theY*grid_size) + c*(grid_size*grid_size)
                                ] = ( (ii+this.CHUNK_SIZE+ngh_offx) % this.CHUNK_SIZE ) +
                                    ( (jj+this.CHUNK_SIZE+ngh_offy) % this.CHUNK_SIZE ) * 1000;
                            }

                            
                            nnn++;
                        }


                    }
                }

            }
        } 
    }
    initTheInitialCellStateAllRand( cellStateArray, seeed, grid_size ){
        EZWG.SHA1.seed( seeed )  // TODO keep dont assume global EZWG access

        let daBigONe = this.CHUNKS_ACROSS * this.CHUNKS_ACROSS * this.CHUNK_SIZE * this.CHUNK_SIZE
        for(let ii = 0;ii < daBigONe;ii++){ 
            for(let c = 0;c < this.CELL_VALS;c++){
                if( this.BUFFER_TYPE === 'f32' ){
                    cellStateArray[
                        ii + c*(grid_size*grid_size)
                    ] =  EZWG.SHA1.random();
                }
                else if( this.BUFFER_TYPE === 'u32' ){
                    cellStateArray[
                        ii + c*(grid_size*grid_size)
                    ] =  EZWG.randomU32( EZWG.SHA1.random() );
                }
                
            } 
        }
    }
    initTheInitialCellStateAllRandBins( cellStateArray, seeed, grid_size ){
        EZWG.SHA1.seed( seeed )  // TODO keep dont assume global EZWG access

        let daBigONe = this.CHUNKS_ACROSS * this.CHUNKS_ACROSS * this.CHUNK_SIZE * this.CHUNK_SIZE
        for(let ii = 0;ii < daBigONe;ii++){
            for(let c = 0;c < this.CELL_VALS;c++){
                cellStateArray[
                    ii + c*(grid_size*grid_size)
                ] =  EZWG.SHA1.random()<0.5?0:1;
            } 
        }
    }
    initTheInitialCellStateAllZeros( cellStateArray, seeed, grid_size ){
        EZWG.SHA1.seed( seeed )  // TODO keep dont assume global EZWG access

        let daBigONe = this.CHUNKS_ACROSS * this.CHUNKS_ACROSS * this.CHUNK_SIZE * this.CHUNK_SIZE
        for(let ii = 0;ii < daBigONe;ii++){
            for(let c = 0;c < this.CELL_VALS;c++){
                cellStateArray[
                    ii + c*(grid_size*grid_size)
                ] = 0;
            } 
        }
    }

    handleMouseDown(event) {
        this.ezweb.isDragging = true;
        const rect = this.canvas.getBoundingClientRect();
        const xx = event.clientX - rect.left;
        const yy = event.clientY - rect.top;
        this.ezweb.dragStartX = ((Math.floor(xx / this.ezweb.CELL_SIZE)) + this.GRID_SIZE) % this.GRID_SIZE;
        this.ezweb.dragStartY = ((Math.floor(yy / this.ezweb.CELL_SIZE)) + this.GRID_SIZE) % this.GRID_SIZE;
    }

    handleMouseUp(event) {
        if (this.ezweb.isDragging) {
            this.ezweb.isDragging = false;
            const rect = this.canvas.getBoundingClientRect();
            const xx = event.clientX - rect.left;
            const yy = event.clientY - rect.top;
            this.ezweb.dragEndX = (Math.floor(xx / this.ezweb.CELL_SIZE) + this.GRID_SIZE) % this.GRID_SIZE;
            this.ezweb.dragEndY = (Math.floor(yy / this.ezweb.CELL_SIZE) + this.GRID_SIZE) % this.GRID_SIZE;

            if (this.liveInput[6] < 1) {
                this.liveInput[0] = this.ezweb.dragStartX;
                this.liveInput[1] = (this.ezweb.GRID_SIZE - 1) - this.ezweb.dragStartY;
                this.liveInput[2] = this.ezweb.dragEndX;
                this.liveInput[3] = (this.ezweb.GRID_SIZE - 1) - this.ezweb.dragEndY;
                
                this.liveInput[4] = 0;
                // if( this.lastKeyDetected === '2' ){
                //     this.liveInput[4] = 2;
                // }
                // else if( this.lastKeyDetected === '3' ){
                //     this.liveInput[4] = 3;
                // }
                // else if( this.lastKeyDetected === '4' ){
                //     this.liveInput[4] = 4;
                // }
                // else if( this.lastKeyDetected === '5' ){
                //     this.liveInput[4] = 5;
                // }
                // else if( this.lastKeyDetected === '6' ){
                //     this.liveInput[4] = 6;
                // }
                // else if( this.lastKeyDetected === '7' ){
                //     this.liveInput[4] = 7;
                // }
                // else if( this.lastKeyDetected === '8' ){
                //     this.liveInput[4] = 8;
                // }
                // else if( this.lastKeyDetected === '1'){// || true ){
                //     this.liveInput[4] = 1;
                // }


                this.liveInput[5] = 0;
                this.liveInput[6] = 1;

                this.ezweb.LAST_CELL_X = this.ezweb.dragStartX;
                this.ezweb.LAST_CELL_Y = this.ezweb.dragStartY;
                console.log('set new input:', this.liveInput)
            }
            else{
                console.log('rejected input')
            }
        }
    }
    
    handleKeyInput(keyString) {
        //console.log(keyString);
        this.lastKeyDetected = keyString;

    }

    static SHA1 = {
        state: {
            lastseed: '',
            tot: 0
        },
        hashToFloat(hash) {
            const hexPart = hash.substring(0, 8); // Take only the first 8 characters for 32 bits
            const intVal = parseInt(hexPart, 16);
            const maxInt = Math.pow(2, 32) - 1;
            return intVal / maxInt;
        },
        
        seed(setseed){
            this.state.lastseed = ''+setseed;
        },
        random(){
            this.state.lastseed = this.sha1(this.state.lastseed)
            this.state.tot++;
            return this.hashToFloat(this.state.lastseed)
        },
        sha1(msg) {
            function rotateLeft(n, s) {
                return (n << s) | (n >>> (32 - s));
            }
        
            function toHexStr(n) {
                let s = "", v;
                for (let i = 7; i >= 0; i--) {
                    v = (n >>> (i * 4)) & 0x0f;
                    s += v.toString(16);
                }
                return s;
            }
        
            function utf8Encode(str) {
                return unescape(encodeURIComponent(str));
            }
        
            const K = [0x5a827999, 0x6ed9eba1, 0x8f1bbcdc, 0xca62c1d6];
        
            msg = utf8Encode(msg);
        
            const msgLength = msg.length;
        
            let wordArray = [];
            for (let i = 0; i < msgLength - 3; i += 4) {
                wordArray.push((msg.charCodeAt(i) << 24) | (msg.charCodeAt(i + 1) << 16) | (msg.charCodeAt(i + 2) << 8) | msg.charCodeAt(i + 3));
            }
        
            switch (msgLength % 4) {
                case 0:
                    wordArray.push(0x080000000);
                    break;
                case 1:
                    wordArray.push((msg.charCodeAt(msgLength - 1) << 24) | 0x0800000);
                    break;
                case 2:
                    wordArray.push((msg.charCodeAt(msgLength - 2) << 24) | (msg.charCodeAt(msgLength - 1) << 16) | 0x08000);
                    break;
                case 3:
                    wordArray.push((msg.charCodeAt(msgLength - 3) << 24) | (msg.charCodeAt(msgLength - 2) << 16) | (msg.charCodeAt(msgLength - 1) << 8) | 0x80);
                    break;
            }
        
            while ((wordArray.length % 16) != 14) {
                wordArray.push(0);
            }
        
            wordArray.push(msgLength >>> 29);
            wordArray.push((msgLength << 3) & 0x0ffffffff);
        
            let H0 = 0x67452301;
            let H1 = 0xefcdab89;
            let H2 = 0x98badcfe;
            let H3 = 0x10325476;
            let H4 = 0xc3d2e1f0;
        
            let W = new Array(80);
            let a, b, c, d, e;
            for (let i = 0; i < wordArray.length; i += 16) {
                for (let t = 0; t < 16; t++) {
                    W[t] = wordArray[i + t];
                }
                for (let t = 16; t < 80; t++) {
                    W[t] = rotateLeft(W[t - 3] ^ W[t - 8] ^ W[t - 14] ^ W[t - 16], 1);
                }
        
                a = H0;
                b = H1;
                c = H2;
                d = H3;
                e = H4;
        
                for (let t = 0; t < 80; t++) {
                    let temp;
                    if (t < 20) {
                        temp = (rotateLeft(a, 5) + ((b & c) | (~b & d)) + e + W[t] + K[0]) & 0x0ffffffff;
                    } else if (t < 40) {
                        temp = (rotateLeft(a, 5) + (b ^ c ^ d) + e + W[t] + K[1]) & 0x0ffffffff;
                    } else if (t < 60) {
                        temp = (rotateLeft(a, 5) + ((b & c) | (b & d) | (c & d)) + e + W[t] + K[2]) & 0x0ffffffff;
                    } else {
                        temp = (rotateLeft(a, 5) + (b ^ c ^ d) + e + W[t] + K[3]) & 0x0ffffffff;
                    }
        
                    e = d;
                    d = c;
                    c = rotateLeft(b, 30);
                    b = a;
                    a = temp;
                }
        
                H0 = (H0 + a) & 0x0ffffffff;
                H1 = (H1 + b) & 0x0ffffffff;
                H2 = (H2 + c) & 0x0ffffffff;
                H3 = (H3 + d) & 0x0ffffffff;
                H4 = (H4 + e) & 0x0ffffffff;
            }
        
            return toHexStr(H0) + toHexStr(H1) + toHexStr(H2) + toHexStr(H3) + toHexStr(H4);
        }
    }

    static print = {
        goThroughF32ValsAndReprint( f32CopiedValues, ca_obj ){

            let lstCellX = -1;
            let lstCellY = -1;

            let chunk_att_size = ca_obj.TOTAL_CHUNKS * ca_obj.TOTAL_CHUNKS * ca_obj.CHUNK_SIZE * ca_obj.CHUNK_SIZE; 
            let offX = 26;// x coordinate RELATIVE TO EACH CHUNK
            let offY = 44;// y coor... 
            for(let ii = 0;ii < ca_obj.TOTAL_CHUNKS;ii++){
                for(let jj = 0;jj < ca_obj.TOTAL_CHUNKS;jj++){ 
                    let theX = Math.floor(ii) + offX;
                    let theY = Math.floor(jj) + offY; 
                    let c = 16;
                    //for(c = ca_obj.joosValuesPerCell;c < ca_obj.uniqueValuesPerCell;c++){
                    //}
                    for(c = 0;c < ca_obj.uniqueValuesPerCell;c++){
                        let hgh = f32CopiedValues[
                            (theX) + (theY * ca_obj.CHUNK_SIZE*ca_obj.TOTAL_CHUNKS) + (c*chunk_att_size)
                        ]; 
                        //console.log( ':-:-:-:-', ii, jj, hgh ); 
                    } 
                    //console.log( '---===============;' );
                }
            }

            if(lstCellX > -1 && lstCellY > -1){
                for(let c = 0;c < ca_obj.uniqueValuesPerCell;c++){
                    let hgh = f32CopiedValues[
                        (lstCellX) + 
                        (lstCellY * ca_obj.CHUNK_SIZE*ca_obj.TOTAL_CHUNKS) + 
                        (c*chunk_att_size)
                    ]; 
                    let wrpX = lstCellX % (ca_obj.CHUNK_SIZE);
                    let wrpY = lstCellY % (ca_obj.CHUNK_SIZE);
                    //console.log( wrpX, wrpY, hgh ); 
                }

            }

            

            // console.log('neghbrs:--_____');//ca_obj.joosValuesPerCell
            // for(let c = 0;c < ca_obj.uniqueValuesPerCell;c++){ 
            //     let theX = Math.floor(32); // + offX;
            //     let theY = Math.floor(44); // + offY; 
            //     let hgh = f32CopiedValues[
            //         (theX) + (theY*ca_obj.CHUNK_SIZE*ca_obj.TOTAL_CHUNKS) + (c*chunk_att_size)
            //     ]; 
            //     theX = theX % ca_obj.CHUNK_SIZE;
            //     theY = theY % ca_obj.CHUNK_SIZE;
            //     console.log( theX, theY, hgh);
            // }
                    

            //f32CopiedValues

        } 
    }

    // Use like this:
    // let sprtA = document.getElementById('exmplSprite1'); 
    // if (sprtA.complete && sprtA.naturalWidth !== 0) {
    //     const packedPixels = EZWG.processImagePixels(sprtA, 8, 8);
    //     console.log(packedPixels);
    //     packedPixels.forEach((packedValue, index) => {
    //         const { r, g, b, a } = EZWG.unpackU32(packedValue);
    //         console.log(`Pixel ${index}: R=${r}, G=${g}, B=${b}, A=${a}`);
    //     });
    // }

    static randomU32(zeroToOne) {
        // Ensure the input is between 0 and 1
        if (zeroToOne < 0 || zeroToOne > 1) {
            throw new Error("Input must be a float between 0 and 1");
        }
        // Scale the float to the range of a 32-bit unsigned integer
        return Math.floor(zeroToOne * 0xFFFFFFFF);
    }


 
    static processImagePixels(img, width, height) {
        // Create a canvas and draw the image
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = width;
        canvas.height = height;

        // Disable image smoothing to maintain pixel-perfect quality
        ctx.imageSmoothingEnabled = false;
        ctx.mozImageSmoothingEnabled = false;
        ctx.webkitImageSmoothingEnabled = false;
        ctx.msImageSmoothingEnabled = false;

        // Set the image element properties to ensure pixel-perfect rendering
        img.style.imageRendering = 'pixelated';
        img.style.imageRendering = 'crisp-edges'; // for some browsers
        img.width = width;  // set the display width
        img.height = height; // set the display height

        // Draw the image on the canvas
        ctx.drawImage(img, 0, 0, width, height);
        // Get the image data
        const imageData = ctx.getImageData(0, 0, width, height).data;
        // Initialize an array to hold the packed u32 values
        const packedPixels = [];
        for (let y = height - 1; y >= 0; y--) {
            for (let x = 0; x < width; x++) {
                const index = (y * width + x) * 4; // Calculate the index for the RGBA values
                const r = imageData[index];
                const g = imageData[index + 1];
                const b = imageData[index + 2];
                const a = imageData[index + 3];
                // Convert RGBA to a u32 number
                const packedValue = (a << 24) | (b << 16) | (g << 8) | r;
                // Push the packed value to the array
                packedPixels.push(packedValue);
            }
        }
        return packedPixels;
    }

    // Least signifcant bit is the first one
    // 0 - 255,  
    static createPackedU32( s4, s3, s2, s1 ){ 
        return (s4 << 24) | (s3 << 16) | (s2 << 8) | s1; 
    }

    
    static createPackedU8( s2, s1 ){ 
        return   (s2 << 4) | s1; 
    }
    
    static createPackedU32_4( s8, s7, s6, s5, s4, s3, s2, s1 ){ 
        return (s8 << 28) | (s7 << 24) | (s6 << 20) | (s5 << 16) | (s4 << 12) | (s3 << 8) | (s2 << 4) | s1; 
    }

    // 0 - 65535,
    static createPackedU32_16( s2, s1 ){
        return  (s2 << 16) | s1;
    }
    static createPackedU16_8( s2, s1 ){
        return  (s2 << 8) | s1;
    }
    
    static unpackU32(packedValue) {
        const a = (packedValue >> 24) & 0xFF;
        const b = (packedValue >> 16) & 0xFF;
        const g = (packedValue >> 8) & 0xFF;
        const r = packedValue & 0xFF;
        return { r, g, b, a };
    }
    
    static unpackU32_16(packedValue) { 
        const b = (packedValue >> 16) & 0xFFFF;
        const a = packedValue & 0xFFFF;
        return { a, b };
    }
    

} 