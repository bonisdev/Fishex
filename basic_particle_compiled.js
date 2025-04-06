/*******************************************************
 * Example: WebGPU with Particles + Terrain (Updatable in Compute)
 * 
 * - Particles stored in 'particles' buffer
 * - Terrain stored in 'planeStorageBuffer' with usage=VERTEX|STORAGE
 * - A single compute shader that modifies both 'particles' and 'terrain'
 * - The same 'planeStorageBuffer' is used by the vertex stage to render the terrain
 *******************************************************/

const canvas = document.getElementById('gpuCanvas');

var MSTIME = 22;
var READBACKFREQ = 1;
var STEPCOUNT = 0;
var FINAL_POINT_DATA = returnAllStructures(); // Your scenario data

console.log('FINAL_POINT_DATA.KEY_PROTAGONIST', FINAL_POINT_DATA.KEY_PROTAGONIST);

var ALL_READABLE_ENTS = new Array( FINAL_POINT_DATA.TOTAL_CPU_BUFFER_SIZE );
var ALL_SFX = (new Array( FINAL_POINT_DATA.TOTAL_SFXS)).fill(0);;

var isMapping = false;

var stopSimulation = false;

var DEBUG_VISUALS = false;// show the xyz axis n stuff





var CURR_CAM_MODE = -1;// FREE CAM is negative 1 or any of the read-backable 

var CURR_TARGET_MODE = 0;   // 0 = not targeting, 1 = targeting 
var CURR_TARGET_ID_1plus = 0;     // current target to look at (0 means no highlihg)

var CURR_CAM_TARGET = {x: 0, y: 0, z: 0};
var CURR_CAM_ENROUTE_TARGET = {x: 0, y: 0, z: 0};// the coordintes that slink towards the points of interest
var CURR_CAM_VELOCITY = {x: 0, y: 0, z: 0};

var proneCameraType = 0;// 0 = normal orbit the target, 1 = prone zoom in
// 2 = ambient aquarium move

var SFX_COUNT_1 = 0;

var LAST_VEL_FROM_KEY_PROTAGONIST = {x: 0, y: 0, z: 0};// distance the main character is from the center
var CLOSEST_ENT_ID = 0;    // the id of the currently targeted ent (by the cpu)

var userKeySpace = false;
var userKeyShift = false;   // ^ tilters up n down

var userAbilityE = false; 
var userAbilityQ = false;   // ^ special bilities

// How the next stage should be loaded (like in what context, what version etc.)
// Because there can be changes to the program as time goes on (allow for the live )
// Updating of the 'mining process'
var SIM_META = {
    inputsSoFar: []// {}
};

// Camera
const camera = {
    position: [0, 0, 15],
    rotation: [0, 0],
    speed: 0.28,
    sensitivity: 0.028,

    // OPTIONAL: store a target to look at
    target: [0, 0, 0],    // This is the point in space we want to look at
    useTarget: false,     // If true, we’ll rotate the camera each frame to face `target`
};

// Keys
var keys = {
    w: false, a: false, s: false, d: false, q: false, e: false,
    t: false, f: false, g: false, h: false, r: false, y: false, 
    
    p: false, 
    
    m: false,

    u: false,   // for healing? i guess

    o: false,   // for toggling debug information

    arrowup: false, arrowdown: false, arrowleft: false, arrowright: false,
    enter: false, 
};


// Ensure an overlay element exists.
function getOverlay() {
    let overlay = document.getElementById('overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'overlay';
        Object.assign(overlay.style, {
            position: 'absolute',
            top: '0',
            left: '0',
            width: '100%',
            height: '100%',
            zIndex: '100',           // On top of the canvas
            pointerEvents: 'none',   // Allow clicks to pass through
            backgroundColor: 'rgba(0,0,0,0)',
            display: 'none'
        });
        document.body.appendChild(overlay);
    }
    return overlay;
}

// Animate overlay in: fade from transparent to opaque blue over 1 second.
function animateOverlayIn() {
    const overlay = getOverlay();
    overlay.style.display = 'block';
    overlay.style.transition = 'none';
    overlay.style.backgroundColor = 'rgba(0,0,0,0)';
    
    // Force reflow.
    overlay.offsetHeight;
    
    overlay.style.transition = 'background-color 0.5s ease';
    overlay.style.backgroundColor = 'rgba(0, 0, 255, 1)'; // Fade to blue
}

// Animate overlay out: fade from blue (or current color) to transparent over 1 second.
function animateOverlayOut() {
    const overlay = getOverlay();
    overlay.style.transition = 'background-color 0.4s ease';
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0)'; // Fade to transparent
    setTimeout(() => {
        overlay.style.display = 'none';
    }, 500);
}

// Keyboard listeners
function onKeyDown(e) {
    const key = e.key.toLowerCase(); // Convert key to lowercase
    
    if (key === 'm') {
        camera.useTarget = true;
        CURR_CAM_MODE = (CURR_CAM_MODE + 1) % FINAL_POINT_DATA.TOTAL_READBACKS;

        // Just set it to the main character
        for(let b = 0;b < ALL_READABLE_ENTS.length;b++){
            if( ALL_READABLE_ENTS[b].i === FINAL_POINT_DATA.KEY_PROTAGONIST ){
                CURR_CAM_MODE = b;
                b = ALL_READABLE_ENTS.length;
            }
        }
    }
    if (key === 'b') {
        camera.useTarget = false;
        CURR_CAM_MODE = -1; // back to free-cam
    }

    if (key === ' ') {
        userKeySpace = true;
    }
    if (key === 'shift') {  // Note: 'Shift' becomes 'shift' when lowercased
        userKeyShift = true;
    }

    if( key === 'e' ){
        userAbilityE = true;
    }
    if( key === 'q' ){
        userAbilityQ = true;
    }

    if (key in keys) {
        keys[key] = true;
    }

    if( key === 'enter' ){
        proneCameraType = proneCameraType + 1;
        proneCameraType = proneCameraType % 3;
    }

    if( key === 'o' ){
        DEBUG_VISUALS = !DEBUG_VISUALS;
    }
}

function onKeyUp(e) {
    const key = e.key.toLowerCase(); // Convert key to lowercase
    
    if (key === ' ') {
        userKeySpace = false;
    }
    if (key === 'shift') {  // Note: 'Shift' becomes 'shift' when lowercased
        userKeyShift = false;
    }

    if( key === 'e' ){
        userAbilityE = false;
    }
    if( key === 'q' ){
        userAbilityQ = false;
    }

    if (key in keys) {
        keys[key] = false;
    }
    
}
function resizeCanvas() {
    const dpr = window.devicePixelRatio || 1;
    canvas.style.width = window.innerWidth + "px";
    canvas.style.height = window.innerHeight + "px";
    canvas.width  = Math.floor(window.innerWidth * dpr);
    canvas.height = Math.floor(window.innerHeight * dpr);

    context.configure({
        device,
        format: canvasFormat,
        alphaMode: 'opaque',
        size: [canvas.width, canvas.height],
    });
}

// Resize listener
function onResize() {
    resizeCanvas();
    recreateDepthTexture();
}

// --- Setup Functions ---

// Modify setupInputHandlers to use the named functions:
function setupInputHandlers() {
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
}



async function resetDaWholeTing(){
    // Signal the current simulation loop to stop.
    stopSimulation = true;

    // Remove all event listeners
    window.removeEventListener('keydown', onKeyDown);
    window.removeEventListener('keyup', onKeyUp);
    window.removeEventListener('resize', onResize);

    // Begin the overlay animation.
    animateOverlayIn();

    playAudio("steamhiss");

    // Wait for the overlay fade to blue to complete (1.1 seconds).
    await new Promise(resolve => setTimeout(resolve, 650));
    // Give the current frame a chance to finish.
    //setTimeout(() => {
         // Wait for a short duration (MSTIME) to allow any in-flight frame to finish.
    //await new Promise(resolve => setTimeout(resolve, MSTIME));

        // (Optional) Clear the canvas. If you are drawing with WebGPU, you might
        // not need to use a 2D context, but if you have any overlay you can clear it.
        const ctx2d = canvas.getContext('2d');
        if (ctx2d) {
            ctx2d.clearRect(0, 0, canvas.width, canvas.height);
        }

        // Reset simulation timing and counters.
        MSTIME = 22;
        STEPCOUNT = 0;

        
        // Reinitialize your simulation data.
        FINAL_POINT_DATA = returnAllStructures();
        ALL_READABLE_ENTS = new Array(FINAL_POINT_DATA.TOTAL_CPU_BUFFER_SIZE);
        ALL_SFX = new Array(FINAL_POINT_DATA.TOTAL_SFXS).fill(0);

        // Reset camera and related global state.
        camera.position = [0, 0, 15];
        camera.rotation = [0, 0];
        camera.target = [0, 0, 0];
        camera.useTarget = false;
        CURR_CAM_MODE = -1;
        CURR_TARGET_MODE = 0;
        CURR_TARGET_ID_1plus = 0;
        CURR_CAM_TARGET = {x: 0, y: 0, z: 0};
        CURR_CAM_ENROUTE_TARGET = {x: 0, y: 0, z: 0};
        CURR_CAM_VELOCITY = {x: 0, y: 0, z: 0};

        proneCameraType = 0;

        SFX_COUNT_1 = 0;


        LAST_VEL_FROM_KEY_PROTAGONIST = {x: 0, y: 0, z: 0};
        CLOSEST_ENT_ID = 0;

        userKeySpace = false;
        userKeyShift = false;

        userAbilityE = false;
        userAbilityQ = false;

        SIM_META = {
            inputsSoFar: []// {}
        };

        keys = {
            w: false, a: false, s: false, d: false, q: false, e: false,
            t: false, f: false, g: false, h: false, r: false, y: false, 
            
            p: false, 
            
            m: false,
        
            u: false,   // for healing? i guess

            o: false,   // for toggling debug information
        
            arrowup: false, arrowdown: false, arrowleft: false, arrowright: false,
            enter: false, 
        };

        // Drop references to existing GPU resources so they can be cleaned up.
        device = undefined;
        context = undefined;
        depthTexture = undefined;
        particleBuffer = undefined;
        planeStorageBuffer = undefined;
        planeIndexBuffer = undefined;
        computePipeline = undefined;
        computeBindGroup = undefined;
        userInputBuffer = undefined;
        readbackBuffer = undefined;
        particlePipeline = undefined;
        planePipeline = undefined;
        renderBindGroupParticles = undefined;
        renderBindGroupVP = undefined;
        planeBindGroup = undefined;
        vpBuffer = undefined;

        middlePlaneOffsetX = 0;
        middlePlaneOffsetZ = 0;
        // Reset the simulation stop flag so the new simulation can run.
        stopSimulation = false;
        DEBUG_VISUALS = false;

        // Restart the simulation by calling main() again.
       await main();
       // Once the new simulation is loaded, animate overlay out (fade to transparent).
       animateOverlayOut();
       playAudio("bannernotif");
    //}, MSTIME);
}


function cpuReadback(copyArray) {
    // DONUT DELETE < - For ADDING ANOTHER WRITE SLOT OUTPUT INFO HERE PART 2/2))
    for(let jj = 0;jj < FINAL_POINT_DATA.TOTAL_READBACKS;jj++){
        ALL_READABLE_ENTS[jj] = {
            x: copyArray[ jj*FINAL_POINT_DATA.WRITE_SLOT_SIZE + 0 ],
            y: copyArray[ jj*FINAL_POINT_DATA.WRITE_SLOT_SIZE + 1 ],
            z: copyArray[ jj*FINAL_POINT_DATA.WRITE_SLOT_SIZE + 2 ],
            t: copyArray[ jj*FINAL_POINT_DATA.WRITE_SLOT_SIZE + 3 ],
            i: copyArray[ jj*FINAL_POINT_DATA.WRITE_SLOT_SIZE + 4 ],

            sx:copyArray[ jj*FINAL_POINT_DATA.WRITE_SLOT_SIZE + 5 ],
            sy:copyArray[ jj*FINAL_POINT_DATA.WRITE_SLOT_SIZE + 6 ],
            sz:copyArray[ jj*FINAL_POINT_DATA.WRITE_SLOT_SIZE + 7 ],
        }
    }

    for(let hh = 0;hh < (ALL_SFX.length);hh++){
        let val = copyArray[
            FINAL_POINT_DATA.START_SFX +                // The index right after the last writeback slot
            ( hh * FINAL_POINT_DATA.SIZE_SFX_SLOT ) + 0    // Which sfx (of the 16 or so)
            //( ( STEPCOUNT ) % FINAL_POINT_DATA.SIZE_SFX_SLOT ) // ???
        ];

        // SFX tap tap
        if( hh === 0 && val > 0 ){

            SFX_COUNT_1++;

            if( STEPCOUNT % 3 === 0){
                //console.log(  );
                playAudio( "balop" );
            }
            //console.log('NEW SFX! at', hh, val)
            //ALL_SFX[]
        }
        // SFX missile detonation
        else if( hh === 1 && val > 0 ){
            playAudio( "bomb" );
        }
        // SFX spring snap
        else if( hh === 2 && val > 0 ){
            playAudio( "realpang" );
        }
    }
}

// function setupInputHandlers() {onKeyDown
//     window.addEventListener('keydown', onKeyDown);
//     // window.addEventListener('keydown', (e) => {

//     //     if( e.key === 'm'){
//     //         camera.useTarget = true;

//     //         CURR_CAM_MODE = CURR_CAM_MODE + 1;
//     //         CURR_CAM_MODE = CURR_CAM_MODE % FINAL_POINT_DATA.TOTAL_READBACKS;
//     //         // CURR_CAM_TARGET.x = ALL_READABLE_ENTS[ CURR_CAM_MODE ].x;
//     //         // CURR_CAM_TARGET.y = ALL_READABLE_ENTS[ CURR_CAM_MODE ].y;
//     //         // CURR_CAM_TARGET.z = ALL_READABLE_ENTS[ CURR_CAM_MODE ].z;
//     //     }
        
//     //     if( e.key === 'b'){
//     //         camera.useTarget = false;
//     //         CURR_CAM_MODE = -1;// go back to free-cam
//     //     }

//     //     if (e.key in keys) keys[e.key] = true;
//     // });
//     // window.addEventListener('keyup', (e) => {
//     //     //console.log("e.key",Object.keys(e))
//     //     if (e.key in keys) keys[e.key] = false;
//     // });
//     window.addEventListener('keyup', onKeyUp);
// }

function updateCamera() {
    const forward = [
        Math.sin(camera.rotation[1]),
        0,
        Math.cos(camera.rotation[1]),
    ];
    const right = [
        Math.cos(camera.rotation[1]),
        0,
        -Math.sin(camera.rotation[1]),
    ];

    // Free cam mode
    if( CURR_CAM_MODE < 0 ){
        if (keys.t) {
            camera.position[0] -= forward[0] * camera.speed;
            camera.position[2] -= forward[2] * camera.speed;
        }
        if (keys.g) {
            camera.position[0] += forward[0] * camera.speed;
            camera.position[2] += forward[2] * camera.speed;
        }
        if (keys.f) {
            camera.position[0] -= right[0] * camera.speed;
            camera.position[2] -= right[2] * camera.speed;
        }
        if (keys.h) {
            camera.position[0] += right[0] * camera.speed;
            camera.position[2] += right[2] * camera.speed;
        }

        if (keys.r) camera.position[1] -= camera.speed;
        if (keys.y) camera.position[1] += camera.speed;

        if (keys.arrowup) camera.rotation[0] -= camera.sensitivity;
        if (keys.arrowdown) camera.rotation[0] += camera.sensitivity;
        if (keys.arrowleft) camera.rotation[1] += camera.sensitivity;
        if (keys.arrowright) camera.rotation[1] -= camera.sensitivity;
    }
    // Target mode:
    else{
        // ALL_READABLE_ENTS
        // CURR_CAM_TARGET.x
        // CURR_CAM_TARGET.y
        // CURR_CAM_TARGET.z
        let SPRING_REST_DISTANCE = 23.0; // Resting distance of the spring
        let SPRING_CONSTANT = 67.9;      // Spring stiffness (k)
        let DAMPING_FACTOR = 18.93;      // Damping factor to avoid oscillation


        // Target position
        let target;
        
        if( proneCameraType === 2 ){// aquairum szoom out move
            var orbitModeSize = 1.45 * FINAL_POINT_DATA.INNER_CIRCLE * FINAL_POINT_DATA.BUCKET_SPACING * FINAL_POINT_DATA.bucketsPerimeter;
            var sideLength = FINAL_POINT_DATA.BUCKET_SPACING * FINAL_POINT_DATA.bucketsPerimeter;

            var extraSlowDownTime = 0.09;

            orbitModeSize += 2 * Math.sin((STEPCOUNT)/301*extraSlowDownTime);

            

            target = {
                x: sideLength/2 + Math.sin((STEPCOUNT)/342*extraSlowDownTime) * orbitModeSize,
                y: 9+Math.sin(STEPCOUNT/451*extraSlowDownTime)*2,
                z: sideLength/2 + Math.cos(STEPCOUNT/342*extraSlowDownTime) * orbitModeSize,
            };
            SPRING_REST_DISTANCE = 1;
            SPRING_CONSTANT = 120;
            DAMPING_FACTOR = 45;
        }
        else if( proneCameraType === 1 ){
            target = {
                x: ALL_READABLE_ENTS[CURR_CAM_MODE].x - ALL_READABLE_ENTS[CURR_CAM_MODE].sx*8,
                y: ALL_READABLE_ENTS[CURR_CAM_MODE].y + 3 - ALL_READABLE_ENTS[CURR_CAM_MODE].sy*8,
                z: ALL_READABLE_ENTS[CURR_CAM_MODE].z - ALL_READABLE_ENTS[CURR_CAM_MODE].sz*8,
            };
            SPRING_REST_DISTANCE = 1;
            SPRING_CONSTANT = 120;
            DAMPING_FACTOR = 45;
        }
        else if(proneCameraType===0){
            target = {
                x: ALL_READABLE_ENTS[CURR_CAM_MODE].x,
                y: ALL_READABLE_ENTS[CURR_CAM_MODE].y,
                z: ALL_READABLE_ENTS[CURR_CAM_MODE].z,
            };
        }

        let deltaTime = 0.016;
        // Calculate the spring vector (from camera to target)
        let springVector = {
            x: target.x - camera.position[0],
            y: target.y - camera.position[1],
            z: target.z - camera.position[2],
        };

        // Calculate the current length of the spring
        let springLength = Math.sqrt(
            springVector.x ** 2 + springVector.y ** 2 + springVector.z ** 2
        );

        // Normalize the spring vector
        let normalizedSpringVector = {
            x: springVector.x / springLength,
            y: springVector.y / springLength,
            z: springVector.z / springLength,
        };

        // Calculate the spring force magnitude
        let forceMagnitude = SPRING_CONSTANT * (springLength - SPRING_REST_DISTANCE);

        // Apply damping (to reduce oscillation)
        let dampingForce = {
            x: -DAMPING_FACTOR * CURR_CAM_VELOCITY.x,
            y: -DAMPING_FACTOR * CURR_CAM_VELOCITY.y,
            z: -DAMPING_FACTOR * CURR_CAM_VELOCITY.z,
        };

        // Calculate the total force
        let springForce = {
            x: normalizedSpringVector.x * forceMagnitude + dampingForce.x,
            y: normalizedSpringVector.y * forceMagnitude + dampingForce.y,
            z: normalizedSpringVector.z * forceMagnitude + dampingForce.z,
        };

        let whipalast = Math.atan2(springForce.x, springForce.z);
        // Update the velocity of the camera
        CURR_CAM_VELOCITY.x += springForce.x * deltaTime;
        CURR_CAM_VELOCITY.y += springForce.y * deltaTime;
        CURR_CAM_VELOCITY.z += springForce.z * deltaTime;

        // 0.5 parallax delta time
        // CURR_CAM_VELOCITY.x += ((Math.cos(whipalast-Math.PI)) * forceMagnitude *0.9) * deltaTime;
        // //CURR_CAM_VELOCITY.y +=
        // CURR_CAM_VELOCITY.z += ((Math.sin(whipalast-Math.PI)) * forceMagnitude*0.9) * deltaTime ;

        if( !keys.enter ){
            if( camera.position[1] < target.y + 5.0 ){
                CURR_CAM_VELOCITY.y += (( target.y + 5.0 ) - camera.position[1]) * 15 * deltaTime;
            }
        }

        // CURR_CAM_VELOCITY.x *= 0.9;
        // CURR_CAM_VELOCITY.y *= 0.9;
        // CURR_CAM_VELOCITY.z *= 0.9;

        let camBoostmode = 22.0;
        if (keys.arrowup){
            camera.position[1] += camera.speed*2;
            //CURR_CAM_VELOCITY.y += camBoostmode;
        }
        if (keys.arrowdown){
            camera.position[1] -= camera.speed*2;
            //CURR_CAM_VELOCITY.y -= camBoostmode;
        }
        if (keys.arrowleft){
            camera.position[0] -= right[0] * camera.speed*2;
            camera.position[2] -= right[2] * camera.speed*2;
            // CURR_CAM_VELOCITY.x -= camBoostmode;
            // CURR_CAM_VELOCITY.z -= camBoostmode;
        }
        if (keys.arrowright){
            camera.position[0] += right[0] * camera.speed*2;
            camera.position[2] += right[2] * camera.speed*2;
            //CURR_CAM_VELOCITY.x += camBoostmode;
            //CURR_CAM_VELOCITY.z += camBoostmode;
        }
        

        // Update the position of the camera
        camera.position[0] += CURR_CAM_VELOCITY.x * deltaTime;
        camera.position[1] += CURR_CAM_VELOCITY.y * deltaTime;
        camera.position[2] += CURR_CAM_VELOCITY.z * deltaTime;
        

    }
    

    const maxPitch = Math.PI / 2 - 0.01;
    camera.rotation[0] = Math.max(-maxPitch, Math.min(maxPitch, camera.rotation[0]));
}

function createViewProjectionMatrix(aspect, fov, near, far, position, rotation) {
    const f = 1.0 / Math.tan(fov / 2);
    const rangeInv = 1.0 / (near - far);
    const projection = [
        f / aspect, 0,        0,                       0,
        0,          f,        0,                       0,
        0,          0,        (near + far) * rangeInv, -1,
        0,          0,        near * far * rangeInv * 2, 0,
    ];

    const cosPitch = Math.cos(rotation[0]);
    const sinPitch = Math.sin(rotation[0]);
    const cosYaw = Math.cos(rotation[1]);
    const sinYaw = Math.sin(camera.rotation[1]);

    const forward = [
        cosPitch * sinYaw,
        sinPitch,
        cosPitch * cosYaw,
    ];
    const right = [
        cosYaw,
        0,
        -sinYaw,
    ];
    const up = [
        -sinPitch * sinYaw,
        cosPitch,
        -sinPitch * cosYaw,
    ];

    const x = -position[0];
    const y = -position[1];
    const z = -position[2];

    const view = [
        right[0], up[0], forward[0], 0,
        right[1], up[1], forward[1], 0,
        right[2], up[2], forward[2], 0,
        x*right[0] + y*right[1] + z*right[2],
        x*up[0]    + y*up[1]    + z*up[2],
        x*forward[0] + y*forward[1] + z*forward[2],
        1,
    ];

    const vp = new Float32Array(16);
    for (let i = 0; i < 16; i++) {
        vp[i] = 0;
        for (let j = 0; j < 4; j++) {
            vp[i] += projection[(i % 4) + j*4] * view[Math.floor(i / 4)*4 + j];
        }
    }
    return vp;
}

/**
 * Recomputes camera.rotation based on camera.position -> target vector.
 * - camera.rotation[0] = pitch
 * - camera.rotation[1] = yaw
 *
 *   where yaw   = angle around Y-axis  (turn left/right)
 *         pitch = angle around X-axis  (look up/down)
 */
function setCameraLookAt(camera, tx, ty, tz) {
    // Compute direction from camera.position -> target
    const dx = tx - camera.position[0];
    const dy = ty - camera.position[1];
    const dz = tz - camera.position[2];

    // Distance in the XZ-plane
    const distXZ = Math.sqrt(dx*dx + dz*dz);

    // If your camera normally points along +Z, often:
    // yaw = atan2(dx, dz)  (or maybe the negative)
    const yaw = Math.atan2(dx, dz) + Math.PI;

    // pitch = -atan2(dy, distXZ) or +atan2(dy, distXZ)
    // Try flipping the sign if it goes the wrong direction
    const pitch = -Math.atan2(dy, distXZ);

    camera.rotation[0] = pitch;  // up/down
    camera.rotation[1] = yaw;    // left/right
}




var device, context, canvasFormat;
var depthTexture;

function createDepthTexture(device, width, height) {
    return device.createTexture({
        size: [width, height],
        format: 'depth24plus',
        usage: GPUTextureUsage.RENDER_ATTACHMENT,
    });
}
function recreateDepthTexture() {
    depthTexture = createDepthTexture(device, canvas.width, canvas.height);
}

async function initWebGPU() {
    if (!navigator.gpu) {
        alert("WebGPU is not supported.");
        return;
    }
    const adapter = await navigator.gpu.requestAdapter();
    device = await adapter.requestDevice();

    context = canvas.getContext('webgpu');
    canvasFormat = navigator.gpu.getPreferredCanvasFormat();

    resizeCanvas();
    window.addEventListener('resize', onResize);
    // window.addEventListener('resize', () => {
    //     resizeCanvas();
    //     recreateDepthTexture();
    // });
}

// --------------------
//    PARTICLES
// --------------------
var particleBuffer;
var particleCount;
async function createParticleSystem(device) {
    const scenario = FINAL_POINT_DATA;
    particleCount = scenario.totalParticleCount;
    const particleData = scenario.RAW_POINTS;

    particleBuffer = device.createBuffer({
        size: particleData.byteLength,
        usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST |
               GPUBufferUsage.VERTEX  | GPUBufferUsage.COPY_SRC,
        mappedAtCreation: true,
    });
    new Float32Array(particleBuffer.getMappedRange()).set(particleData);
    particleBuffer.unmap();
}

// --------------------
//    TERRAIN
// --------------------
var planeStorageBuffer;
var planeIndexBuffer;
var planeIndexCount;
var middlePlaneOffsetX;
var middlePlaneOffsetZ;

function createPlaneGeometry(device) {

    middlePlaneOffsetX = FINAL_POINT_DATA.BUCKET_SPACING * FINAL_POINT_DATA.bucketsPerimeter / 2.0;
    middlePlaneOffsetZ = FINAL_POINT_DATA.BUCKET_SPACING * FINAL_POINT_DATA.bucketsPerimeter / 2.0;



    // Double precision per bucket? or does it even matter....
    const size = FINAL_POINT_DATA.bucketsPerimeter*2;
    // Each vertex => 5 floats: (x, y, z, u, v)
    const vertexCount = size * size;
    const vertexData = new Float32Array(vertexCount * 5);

    let ptr = 0;
    for (let row = 0; row < size; row++) {
        for (let col = 0; col < size; col++) {
            const u = col / (size - 1);
            const v = row / (size - 1);

            const worldX = FINAL_POINT_DATA.BUCKET_SPACING * u * FINAL_POINT_DATA.bucketsPerimeter;
            const worldZ = FINAL_POINT_DATA.BUCKET_SPACING * v * FINAL_POINT_DATA.bucketsPerimeter;

            // Start y=0, can be updated in compute pass
            const worldY = 0.0;

            vertexData[ptr++] = worldX; 
            vertexData[ptr++] = worldY;
            vertexData[ptr++] = worldZ;
            vertexData[ptr++] = u;
            vertexData[ptr++] = v;
        }
    }

    // Index buffer (triangle-list)
    planeIndexCount = (size - 1)*(size - 1)*6;
    const indexData = new Uint32Array(planeIndexCount);
    let iPtr = 0;
    for (let row = 0; row < size - 1; row++) {
        for (let col = 0; col < size - 1; col++) {
            let topLeft     = row*size + col;
            let topRight    = topLeft + 1;
            let bottomLeft  = (row+1)*size + col;
            let bottomRight = bottomLeft + 1;

            indexData[iPtr++] = topLeft;
            indexData[iPtr++] = bottomLeft;
            indexData[iPtr++] = topRight;

            indexData[iPtr++] = topRight;
            indexData[iPtr++] = bottomLeft;
            indexData[iPtr++] = bottomRight;
        }
    }

    // Now we want to modify these vertices in compute => so set usage=VERTEX|STORAGE
    planeStorageBuffer = device.createBuffer({
        size: vertexData.byteLength,
        usage: GPUBufferUsage.VERTEX | GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
        mappedAtCreation: true,
    });
    new Float32Array(planeStorageBuffer.getMappedRange()).set(vertexData);
    planeStorageBuffer.unmap();

    planeIndexBuffer = device.createBuffer({
        size: indexData.byteLength,
        usage: GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST,
        mappedAtCreation: true,
    });
    new Uint32Array(planeIndexBuffer.getMappedRange()).set(indexData);
    planeIndexBuffer.unmap();
}

// --------------------
//   COMPUTE PASS
// --------------------
var computePipeline, computeBindGroup;
var userInputBuffer;
var userInputArray = new Uint32Array(64);
var readbackBuffer;

/**
 * Now we have 3 bindings in group(0):
 *   binding(0) => particles
 *   binding(1) => userInput
 *   binding(2) => planeStorageBuffer (the terrain)
 */
async function createComputePipeline(device) {
    const computeShader = `
        @group(0) @binding(0) var<storage, read_write> particles: array<f32>;
@group(0) @binding(1) var<storage, read> userInput: array<u32>;

// New for terrain
@group(0) @binding(2) var<storage, read_write> terrainVertices: array<f32>;

// Sphere point
fn sphere_point(index: u32, total_points: u32, time_step: f32) -> vec3<f32> {
    // Golden ratio
    let phi = 1.618;//1.618033988749895;

    // Normalize index to range [0, total_points - 1]
    let i = f32(index % total_points);

    // Compute latitude (phi) and longitude (theta) with oscillation
    let theta = 2.0 * 3.14159265359 * i / phi + time_step * 0.005; // Oscillate longitude over time
    let phi_angle = acos(1.0 - 2.0 * (i + 0.5) / f32(total_points));

    // Add smooth snaking motion using sin and cos
    let wobble = 0.1 * sin(time_step * 0.05 + f32(index)); // Time-dependent wobble
    let phi_angle_with_wobble = phi_angle + wobble;

    // Convert spherical coordinates to Cartesian coordinates
    let x = sin(phi_angle_with_wobble) * cos(theta);
    let y = sin(phi_angle_with_wobble) * sin(theta);
    let z = cos(phi_angle_with_wobble);

    // Return the vertex as a 3D vector
    return vec3<f32>(x, y, z);
}



// Function to calculate the nuground value
fn calculate_nuground(x: f32, z: f32, sftep: f32) -> f32 {
    let base_freq: f32 = 0.003;

    let freq_x: f32 = 0.09;
    let freq_z: f32 = 0.044;

    var amp1 = 2.3f;

    return 0.7 * amp1 * sin(x * freq_x + sftep * base_freq *  0.08) *
           0.38 * amp1 * cos(z * freq_z + sftep * base_freq * 0.14) *
           0.98 * amp1 * cos(z * freq_x + sftep * base_freq * 0.19) *
           0.28 * amp1 * cos(x * freq_z + sftep * base_freq * 0.30) *
           0.93 * amp1 * cos(x * freq_x + sftep * base_freq * 0.51);
   
}



// Function to calculate the nuground value
fn calculate_vnuground(x: f32, z: f32, sftep: f32) -> f32 {
    let base_freq: f32 = 0.011;
    let freq_x: f32 = 0.08;
    let freq_z: f32 = 0.012;
    let amp1: f32 = 0.45;
    let amp2: f32 = 0.75;
    let amp3: f32 = 0.3;
    let amp4: f32 = 0.6;
    let amp5: f32 = 0.9;
    let amp6: f32 = 0.4;
    let amp7: f32 = 0.5;
    let amp8: f32 = 0.7;
    let amp9: f32 = 0.6;
    let amp10: f32 = 0.8;
    let amp11: f32 = 0.9;
    let amp12: f32 = 0.4;
    let amp13: f32 = 0.35;
    let amp14: f32 = 0.65;
    let amp15: f32 = 0.25;
    let amp16: f32 = 0.55;
    let amp17: f32 = 0.85;
    let amp18: f32 = 0.5;
    let amp19: f32 = 0.4;
    let amp20: f32 = 0.6;
    let amp21: f32 = 0.3;
    let amp22: f32 = 0.7;
    let amp23: f32 = 0.5;
    let amp24: f32 = 0.8;

    return amp1 * sin(x * base_freq * freq_x + sftep * 0.0008) +
           amp2 * cos(z * base_freq * freq_z + sftep * 0.0014) +
           amp3 * sin((x + z) * base_freq * 0.5 + sftep * 0.0021) +
           amp4 * cos(x * z * base_freq * freq_x + sftep * 0.0035) +
           amp5 * sin((x - z) * base_freq * 1.5 + sftep * 0.0018) +
           amp6 * cos((x * x + z * z) * base_freq * 0.01 + sftep * 0.0029) +
           amp7 * sin((x + 2.0 * z) * base_freq * 0.75 + sftep * 0.0006) +
           amp8 * cos((x * z - z * z) * base_freq * 0.2 + sftep * 0.0011) +
           amp9 * sin((z * z - x * x) * base_freq * 0.3 + sftep * 0.00027) +
           amp10 * cos((2.0 * x + z * z) * base_freq * 0.4 + sftep * 0.0033) +
           amp11 * sin((3.0 * x - 2.0 * z) * base_freq * 0.6 + sftep * 0.0045) +
           amp12 * cos((x + z * 3.0) * base_freq * 0.1 + sftep * 0.00023) +
           amp13 * sin((x + 2.0 * z) * base_freq * 0.15 + sftep * 0.0015) +
           amp14 * cos((x  - z * 2.0) * base_freq * 0.05 + sftep * 0.00031) +
           amp15 * sin(( z ) * base_freq * 0.9 + sftep * 0.0028) +
           amp16 * cos((x - 2.0 * z ) * base_freq * 0.7 + sftep * 0.00041) +
           amp17 * sin((z - x ) * base_freq * 1.3 + sftep * 0.00017) +
           amp18 * cos((x + 3.0 * z) * base_freq * 0.4 + sftep * 0.0009) +
           amp19 * sin((z * z - 0.5 * x) * base_freq * 0.25 + sftep * 0.0024) +
           amp20 * cos(( x + z * 2.0) * base_freq * 0.8 + sftep * 0.0037) +
           amp21 * sin((z * 2.0 + x * 0.5) * base_freq * 0.6 + sftep * 0.0022) +
           amp22 * cos((3.0 * x ) * base_freq * 0.3 + sftep * 0.0044) +
           amp23 * sin((x * z - 2.0 * z) * base_freq * 0.35 + sftep * 0.0013) +
           amp24 * cos((z + 1.5 * x) * base_freq * 0.2 + sftep * 0.0026) +
           0.8; // Final bias
}


// Function to calculate the scrambled nuground value with three parameters
fn calculate_perlined_snap1(a: f32, b: f32, c: f32, disnt: f32, time: f32) -> f32 {
    let base_offset: f32 = 0.03;

    var the = vec3<f32>( a, b, c );

    var shift_a: f32 = floor( a / disnt);
    var shift_b: f32 = floor( b / disnt);
    var shift_c: f32 = floor( c / disnt);
    var time_variance: f32 = 0.041f;

    var summer: f32=0;

    var tinkerr_1: f32 = EZ_RAND2ER(shift_a*0.732) * EZ_RAND2ER(shift_b*0.6783f) * EZ_RAND2ER(shift_c*0.9783f);
    tinkerr_1 = EZ_RAND2ER(tinkerr_1*1289.5f);
    var dister1 = vec3<f32>( shift_a+0f, shift_b+0f, shift_c+0f );
    var distem1:f32= distance( the, dister1 );
    summer += distem1;

    var tinkerr_2: f32 = EZ_RAND2ER((shift_a+disnt)*0.732) * EZ_RAND2ER(shift_b*0.6783f) * EZ_RAND2ER(shift_c*0.9783f);
    tinkerr_2 = EZ_RAND2ER(tinkerr_2*1289.5f);
    var dister2 = vec3<f32>( shift_a+disnt, shift_b+0f, shift_c+0f );
    var distem2: f32 = distance( the, dister2 );
    summer += distem2;
    
    var tinkerr_3: f32 = EZ_RAND2ER((shift_a+0f)*0.732) * EZ_RAND2ER((shift_b+disnt)*0.6783f) * EZ_RAND2ER(shift_c*0.9783f);
    tinkerr_3 = EZ_RAND2ER(tinkerr_3*1289.5f);
    var dister3 = vec3<f32>( shift_a+0f, shift_b+disnt, shift_c+0f );
    var distem3: f32 = distance( the, dister3 );
    summer += distem3;

    var tinkerr_4: f32 = EZ_RAND2ER((shift_a+disnt)*0.732) * EZ_RAND2ER((shift_b+disnt)*0.6783f) * EZ_RAND2ER(shift_c*0.9783f);
    tinkerr_4 = EZ_RAND2ER(tinkerr_4*1289.5f);
    var dister4 = vec3<f32>( shift_a+disnt, shift_b+disnt, shift_c+0f );
    var distem4: f32 = distance( the, dister4 );
    summer += distem4;

    
    var tinkerr_5: f32 = EZ_RAND2ER((shift_a+0f)*0.732) * EZ_RAND2ER((shift_b+0f)*0.6783f) * EZ_RAND2ER((shift_c+disnt)*0.9783f);
    tinkerr_5 = EZ_RAND2ER(tinkerr_5*1289.5f);
    var dister5 = vec3<f32>( shift_a+0f, shift_b+0f, shift_c+disnt );
    var distem5:f32 = distance( the, dister5 );
    summer += distem5;
    
    var tinkerr_6: f32 = EZ_RAND2ER((shift_a+disnt)*0.732) * EZ_RAND2ER((shift_b+0f)*0.6783f) * EZ_RAND2ER((shift_c+disnt)*0.9783f);
    tinkerr_6 = EZ_RAND2ER(tinkerr_6*1289.5f);
    var dister6 = vec3<f32>( shift_a+disnt, shift_b+0f, shift_c+disnt );
    var distem6:f32 = distance( the, dister6 );
    summer += distem6;

    var tinkerr_7: f32 = EZ_RAND2ER((shift_a+0f)*0.732) * EZ_RAND2ER((shift_b+disnt)*0.6783f) * EZ_RAND2ER((shift_c+disnt)*0.9783f);
    tinkerr_7 = EZ_RAND2ER(tinkerr_7*1289.5f);
    var dister7 = vec3<f32>( shift_a+0f, shift_b+disnt, shift_c+disnt );
    var distem7: f32 = distance( the, dister7 );
    summer += distem7;

    var tinkerr_8: f32 = EZ_RAND2ER((shift_a+disnt)*0.732) * EZ_RAND2ER((shift_b+disnt)*0.6783f) * EZ_RAND2ER((shift_c+disnt)*0.9783f);
    tinkerr_8 = EZ_RAND2ER(tinkerr_8*1289.5f);
    var dister8 = vec3<f32>( shift_a+disnt, shift_b+disnt, shift_c+disnt );
    var distem8: f32 = distance( the, dister8 );
    summer += distem8;


    var endval: f32 = 0f;
    endval += tinkerr_1 * (distem1/summer);
    endval += tinkerr_2 * (distem2/summer);
    endval += tinkerr_3 * (distem3/summer);
    endval += tinkerr_4 * (distem4/summer);
    
    endval += tinkerr_5 * (distem5/summer);
    endval += tinkerr_6 * (distem6/summer);
    endval += tinkerr_7 * (distem7/summer);
    endval += tinkerr_8 * (distem8/summer);


    return endval;
}


fn calculate_surface_normal_from_points(x: f32, z: f32, sftep: f32, radius: f32) -> vec3<f32> {
    // Offset points around the impact location
    let dx: f32 = radius;
    let dz: f32 = radius;

    // Sample the ground height at three nearby points
    let h1: f32 = calculate_nuground(x, z, sftep);          // Center point
    let h2: f32 = calculate_nuground(x + dx, z, sftep);     // Point to the right
    let h3: f32 = calculate_nuground(x, z + dz, sftep);     // Point forward

    // Create two vectors on the surface of the ground
    let v1: vec3<f32> = vec3<f32>(dx, h2 - h1, 0.0);        // Vector along the x-axis
    let v2: vec3<f32> = vec3<f32>(0.0, h3 - h1, dz);        // Vector along the z-axis

    // Compute the cross product of the two vectors to get the surface normal
    let normal: vec3<f32> = vec3<f32>(
        v1.y * v2.z - v1.z * v2.y,  // x-component
        v1.z * v2.x - v1.x * v2.z,  // y-component
        v1.x * v2.y - v1.y * v2.x   // z-component
    );

    // Normalize the normal vector
    let normal_length: f32 = sqrt(normal.x * normal.x + normal.y * normal.y + normal.z * normal.z);
    return normal / normal_length;
}


// Function to calculate the next point on a spiral
fn calculate_spiral_coordinates(index: u32, radius: f32) -> vec2<f32> {
    // The golden angle in radians
    let golden_angle: f32 = 2.39996323; // Approximately 360° / ϕ^2
    
    // Convert the index to a float for calculations
    let idx = f32(index);
    
    // Calculate the angle and distance from the center
    let angle = idx * golden_angle;
    let distance = radius * sqrt(idx);
    
    // Compute x and y coordinates
    let x = cos(angle) * distance;
    let y = sin(angle) * distance;
    
    return vec2<f32>(x, y);
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

    // Return float in [0, 1)
    return f32(x) / 4294967296.0;
}



fn is_springful_entity( ett: u32 ) -> bool {
    return ${FINAL_POINT_DATA.allowedTeesInSprings};// ||
}

fn is_spec_physics_particle( ett: u32 ) -> bool {
    return ${FINAL_POINT_DATA.allowedSpecParticlePhys};// ||
}

fn packThreeBytesToF32( r: f32, g: f32, b: f32 ) -> f32 {
    // Normalize each value to a range between 0 and 1
    return (r / 255f) + (g / 255f) / 256f + (b / 255f) / 65536f;
}

// Depending on the entity role, offset the collision checking locations by this value
fn collidesWithBadEnts( entrole: u32 ) -> bool {// Intakes the ent role and determines if you need to be colliding with bad entities or good entities
    return entrole == 1u || entrole == 2u;
    // if( entrole == 3f ){
    //     //0u;
    // }
    // return true;
    // return ${FINAL_POINT_DATA.MAX_COLL_GOOD_GUYS}u; // start 
}



@compute @workgroup_size(64)
fn main(@builtin(global_invocation_id) global_id: vec3<u32>) {
    let id = global_id.x;

    
    var step: u32 = userInput[6];
    var sftep: f32 = f32(step);

    var da_counter_max: f32 = 99999f;

    // 1) Possibly update terrain
    // Each vertex has 5 floats: x,y,z,u,v
    // let totalVertices = arrayLength(&terrainVertices) / 5;
    if (id < arrayLength(&terrainVertices)/5u) {

        
        let base = id * 5u;
        let vx = terrainVertices[base+0];
        let vy = terrainVertices[base+1];
        let vz = terrainVertices[base+2];//calculate_nuground
        let uu = terrainVertices[base+3];
        let vv = terrainVertices[base+4];

        // Example: make the terrain wave up & down
        // using STEPCOUNT from userInput[6]
        let t = f32(userInput[6]);
        var wave = 0.5 * sin(vx * 0.2 + vz * 0.2 + t * 0.05);
        wave = calculate_nuground( vx, vz, sftep );
        terrainVertices[base+1] = wave; // update y
    }

     
    var ind_main_char: u32 = ${FINAL_POINT_DATA.KEY_PROTAGONIST}u;
    var mainChar: bool = ind_main_char == id; 

    var partSize: u32 = ${FINAL_POINT_DATA.oneParticleSize}u;
    var particleIndex = id * partSize; // certain amount of values per particle
    if (particleIndex >= arrayLength(&particles)) {
        return;
    }
    particleIndex += ${FINAL_POINT_DATA.START_PARTICLES}u;

    var startOfEnts: u32 = ${FINAL_POINT_DATA.START_PARTICLES}u;
    var numBuckets: u32 = ${FINAL_POINT_DATA.bucketsPerimeter}u * ${FINAL_POINT_DATA.bucketsPerimeter}u;
    var bucketsLength: f32 = ${FINAL_POINT_DATA.bucketsPerimeter}f;
    var spacing: f32 = ${FINAL_POINT_DATA.SCALE_SPACING_CONSTANT}f;
    var bucket_pacing: f32 = ${FINAL_POINT_DATA.BUCKET_SPACING}f;

    var listsStartIndex = ${FINAL_POINT_DATA.START_LISTS}u;
    var listSize = ${FINAL_POINT_DATA.SIZE_LISTS_entry_size}u;

    var dbStartInd: u32 = ${FINAL_POINT_DATA.START_DB}u;

    var totalBucketParticles: u32 = ${FINAL_POINT_DATA.allBucketParticles}u;
    
    
    var maxgoodents: u32 = ${FINAL_POINT_DATA.currentgood}u;
    var maxbadents: u32 = ${FINAL_POINT_DATA.currentbad}u;

    var startOfCpuScratch: u32 = ${FINAL_POINT_DATA.START_SCRATCH}u;    // index in the particles array where the scratch pad starts 
                                                                // used for writing specific t=13, (TEAL BLOCK's) that need to get info back to the game
                                                                // for use - and camera calcualtions?
    //var readbackSlotSize: u32 = ${FINAL_POINT_DATA.WRITE_SLOT_SIZE}u;
    var startOfSFXCpuScratch: u32 = ${FINAL_POINT_DATA.START_SFX}u;
    var totalSfxs: u32 = ${FINAL_POINT_DATA.TOTAL_SFXS}u;
    var sfxSlotSize: u32 = ${FINAL_POINT_DATA.SIZE_SFX_SLOT}u;

    var maxxedGoodEnts: u32 = ${FINAL_POINT_DATA.MAX_COLL_GOOD_GUYS}u;    // how many u should look through AT MOST
    var maxxedBadEnts: u32 = ${FINAL_POINT_DATA.MAX_COLL_BAD_GUYS}u;

    var weaponsDbStart: u32 = ${FINAL_POINT_DATA.START_OF_WEAPONS}u;
    var weaponsDbAmt: u32 = ${FINAL_POINT_DATA.WEAPONS_REGISTERED}u;

    var rolesStartInd: u32 = ${FINAL_POINT_DATA.START_OF_ENT_ROLES_IN_DB}u;
    var rolesSize: u32 = ${FINAL_POINT_DATA.ENT_ROLES_SIZE}u;

    
    var resPartSize: u32 =  ${FINAL_POINT_DATA.RES_PART_SIZE}u;   // how large is a particle reserved section

    var tee: u32 = userInput[7];
    var eff: u32 = userInput[8];
    var gee: u32 = userInput[9];
    var esh: u32 = userInput[10];

    var spac:u32 = userInput[13];
    var shft:u32 = userInput[14];
    
    var eEvent:u32 = userInput[15]; // 1 or 0, and gets reset every frame 
    var qEvent:u32 = userInput[16];

    var targeted_ent_id: u32 = userInput[17];// +1'd id of the ent you're targeting (not the thing being controleld)

    var ukey: u32 = userInput[18]; //u key maybe just for healing

    var enterscope: u32 = userInput[19]; //zoomed in scope

    var debugvizuals: u32 = userInput[20]; // for showing the xyz axis

    var pausedd: bool = false;
    if(userInput[11] > 0){
        pausedd = true;
    }

    var targetingid: u32 = userInput[12];// +1'd id of the ent youre controlling

    var sgrav: f32 = ${FINAL_POINT_DATA.STD_GRAV}f;

    var spawnStartX: f32 = ${FINAL_POINT_DATA.START_OF_SPAWN_X}f;
    var spawnStartY: f32 = ${FINAL_POINT_DATA.START_OF_SPAWN_Y}f;
    var spawnSizeX: f32 = ${FINAL_POINT_DATA.SPAWN_SIZE_X}f;
    var spawnSizeY: f32 = ${FINAL_POINT_DATA.SPAWN_SIZE_Y}f;

    


    var pingpong: bool = ( step % 2 ) == 0u;
    var grabOffset: u32 = 0u;
    var writeOffset: u32 = ${FINAL_POINT_DATA.PARTICLE_ATTRIBUTES}u;
    var sfxOffset: u32 = 0u;
    var sfxWriteOffset: u32 = 0u;
    if(!pingpong){
        grabOffset = ${FINAL_POINT_DATA.PARTICLE_ATTRIBUTES}u;
        writeOffset = 0u;
        sfxOffset = 1u;
        sfxWriteOffset = 1u;
    }
    
    sfxOffset = 0u;
    sfxWriteOffset = 0u;

 

    var t = particles[particleIndex + 0 + grabOffset];
    var tutu: u32 = u32(t);
    // DETERMINE which set is READ and which set is WRITE 
    var x: f32 = particles[particleIndex + 1 + grabOffset];
    var y: f32 = particles[particleIndex + 2 + grabOffset];
    var z: f32 = particles[particleIndex + 3 + grabOffset]; 

    var vx = particles[particleIndex + 4 + grabOffset];
    var vy = particles[particleIndex + 5 + grabOffset];
    var vz = particles[particleIndex + 6 + grabOffset];

    var metaone = particles[particleIndex + 7 + grabOffset];
    var metatwo = particles[particleIndex + 8 + grabOffset];
    var metathree = particles[particleIndex + 9 + grabOffset];
    var meta3u: u32 = u32( metathree );
    var metafour = particles[particleIndex + 10 + grabOffset];
    var meta4u: u32 = u32( metafour );

    var metafive = particles[particleIndex + 11 + grabOffset];
    var metasix = particles[particleIndex + 12 + grabOffset];
    var metaseven = particles[particleIndex + 13 + grabOffset];
    var meta7u: u32 = u32( metaseven );
    var metaeight= particles[particleIndex + 14 + grabOffset];
    var meta8u: u32 = u32( metaeight );

    var me = vec3<f32>( x, y, z );
    var you = vec3<f32>(x, y, z );

    // Surface equation
    // var nuground: f32 = 0.15 * sin(x*1 + sftep * 0.0008);
    // nuground += 0.1;
    // nuground += 0.25 * cos(z*1 + sftep * 0.0014);

    // var dnuground_dx: f32 = 0.13 * cos(x*0.2 + sftep * 0.0004);
    // var dnuground_dz: f32 = -0.2 * sin(z*0.2 + sftep * 0.0007);
 

    // NEW! "Surface equation" ^
    let phase_offset1: f32 = 0.0008;  // Phase offset fo
    var nuground: f32 = calculate_nuground(x, z, sftep); // Final bias




    //   ____    ____    ____    ___   _   _    ____   ____  
    //  / ___|  |  _ \  |  _ \  |_ _| | \ | |  / ___| / ___| 
    //  \___ \  | |_) | | |_) |  | |  |  \| | | |  _  \___ \ 
    //   ___) | |  __/  |  _ <   | |  | |\  | | |_| |  ___) |
    //  |____/  |_|     |_| \_\ |___| |_| \_|  \____| |____/ 
                                                                                



    var std_spring_k_val: f32 = 0.0092;//0.0115f;



    //   _____   _   _   _____           ____     ___    _       _____   ____  
    //  | ____| | \ | | |_   _|         |  _ \   / _ \  | |     | ____| / ___| 
    //  |  _|   |  \| |   | |           | |_) | | | | | | |     |  _|   \___ \ 
    //  | |___  | |\  |   | |           |  _ <  | |_| | | |___  | |___   ___) |
    //  |_____| |_| \_|   |_|    _____  |_| \_\  \___/  |_____| |_____| |____/ 
    //                          |_____|                                        


    // Entity role specific variables
    var hub_ent_role: u32 = 0u;

    var er_top_pull: f32 = 0f;
    var er_bottom_pull: f32 = 0f;
    var er_target_id: u32 = 0u;
    //var er_collide_with: u32 = 0u;
    var er_forward_engine: f32 = 0f;
    var er_backward_engine: f32 = 0f;
    var er_grav_pull: f32 = sgrav + 0f;
    var user_ctrl_scheme: u32 = 0u;
    var top_bottom_mass_ratio: f32 = 1f;
    var rotation_engine: f32 = 0f;

    var behaviour_type: u32 = 0u;

    // As long as it's not a 13u (singular nucleus command center for the entity,) 
    //  - use the meta3u which will be the teal particle everytime
    if( !pausedd ){

        if( tutu == 1u ){ // Collision bucket

            // This is for always resetting i guess?
            if(id < totalSfxs){
                particles[ startOfSFXCpuScratch + (id*sfxSlotSize) + sfxWriteOffset ] = 0;
            }

            
            var orbitmaincharx = particles[ startOfEnts + (ind_main_char*partSize) + 1u + grabOffset ];//GETTING THE XYZ OF THE ORIENT PRTICLE FOR U
            var orbitmainchary = particles[ startOfEnts + (ind_main_char*partSize) + 2u + grabOffset ];
            var orbitmaincharz = particles[ startOfEnts + (ind_main_char*partSize) + 3u + grabOffset ];


            //-----------------------------------------------
            //          R ...     G ...     B ... axis lines
            //________________________________________________


 
            // Gets the Meta3 
            var frontPoint = vec3<f32>( 0,0,0 );  // gontains the eternal front ireinter entity 
            var dbiOfMain: u32 = u32( particles[startOfEnts + (ind_main_char*partSize) + 9u + grabOffset] );
            dbiOfMain = dbiOfMain - 1u;

            // GET FRONT WISE DIRECTION
            var oriArea: u32 = u32( particles[dbStartInd + dbiOfMain + 0u] );  // this gets the front orienter id thing in the db
            oriArea = oriArea - 1u; 
            frontPoint.x = particles[ startOfEnts + (oriArea*partSize) + 1u + grabOffset ];//GETTING THE XYZ OF THE ORIENT PRTICLE (FRONT) FOR U
            frontPoint.y = particles[ startOfEnts + (oriArea*partSize) + 2u + grabOffset ];
            frontPoint.z = particles[ startOfEnts + (oriArea*partSize) + 3u + grabOffset ];

            var directAheadDir = normalize( frontPoint - vec3<f32>( orbitmaincharx, orbitmainchary, orbitmaincharz ) );

            oriArea = u32( particles[dbStartInd + dbiOfMain + 1u] );  // this gets the back orienter id thing in the db
            oriArea = oriArea - 1u; 
            frontPoint.x = particles[ startOfEnts + (oriArea*partSize) + 1u + grabOffset ];//GETTING THE XYZ OF THE ORIENT PRTICLE (BACK) FOR U
            frontPoint.y = particles[ startOfEnts + (oriArea*partSize) + 2u + grabOffset ];
            frontPoint.z = particles[ startOfEnts + (oriArea*partSize) + 3u + grabOffset ];
            var directAheadFromBack = normalize( vec3<f32>( orbitmaincharx, orbitmainchary, orbitmaincharz ) - frontPoint );
            directAheadDir = ((directAheadDir*0.5f) + (directAheadFromBack*0.5f));

            // GET TOP WISE DIRECTION
            oriArea = u32( particles[dbStartInd + dbiOfMain + 2u] );  // this gets the top orienter id thing in the db
            oriArea = oriArea - 1u; 
            frontPoint.x = particles[ startOfEnts + (oriArea*partSize) + 1u + grabOffset ];//GETTING THE XYZ OF THE ORIENT PRTICLE (TOP) FOR U
            frontPoint.y = particles[ startOfEnts + (oriArea*partSize) + 2u + grabOffset ];
            frontPoint.z = particles[ startOfEnts + (oriArea*partSize) + 3u + grabOffset ];

            var directUpDir = normalize( frontPoint - vec3<f32>( orbitmaincharx, orbitmainchary, orbitmaincharz ) );
            // GET SIDE WAYS DIRECTION
            oriArea = u32( particles[dbStartInd + dbiOfMain + 4u] );  // this gets the RIGHT orienter id thing in the db
            oriArea = oriArea - 1u;
            frontPoint.x = particles[ startOfEnts + (oriArea*partSize) + 1u + grabOffset ];//GETTING THE XYZ OF THE ORIENT PRTICLE (SIDE) FOR U
            frontPoint.y = particles[ startOfEnts + (oriArea*partSize) + 2u + grabOffset ];
            frontPoint.z = particles[ startOfEnts + (oriArea*partSize) + 3u + grabOffset ];

            var directSideDir = normalize( frontPoint - vec3<f32>( orbitmaincharx, orbitmainchary, orbitmaincharz ) );


            // DRAW THE ORINERTERS AXIES (USES 300 PARTS )
            var axisLength: u32 = 50u;
            var axisVal: u32 = id / axisLength;
            var axdotSpcng: f32 = 0.05f;

            // LOCK ON INDICATOR TARGETING RETICLE
            //var lockOnPointer

            if( axisVal < 3u ){
                if( axisVal == 0u ){        // Front direction

                    if( enterscope == 1u ){
                        axdotSpcng *= 4f;
                    }
                    x = orbitmaincharx + (directAheadDir.x * f32(id%axisLength) * axdotSpcng);
                    y = orbitmainchary + (directAheadDir.y * f32(id%axisLength) * axdotSpcng);
                    z = orbitmaincharz + (directAheadDir.z * f32(id%axisLength) * axdotSpcng);
                    metafour = 190f;
                    metafive = 10f;
                    metasix = 10f;
                }
                else if( axisVal == 1u ){   // Top direction
                    x = orbitmaincharx + (directUpDir.x * f32(id%axisLength) * axdotSpcng);
                    y = orbitmainchary + (directUpDir.y * f32(id%axisLength) * axdotSpcng);
                    z = orbitmaincharz + (directUpDir.z * f32(id%axisLength) * axdotSpcng);
                    metafour = 10f;
                    metafive = 10f;
                    metasix = 190f;
                }
                else if( axisVal == 2u ){   // Side direction
                    x = orbitmaincharx + (directSideDir.x * f32(id%axisLength) * axdotSpcng);
                    y = orbitmainchary + (directSideDir.y * f32(id%axisLength) * axdotSpcng);
                    z = orbitmaincharz + (directSideDir.z * f32(id%axisLength) * axdotSpcng);
                    metafour = 10f;
                    metafive = 190f;
                    metasix = 10f;
                }

                if( debugvizuals < 1u ){
                    x = orbitmaincharx;
                    y = orbitmainchary;
                    z = orbitmaincharz;
                }
            }

            // SNAP to walls
            else if( axisVal < 6u ){ 
                if( axisVal == 3u ){        // X axis disterac
                    axdotSpcng = orbitmaincharx / f32( axisLength );
                    x = orbitmaincharx - f32(id%axisLength) * axdotSpcng;
                    y = orbitmainchary;
                    z = orbitmaincharz;
                    metafour = 250f;
                    metafive = 170f;
                    metasix = 170f;
                }
                else if( axisVal == 4u ){   // Y axis direction
                    axdotSpcng = orbitmainchary / f32( axisLength );
                    x = orbitmaincharx;
                    y = orbitmainchary - f32(id%axisLength) * axdotSpcng;
                    z = orbitmaincharz;
                    metafour = 170f;
                    metafive = 170f;
                    metasix = 220f + 30f*sin(sftep*0.2f + y/13f);
                }
                else if( axisVal == 5u ){   // Z axis direction
                    axdotSpcng = orbitmaincharz / f32( axisLength );
                    x = orbitmaincharx;
                    y = orbitmainchary;
                    z = orbitmaincharz - f32(id%axisLength) * axdotSpcng;
                    metafour = 170f;
                    metafive = 220f + 30f*sin(sftep*0.2f + z/13f);
                    metasix = 170f;
                }
                if( debugvizuals < 1u ){
                    x = orbitmaincharx;
                    y = orbitmainchary;
                    z = orbitmaincharz;
                }
            }

            // WHERE to STORE THE REST OF THE BUCKET PARTICLE VALUES
            else{

                // NOW YOu have 3796 =   4096 - 300 

                // To work with
                var rbemInd = id - 300u;
                // now it's between 0 and 3795...

                


                // var ggg = calculate_spiral_coordinates( id, 0.3f );
                // x = orbitmaincharx + ggg.x;
                // z = orbitmaincharz + ggg.y;
                // y = orbitmainchary;//nuground + 0.1;
                // var pwer: f32 = calculate_perlined_snap1( x, y, z, bucket_pacing*4, sftep );
                // if( pwer > 0.25f ){
                //     metafour = 100f+ pwer *120f;
                //     metafive = 100f+ pwer *120f;
                //     metasix = 100f + pwer *120f;
                // }
                // else{
                //     metafour = 0f;
                //     metafive = 0f;
                //     metasix = 0f;
                // }
            }
        }

        // if you are not a control nucleus particle, then grab this value
        if( tutu != 13u && meta3u > 0u ){
            var mm3 = meta3u - 1u; // now mm3 is the particle id 
            hub_ent_role = u32( particles[ startOfEnts + (mm3*partSize) + 13u + grabOffset ] );//GETTING THE META 7 of the teal particle
            //                                                                                      (WHICH IS THE ENTITY_ROLE)

            er_top_pull = particles[ dbStartInd + rolesStartInd + (hub_ent_role*rolesSize) + 0u ];
            er_bottom_pull = particles[ dbStartInd + rolesStartInd + (hub_ent_role*rolesSize) + 1u ];
            er_target_id = u32( particles[ dbStartInd + rolesStartInd + (hub_ent_role*rolesSize) + 2u ] );
            //er_collide_with = u32( particles[ dbStartInd + rolesStartInd + (hub_ent_role*rolesSize) + 3u ] ); 
            er_forward_engine = particles[ dbStartInd + rolesStartInd + (hub_ent_role*rolesSize) + 4u ];
            er_backward_engine = particles[ dbStartInd + rolesStartInd + (hub_ent_role*rolesSize) + 5u ];
            er_grav_pull = particles[ dbStartInd + rolesStartInd + (hub_ent_role*rolesSize) + 6u ];
            user_ctrl_scheme = u32(particles[ dbStartInd + rolesStartInd + (hub_ent_role*rolesSize) + 7u ]);
            top_bottom_mass_ratio = particles[ dbStartInd + rolesStartInd + (hub_ent_role*rolesSize) + 8u ];
            rotation_engine = particles[ dbStartInd + rolesStartInd + (hub_ent_role*rolesSize) + 9u ];

            behaviour_type = u32( particles[ dbStartInd + rolesStartInd + (hub_ent_role*rolesSize) + 10u ] );


            //var collide_with = particles[ dbStartInd + rolesStartInd + (hub_ent_role*rolesSize) + 3u ];//collide_with... -> (2=both), (1=bad), (0=good)
        }


    
        // Spring-ful entity

        if( is_springful_entity(tutu) ){//springListLookupId > 0u && totalListEntries > 0u &&  && meta3u > 0u){
    
            var springListLookupId: u32 = u32(metaone);
            var oppPar: u32 = 0u;//opposition paritcle index

            var totalListEntries: u32 = u32(metatwo);
            var q: u32 = 0u;
            var dbrefid: u32 = 0u + meta3u;      // in t2 this points to the DB logic

            var stabledist: f32 = 0f;
            var kvalue: f32 = 0f + std_spring_k_val;

            var mymass: f32 = 1f;// used for factoring in more influcnetial control nodes
            if( tutu == 5u ){
                mymass = 1f;   // if a collision particle w a radius, have more sway TODO - kept at 1 for now because others are unstable
            }


            // Loop through weapons and apply its effects to the particles If u dare 
            var ww: u32 = 0u; 
            loop{
                if ww >= weaponsDbAmt { break; }
                var weaponParticleId: u32 = u32( particles[ dbStartInd + weaponsDbStart + (ww*1u) ] );
                
                var typeOfWepon: f32 = particles[ startOfEnts + (weaponParticleId*partSize) + 0u + grabOffset ];        // type 
                var radiusOfExpl: f32 = particles[ startOfEnts + (weaponParticleId*partSize) + 11u + grabOffset ];      // green (radius)
                var missileArmed: f32 = particles[ startOfEnts + (weaponParticleId*partSize) + 12u + grabOffset ];      // blue (radius)
                    // (metafive)
                var explEpicenter = vec3<f32>( 
                    particles[ startOfEnts + (weaponParticleId*partSize) + 1u + grabOffset ],
                    particles[ startOfEnts + (weaponParticleId*partSize) + 2u + grabOffset ],
                    particles[ startOfEnts + (weaponParticleId*partSize) + 3u + grabOffset ] );  //x,y,z of the stuff

                //radiusOfExpl = 1f;
                var dst = distance( me, explEpicenter );

                // If particle is within the value here
                if( typeOfWepon == 19f && dst < radiusOfExpl && radiusOfExpl > 0f ){
                    dst = 1f - (dst/radiusOfExpl);//dst - radiusOfExpl;
                    var derer = normalize( me - explEpicenter );    // the dir

                    // How hard to push back from the collision ball (this value is)
                    //if( dst < 0 ){
                    derer *= (std_spring_k_val*132f) * (dst*dst);
                    // }
                    // else{ 
                    //     derer *= -(std_spring_k_val*147f) * abs(dst);
                    // }

                    vx += derer.x;
                    vy += derer.y;
                    vz += derer.z;
                }
                ww = ww + 1u;
            }


            if( springListLookupId > 0u && totalListEntries > 0u ){//} &&  && dbrefid > 0u){

                springListLookupId = springListLookupId - 1u;

                //var totalSprings: f32 = f32(totalListEntries); 
                var aveFriendsDir = vec3<f32>( 0, 0.00001f, 0 );
                var gravitateToCenter: bool = false; // if close enough to do repair

                // OR THIS LET IN GOES TO CRAZY
                loop {
                    if q >= totalListEntries { break; }
                    var exactSpringEntry: u32 = listsStartIndex + (springListLookupId+q)*listSize;
                    oppPar = u32(particles[ exactSpringEntry + 0u ]);
                    stabledist = particles[ exactSpringEntry + 1u ];
                    var sprMode: f32 = particles[ exactSpringEntry + 2u ];    // 0 is the stuff gets permanently destroyed 
                                                                            // 1 is active spring
                    //var kvalue: f32 = 1f;   // this just stays normal
 

                    var thet: f32 = particles[ startOfEnts + (oppPar*partSize) + 0u + grabOffset ];// if effects u ornot
                    you.x = particles[ startOfEnts + (oppPar*partSize) + 1u + grabOffset ];
                    you.y = particles[ startOfEnts + (oppPar*partSize) + 2u + grabOffset ];
                    you.z = particles[ startOfEnts + (oppPar*partSize) + 3u + grabOffset ];


                    // grab the distance between the two masses
                    var dist = distance( me, you );
                    var dirr = vec3<f32>( 0, 0, 0 );
                    

                    // If deactivated cancel the things influence
                    // if( thet == 4f || sprMode < 1f ){ // dactivate or not
                    //     dirr *= 0f;
                    // }

                    // Apply spring if it's physically possible
                    //--->>>START>..... 
                    if( dist > 0 ){

                        
                        var snpMulti: f32 = 0.74f;

                        // If normal spring forces
                        if( sprMode == 1f ){

                            var snapSpring: bool = false;
                            // Normal spring snaps
                            if( ( t == 2f && thet == 2f ) ){ // normal spring snaps
                                if( dist > snpMulti*5.5f*stabledist ){
                                    snapSpring = true;
                                }
                            }
                            //Collisinm sprintgs
                            else if(( t == 5f || thet == 5f ) ){ // collision sphere connecter
                                if( dist > snpMulti*8.3f*stabledist ){
                                    snapSpring = true;
                                }
                            }
                            // Middle section (super stuf)
                            else if(( t == 12f || thet == 12f ) || ( t == 13f || thet == 13f ) ){
                                if( dist > snpMulti*10.3f*stabledist ){
                                    snapSpring = true;
                                }
                            }
                            // the other more 'structural' orienting particles nad stuff
                            else if( dist > snpMulti*7.0f*stabledist ){
                                snapSpring = true;
                            }

                            if( snapSpring ){ 
                                metafour += 30f; // make slightly more red
                                //metasix += t*1000f; 
                                //t = 4f;
                                particles[ exactSpringEntry + 2u ] = 0f;// deactivate spring
                                // SFX spring snap
                                particles[ startOfSFXCpuScratch + (2u*sfxSlotSize) + sfxOffset ] = 1;
                            }
                            dist = (stabledist - dist);
                            dirr = normalize( you - me ); 
                        }

                        // Dead spring but are u supposed to heal? 
                        // when the 'HEAL' key is going
                        else if( sprMode == 0f && ukey == 1u && false ){
                            aveFriendsDir += me - you; // live spring move towards tem
                            //dist = (stabledist - dist);
                            if(dist < snpMulti*2.4f*stabledist){ // within the healing range!
                                metafour -= 30f;
                                
                                particles[ exactSpringEntry + 2u ] = 1f;// reactivate spring
                                // SFX spring snap (TODO make it heal)
                                particles[ startOfSFXCpuScratch + (0u*sfxSlotSize) + sfxOffset ] = 1;
                            }
                            else if(meta3u > 0u){ // is there a teal ind?
                                gravitateToCenter = true;
                            }
                        }

                        // direction nullifaciotn because 4 dead
                        else{
                            dirr.x = 0f;
                            dirr.y = 0f;
                            dirr.z = 0f;
                        }


                        // Gravitate towards
                        if( gravitateToCenter ){

                            aveFriendsDir = normalize(aveFriendsDir);// the difrection forneindas


                            // Get center point (weight it 2x as it's friends)
                            you.x = particles[ startOfEnts + ((meta3u-1u)*partSize) + 1u + grabOffset ];//GETTING THE XYZ OF THE ORIENT PRTICLE FOR U
                            you.y = particles[ startOfEnts + ((meta3u-1u)*partSize) + 2u + grabOffset ];
                            you.z = particles[ startOfEnts + ((meta3u-1u)*partSize) + 3u + grabOffset ];

                            // you = normalize(me - you);
                            // dirr = normalize( aveFriendsDir + you  * 3f); 

                            dirr = aveFriendsDir;

                            dist = 0.1f;
                            kvalue = -0.00005f;
                        }
                        

                        
                        // Distance to smaller than 0
                        if( dist < 0 ){
                            dist = max( -0.8f, dist );
                            dirr *= kvalue * abs(dist);
                        }
                        else{
                            dist = min( 0.8f, dist );
                            dirr *= -kvalue * abs(dist);
                        } 

                        
                        
                    }
                    // Random jostling for rare case zero-distance springs
                    else{
                        var jseed: u32 = springListLookupId + u32(you.x*1000f) + u32(you.y*1000f)*15u + u32(you.z*1000f)*113u;
                        let ja: u32 = 1664525u;
                        let jc: u32 = 1013904223u;
                        var jresult: u32 = ja * jseed + jc;
                        var jpush: f32 = f32( jresult % 32u ) * 0.000002f;
                        dirr.x = jpush;
                        dirr.x *= -1f + (2f * f32( jresult & 1u ));
                        dirr.y = jpush;
                        dirr.y *= -1f + (2f * f32( (jresult >> 1u) & 1u ));
                        dirr.z = jpush;
                        dirr.z *= -1f + (2f * f32( (jresult >> 2u) & 1u ));
                    }

                    // This now adds the force of the spring to the velocity of the mass
                    vx += dirr.x;
                    vy += dirr.y;
                    vz += dirr.z; 

                    q = q + 1u;
                }
 


            }       // End of if statement

    

            vy -= er_grav_pull;

            // if( thrust > 0u && id > 120+1024 && id < 2925+1024 ){
            //     vy += 3f * 0.0045f;
            //     vx += 3f * 0.0013f;
            //     vz += 3f * 0.0015f;
            // }
        }
        // Ground particle // where are these no used TODO...
        else if( tutu == 3u ){
            y = nuground;
            // vx = 0f;
            // vy = 0f;
            // vz = 0f;
        }
        

        // Check for if your assigned closest collision ball has something you need to pay attention to:
        // If this is true then this particle is part of a larger entity
        if( tutu == 2u || tutu == 4u || (tutu >= 6u && tutu <= 12u) ){      // I GUESS t13 is just ignored, which is fine
            var collballind: u32 = u32(metaseven);
            if( collballind > 0u ){// yes there is an ind here
                collballind = collballind - 1u;

                // ^ is now the index of your closest coll ball

                collballind = u32( particles[ startOfEnts + (collballind*partSize) + 14u + grabOffset ] );

                // ^ is now the id location of the coll ball (0 is none are a concern)

                if( collballind > 0u ){
                    
                    collballind = collballind - 1u;
                    
                    // ^ is the index of the coll ball (t5) you need to deal with 

                    var radiusOfCollBall: f32 = particles[ startOfEnts + (collballind*partSize) + 13u + grabOffset ];
                    var locOfCollBall = vec3<f32>( 
                        particles[ startOfEnts + (collballind*partSize) + 1u + grabOffset ],
                        particles[ startOfEnts + (collballind*partSize) + 2u + grabOffset ],
                        particles[ startOfEnts + (collballind*partSize) + 3u + grabOffset ] );

                    var dst = distance( me, locOfCollBall );

                    // If particle that is PART Of an entity (becaues it's in this if statment)
                    if( dst < radiusOfCollBall ){
                        dst = dst - radiusOfCollBall;
                        var derer = normalize( me - locOfCollBall );    // the dir
                        // How hard to push back from the collision ball (this value is)
                        if( dst < 0 ){
                            derer *= (std_spring_k_val*17f) * abs(dst);
                        }
                        else{ 
                            derer *= -(std_spring_k_val*17f) * abs(dst);
                        }
                        vx += derer.x;
                        vy += derer.y;
                        vz += derer.z;
                        //particles[ startOfSFXCpuScratch + (0u*sfxSlotSize) + sfxOffset ] = 1;
                    }

                }


            }

        }
        
        
        // Dead spring i guess?
        if( tutu == 4u ){
            //vy -= sgrav;
        }


        // Collision sphere i guess, o gawd (t will decide whcih hits which)
        // Update what is closer to u
        if( tutu == 5u ){
            // get the teal entity
            var tealind: u32 = meta3u;
            
            var closestCollBlock: u32 = 0u;// (0 obivously means undecided)     // USED FOR THE meta 7
            var distToClosest: f32 = 99999f;

            // Check if a valid teal block herer (which there always... should be?)
            if( tealind > 0u){
                tealind = tealind - 1u;
                var entity_role_seven: u32 = u32( particles[ startOfEnts + (tealind*partSize) + 13u + grabOffset ] );//GETTING THE META 7 of the teal particle
                //                                                                                      (WHICH IS THE ENTITY_ROLE)
                var collide_with = particles[ dbStartInd + rolesStartInd + (entity_role_seven*rolesSize) + 3u ];//collide_with... -> (2=both), (1=bad), (0=good)


                var maxEntsToCheck: u32 = 0u;
                var entsCheckingStart: u32 = 0u;
                

                // Collide with bad (you are car role)
                if(collide_with == 1f){//if( entity_role_seven == 1u){//if( collide_with == 0f || collide_with == 2f ){
                    maxEntsToCheck = maxEntsToCheck + maxbadents;
                    entsCheckingStart = 0u + maxxedGoodEnts;
                }

                // Collide with good (you are evil care role)
                else if(collide_with == 0f){//if( entity_role_seven == 3u){//if( collide_with == 1f || collide_with == 2f ){
                    maxEntsToCheck = maxEntsToCheck + maxgoodents;
                    entsCheckingStart = 0u;
                }

                // Collide with good AND bad  EXCEPT urself (??? u are grass i guess idk)
                else if(collide_with == 2f){ 
                    maxEntsToCheck = maxbadents + maxgoodents;
                    entsCheckingStart = 0u;
                }





                // DONUTMODIFT<- ThiS IS ONE of THREE instances looping through collisoin balls
                var ee: u32 = 0u;
                loop {
                    if ee >= maxEntsToCheck { break; } // go through each bad entity
                        //                          WITH the objective that you want to get yor

                    var veri: u32 = ee + 0u; //modified ee ind for covering all 
                    
                    // In next stage
                    if( collide_with == 2f && ee >= maxgoodents){
                        veri = ee - maxgoodents;
                        entsCheckingStart = maxxedGoodEnts;// start checking at the start of the bad ents now
                    } 

                    var indOfBadEntity: u32 = u32(particles[ dbStartInd + entsCheckingStart + veri ]) - 1u;  // A pure id of particle t=5 of a bad guy with a radius
                    //                                                                          AND only t=5 entities in the db ent list 
                    var locationOfEnt = vec3<f32>( 
                        particles[ startOfEnts + (indOfBadEntity*partSize) + 1u + grabOffset ],
                        particles[ startOfEnts + (indOfBadEntity*partSize) + 2u + grabOffset ],
                        particles[ startOfEnts + (indOfBadEntity*partSize) + 3u + grabOffset ] );

                    var radis: f32 = particles[ startOfEnts + (indOfBadEntity*partSize) + 13u + grabOffset ];   // (THE META 7 for a t=5 is the radius)
                    var tealIndOf: u32 = u32( particles[ startOfEnts + (indOfBadEntity*partSize) + 9u + grabOffset ] );  // THE meta 3 teal value
                    

                    var dist = distance( me, locationOfEnt );

                    if( dist < (radis+metaseven) && tealIndOf != meta3u){ // if taking the punishment, consider it a candidate, always reject own 
                        dist = dist - (radis+metaseven);
                        var thderr = normalize( me - locationOfEnt );

                        if( dist < 0 ){
                            thderr *= (std_spring_k_val*5f) * abs(dist) * 0f;
                        }
                        else{ 
                            thderr *= -(std_spring_k_val*5f) * abs(dist) * 0f;
                        }
                        // Spring snap
                        // if( dist > 2.4*stabledist ){
                        //     thderr *= 0f;
                        //     t = 4f;     // change to dead spring
                        // } 

                        //t = 4;
                        vx += thderr.x;
                        vy += thderr.y;
                        vz += thderr.z;

                        if(dist < distToClosest){
                            distToClosest = dist;
                            closestCollBlock = indOfBadEntity + 1u; // index 1'd it and set it to the thing
                        }
                    }

                    ee = ee + 1u;
                }

            }

            metaeight = f32( closestCollBlock );    // and whatever is put in here, the closest particle that has this collision sphere as its closest collider receives it

            vy -= er_grav_pull;
        }




        //Top
        if( tutu == 8u ){
            vy += er_top_pull;
        }
        //Bottom
        if( tutu == 9u ){
            vy += er_bottom_pull;
        }



        //    __            ___    ____    ___   _____   _   _   _____ 
        //   / /_          / _ \  |  _ \  |_ _| | ____| | \ | | |_   _|
        //  | '_ \        | | | | | |_) |  | |  |  _|   |  \| |   | |  
        //  | (_) |       | |_| | |  _ <   | |  | |___  | |\  |   | |  
        //   \___/         \___/  |_| \_\ |___| |_____| |_| \_|   |_|  
                                                                    
        //    ____    ___    _   _   _____   ____     ___    _         
        //   / ___|  / _ \  | \ | | |_   _| |  _ \   / _ \  | |        
        //  | |     | | | | |  \| |   | |   | |_) | | | | | | |        
        //  | |___  | |_| | | |\  |   | |   |  _ <  | |_| | | |___     
        //   \____|  \___/  |_| \_|   |_|   |_| \_\  \___/  |_____|    
                                                                
                                                                                        



        // Front Control pad ( - cross reference with idk...
        //  Front         Back          Top           Bottom        Left           Right          Middle section
        if( tutu == 6u || tutu == 7u || tutu == 8u || tutu == 9u || tutu == 10u || tutu == 11u || tutu == 12u ){
            var ctrlpanelwmainchar: bool = ind_main_char == (meta3u-1);// TRUE in the case that you are a control panel and ur connected to main char
    
            var helprind: u32 = meta3u; 

            var frontPoint = vec3<f32>( x, y, z );  // gontains the eternal front ireinter entity 

            //      helprind is now the hub entity (still (+1'd)) (THE TREAL PARTICLE)
            if( helprind > 0u){
                helprind = helprind - 1u; 
                //helprind = helprind - 1u;
                you.x = particles[ startOfEnts + (helprind*partSize) + 1u + grabOffset ];//GETTING THE XYZ OF THE ORIENT PRTICLE FOR U
                you.y = particles[ startOfEnts + (helprind*partSize) + 2u + grabOffset ];
                you.z = particles[ startOfEnts + (helprind*partSize) + 3u + grabOffset ];

                // Gets the Meta3 
                var frontArea: u32 = u32( particles[startOfEnts + (helprind*partSize) + 9u + grabOffset] );
                frontArea = frontArea - 1u;
                frontArea = u32( particles[dbStartInd + frontArea + 0u] );  // this gets the front orienter id thing in the db
                frontArea = frontArea - 1u;

                frontPoint.x = particles[ startOfEnts + (frontArea*partSize) + 1u + grabOffset ];//GETTING THE XYZ OF THE ORIENT PRTICLE (FRONT) FOR U
                frontPoint.y = particles[ startOfEnts + (frontArea*partSize) + 2u + grabOffset ];
                frontPoint.z = particles[ startOfEnts + (frontArea*partSize) + 3u + grabOffset ];

                var straightAheadDir = normalize( frontPoint - you );

                var velocityOfFrontOrien = vec3<f32>( 
                    particles[ startOfEnts + (frontArea*partSize) + 4u + grabOffset ], 
                    particles[ startOfEnts + (frontArea*partSize) + 5u + grabOffset ], 
                    particles[ startOfEnts + (frontArea*partSize) + 6u + grabOffset ] );
                velocityOfFrontOrien = normalize( velocityOfFrontOrien );



                // Now get the TOP area
                    // Get the meta3 again
                frontArea = u32( particles[startOfEnts + (helprind*partSize) + 9u + grabOffset] );
                frontArea = frontArea - 1u;
                frontArea = u32( particles[dbStartInd + frontArea + 2u] );  // this gets the top orienter id thing in the db
                frontArea = frontArea - 1u;

                frontPoint.x = particles[ startOfEnts + (frontArea*partSize) + 1u + grabOffset ];//GETTING THE XYZ OF THE ORIENT PRTICLE (TOP) FOR U
                frontPoint.y = particles[ startOfEnts + (frontArea*partSize) + 2u + grabOffset ];
                frontPoint.z = particles[ startOfEnts + (frontArea*partSize) + 3u + grabOffset ];

                var straightUpDir = normalize( frontPoint - you );



                // Now get the RIGHT area
                    // Get the meta3 again
                frontArea = u32( particles[startOfEnts + (helprind*partSize) + 9u + grabOffset] );
                frontArea = frontArea - 1u;
                frontArea = u32( particles[dbStartInd + frontArea + 4u] );  // this gets the right orienter id thing in the db
                frontArea = frontArea - 1u;

                frontPoint.x = particles[ startOfEnts + (frontArea*partSize) + 1u + grabOffset ];//GETTING THE XYZ OF THE ORIENT PRTICLE (RIGHT) FOR U
                frontPoint.y = particles[ startOfEnts + (frontArea*partSize) + 2u + grabOffset ];
                frontPoint.z = particles[ startOfEnts + (frontArea*partSize) + 3u + grabOffset ];

                var hardRightDir = normalize( you - frontPoint );

 


                //er_forward_engine
                //er_backward_engine
                // Is there a target entity? then move towards it
                if( !ctrlpanelwmainchar && behaviour_type > 0u ){

                    var intsPoint = vec3<f32>( 0,0,0);

                    // Behaviour 1 is pusuring the target id,
                    if( behaviour_type == 1u && er_target_id > 0u ){
                        var interesting_id: u32 = er_target_id - 1u; 
                        intsPoint.x = particles[ startOfEnts + (interesting_id*partSize) + 1u + grabOffset ];//GETTING THE XYZ OF THE ORIENT PRTICLE FOR U
                        intsPoint.y = particles[ startOfEnts + (interesting_id*partSize) + 2u + grabOffset ];
                        intsPoint.z = particles[ startOfEnts + (interesting_id*partSize) + 3u + grabOffset ];

                    }

                    // Behaviour 2 is going to random locations 
                    else if( behaviour_type == 2u ){
                        // Use the info to get the kind of 
                        // Remember "helprind" is still the real id of the teal particle for this 
                        var directionSeed: f32 = EZ_BETTER_RAND(  f32(helprind)*0.1281934f + 0.84f*f32((helprind*33u + step)%4200u)  );
                        directionSeed = EZ_BETTER_RAND( directionSeed*610.27191f );
                        directionSeed = EZ_BETTER_RAND( directionSeed*130.307191f );

                        // var sed: u32 = (helprind*178u+step) % 16000u;
                        // sed = sed / 4000u;
                        // if( sed == 0u ){
                        //     intsPoint.x = 32f;
                        //     intsPoint.y = 2f + 10f;
                        //     intsPoint.z = 32f;
                        // }
                        // else if( sed == 1u ){
                        //     intsPoint.x = bucketsLength;
                        //     intsPoint.y = 2f + 10f;
                        //     intsPoint.z = 0f;
                        // }
                        // else if( sed == 2u ){
                        //     intsPoint.x = 0f;
                        //     intsPoint.y = 2f + 10f;
                        //     intsPoint.z = bucketsLength;
                        // }
                        // else if( sed == 3u ){
                        //     intsPoint.x = bucketsLength;
                        //     intsPoint.y = 2f + 10f;
                        //     intsPoint.z = bucketsLength;
                        // }

                        intsPoint.x = 0 + bucketsLength*EZ_BETTER_RAND( EZ_BETTER_RAND(directionSeed * 30.197598f) );
                        intsPoint.y = 2f + 17f*spacing * EZ_BETTER_RAND( directionSeed * 52.912f );
                        intsPoint.z = 0 + bucketsLength*EZ_BETTER_RAND( EZ_BETTER_RAND(directionSeed * 60.121479f) );


                        // intsPoint.x = 32f;
                        // intsPoint.y = 2f + 10f;
                        // intsPoint.z = 32f;



                    }
                    
                    // Behaviour 3 is going to random locations (on the ground)
                    else if( behaviour_type == 3u ){
                        // Use the info to get the kind of 
                        // Remember "helprind" is still the real id of the teal particle for this 
                        var directionSeed: f32 = EZ_RAND2ER( f32(helprind)*0.4183934f + 84f*f32((helprind*83u + step)%4000u) );
                        intsPoint.x = spawnStartX + spawnSizeX*EZ_RAND2ER( EZ_RAND2ER(directionSeed * 0.97598f) );
                        intsPoint.z = spawnStartY + spawnSizeY*EZ_RAND2ER( EZ_RAND2ER(directionSeed * 0.89321f) );
                        //intsPoint.y = 2f + 20f*spacing * EZ_RAND2ER( directionSeed * 52.912f );
                        intsPoint.y = calculate_nuground(intsPoint.x, intsPoint.z, sftep);

                    }
                    
                    var interestingDir = normalize( intsPoint - me );

                    var interestingPushFrce: f32 = 0f;

                    if(tutu == 6u){ // Forward part
                        //interestingPushFrce *= 1;
                        // vx += straightAheadDir.x * er_forward_engine;     // Intervene and just use the 
                        // vy += straightAheadDir.y * er_forward_engine;
                        // vz += straightAheadDir.z * er_forward_engine;
                        vx += interestingDir.x * er_forward_engine;
                        vy += interestingDir.y * er_forward_engine;
                        vz += interestingDir.z * er_forward_engine;
                    }
                    // apply pull back
                    else if(tutu == 7u){ // Back part
                        vx += interestingDir.x *er_backward_engine;
                        vy += interestingDir.y *er_backward_engine;
                        vz += interestingDir.z *er_backward_engine;
                    }
                    
                    else if(tutu == 10u){ // Left part
                        //interestingPushFrce *= 1;
                        vx += straightAheadDir.x * er_forward_engine;     // Intervene and just use the 
                        vy += straightAheadDir.y * er_forward_engine;
                        vz += straightAheadDir.z * er_forward_engine;
                    }
                    else if(tutu == 11u){ // Right part
                        //interestingPushFrce *= 1;
                        vx += straightAheadDir.x * er_forward_engine;     // Intervene and just use the 
                        vy += straightAheadDir.y * er_forward_engine;
                        vz += straightAheadDir.z * er_forward_engine;
                    }

                    else if(tutu == 12u){ // Cebter part
                        //interestingPushFrce *= 1;
                        vx += straightAheadDir.x * er_forward_engine;     // Intervene and just use the 
                        vy += straightAheadDir.y * er_forward_engine;
                        vz += straightAheadDir.z * er_forward_engine;
                    }
                    else{
                        //interestingPushFrce *= 0f;
                        // ??? ? ? ? ? ? ?
                    }

                }


                var steerForce: f32 = 1f;

                // grab the distance between the two masses
                var dstmm = distance( me, you );
                if( dstmm > 0 && ctrlpanelwmainchar ){  // AND if is the main character 


                    // Truck control scheme
                    if( user_ctrl_scheme == 1u ){
                        // - - -
                        // -- -- -- - 
                        // FORWARD  /  BACK CONTROL
                        // - -- - - --
                        // - - - - 
                        if( tee > 0u ){         // W KEY (NOT 'T')
                            steerForce = 0.033f;

                            if(tutu == 6u){ // Forward part
                                steerForce *= 1;
                            }
                            else if(tutu == 7u){ // Back part
                                steerForce *= 0.21;
                            }
                            
                            else if(tutu == 10u){ // Left part
                                steerForce *= 1;
                            }
                            else if(tutu == 11u){ // Right part
                                steerForce *= 1;
                            }

                            else if(tutu == 12u){ // Cebter part
                                steerForce *= 1;
                            }
                            else{
                                steerForce *= 0f;
                            } 
                            vx += straightAheadDir.x * steerForce;
                            vy += straightAheadDir.y * steerForce;
                            vz += straightAheadDir.z * steerForce;
                        }

                        if(gee > 0u){           // S KEY (NOT 'G')
                            steerForce = 0.02f;
                            if(tutu == 6u){ // Forward part
                                steerForce *= -1;
                            }
                            else if(tutu == 7u){ // Back part
                                steerForce *= -0.21;
                            }
                            
                            else if(tutu == 10u){ // Left part
                                steerForce *= -1;
                            }
                            else if(tutu == 11u){ // Right part
                                steerForce *= -1;
                            }

                            else if(tutu == 12u){ // Cebter part
                                steerForce *= -1;
                            }
                            else{
                                steerForce *= 0f;
                            }

                            vx += straightAheadDir.x * steerForce;
                            vy += straightAheadDir.y * steerForce;
                            vz += straightAheadDir.z * steerForce;
                        }

                        // - - -
                        // -- -- -- - 
                        // LEFT AND RIGHT CONTROL
                        // - -- - - --
                        // - - - - 
                        if(eff > 0u){           // A KEY (NOT 'F')
                            steerForce = 0.034f;
                            if(tutu == 10u){ // Left part
                                steerForce *= 1f;
                            } 
                            else if(tutu == 11u){ // Right part
                                steerForce *= -1f;
                            }
                            else{
                                steerForce *= 0f;
                            }
                            vx += straightAheadDir.x * steerForce;
                            vy += straightAheadDir.y * steerForce;
                            vz += straightAheadDir.z * steerForce;
                        }
                        
                        if(esh > 0u){           // D KEY (NOT 'H')
                            steerForce = 0.034f;
                            if(tutu == 10u){ // Left part
                                steerForce *= -1f;
                            } 
                            else if(tutu == 11u){ // Right part
                                steerForce *= 1f;
                            }
                            else{
                                steerForce *= 0f;
                            }
                            vx += straightAheadDir.x * steerForce;
                            vy += straightAheadDir.y * steerForce;
                            vz += straightAheadDir.z * steerForce;
                        }

                        if( spac > 0u ){

                        }

                        if( shft > 0u ){

                        }
                    }


                    // Floating control scheme      |       floating control scheme + wiggle
                    else if( user_ctrl_scheme == 2u || user_ctrl_scheme == 3u ){
                        // - - - -
                        // -- -- -- - 
                        // FORWARD  /  BACK CONTROL
                        // - -- - - - 
                        // - - - - 
                        if( gee > 0u || tee > 0u ){         // FORWARD ENGINE
                            steerForce = -er_forward_engine;
                            if(tee > 0u){ steerForce *= -1f; }

                            // WIGGLE FACTOR
                            if( user_ctrl_scheme == 3u ){
                                var projectVal = dot( velocityOfFrontOrien, hardRightDir );
                                if(eff > 0u){//left
                                    // if( projectVal > 0f){//idk
                                    //     steerForce *= 1.1f+projectVal*3;
                                    //     steerForce = 0;
                                    // }
                                }
                                if(esh > 0u){//right 
                                    // if( projectVal < 0f){
                                    //     steerForce *= 1.1f + abs(projectVal*3);
                                    //     steerForce = 0;
                                    // }
                                }
                            }

                            if(tutu == 6u){ // Forward part
                                steerForce *= 1;
                            }
                            else if(tutu == 7u){ // Back part
                                steerForce *= 0.21;
                            }

                            else if(tutu == 8u){ // Top part
                                steerForce *= 1*top_bottom_mass_ratio;
                            }
                            else if(tutu == 9u){ // Bottom part
                                steerForce *= 1;
                            }
                            
                            else if(tutu == 10u){ // Left part
                                steerForce *= 1;
                            }
                            else if(tutu == 11u){ // Right part
                                steerForce *= 1;
                            }

                            else if(tutu == 12u){ // Cebter part
                                steerForce *= 1;
                            }
                            else{
                                steerForce *= 0f;
                            } 
                            vx += straightAheadDir.x * steerForce;
                            vy += straightAheadDir.y * steerForce;
                            vz += straightAheadDir.z * steerForce;
                        }

                        if( shft > 0u ){         // W KEY (NOT 'T')
                            steerForce = -rotation_engine + 0f;

                            if(tutu == 6u){ // Forward part
                                steerForce *= 1;
                            }
                            else if(tutu == 7u){ // Back part
                                steerForce *= -1;
                            }
                             
                            else{
                                steerForce *= 0f;
                            } 
                            vx += straightUpDir.x * steerForce;
                            vy += straightUpDir.y * steerForce;
                            vz += straightUpDir.z * steerForce;
                        }

                        if(spac > 0u){           // S KEY (NOT 'G')
                            steerForce = -rotation_engine + 0f;

                            if(tutu == 6u){ // Forward part
                                steerForce *= -1;
                            }
                            else if(tutu == 7u){ // Back part
                                steerForce *= 1;
                            }
                             
                            else{
                                steerForce *= 0f;
                            } 
                            vx += straightUpDir.x * steerForce;
                            vy += straightUpDir.y * steerForce;
                            vz += straightUpDir.z * steerForce;
                        }

                        // - - -
                        // -- -- -- - 
                        // LEFT AND RIGHT CONTROL
                        // - -- - - --
                        // - - - - 
                        if(eff > 0u){           // A KEY (NOT 'F')
                            steerForce = rotation_engine + 0f;//0.01f;
                            var turnDipForce: f32 = -rotation_engine + 0f;//0.01f;
                            if( tutu == 6u ){   // front area
                                vx += hardRightDir.x * -turnDipForce;
                                vy += hardRightDir.y * -turnDipForce;
                                vz += hardRightDir.z * -turnDipForce;
                            }
                            else if( tutu == 7u ){ // back area
                                vx += hardRightDir.x * turnDipForce;
                                vy += hardRightDir.y * turnDipForce;
                                vz += hardRightDir.z * turnDipForce;
                            }
                            else if(tutu == 10u){ // Left part
                                steerForce *= 1f;
                                vx += straightAheadDir.x * steerForce;
                                vy += straightAheadDir.y * steerForce;
                                vz += straightAheadDir.z * steerForce;
                                
                            } 
                            else if(tutu == 11u){ // Right part
                                steerForce *= -1f;
                                vx += straightAheadDir.x * steerForce;
                                vy += straightAheadDir.y * steerForce;
                                vz += straightAheadDir.z * steerForce;
                            }
                        }
                        
                        if(esh > 0u){           // D KEY (NOT 'H')
                            steerForce = rotation_engine + 0f;//0.01f;
                            var turnDipForce: f32 = rotation_engine + 0f;//0.01f;
                            if( tutu == 6u ){ //front area
                                vx += hardRightDir.x * -turnDipForce;
                                vy += hardRightDir.y * -turnDipForce;
                                vz += hardRightDir.z * -turnDipForce;
                            }
                            else if( tutu == 7u ){ // back area
                                vx += hardRightDir.x * turnDipForce;
                                vy += hardRightDir.y * turnDipForce;
                                vz += hardRightDir.z * turnDipForce;
                            }
                            else if(tutu == 10u){ // Left part
                                steerForce *= -1f;
                                vx += straightAheadDir.x * steerForce;
                                vy += straightAheadDir.y * steerForce;
                                vz += straightAheadDir.z * steerForce;
                            } 
                            else if(tutu == 11u){ // Right part
                                steerForce *= 1f;
                                vx += straightAheadDir.x * steerForce;
                                vy += straightAheadDir.y * steerForce;
                                vz += straightAheadDir.z * steerForce;
                            }
                        }
                    }
                        

                    // vx += adeerr.x;
                    // vy += adeerr.y;
                    // vz += adeerr.z;
                }

            }//confirmed a teal ind was recorded 

            //}
            // else{
            //}  <- there was no orienter particle fpound(this should nEV ERHPPEN) otherwise "oritner particle is missing error occurs"




            // Non zero vector double check (doiesnt amttte rpabrly)
            //} 


            vy -= er_grav_pull;

        }

        // Central control panel - check if should update the scratch pad:
        // DONUT DELETE < - For ADDING ANOTHER WRITE SLOT OUTPUT INFO HERE PART 3/2))
        else if( tutu == 13u ){
            // If there's a scratch pad location
            if( metaeight > 0f ){
                var indtolook: u32 = u32( metaeight ) - 1u; // SUbrtract one to deal with the +1'd
                particles[ startOfCpuScratch + indtolook + 0u ] = x;
                particles[ startOfCpuScratch + indtolook + 1u ] = y;
                particles[ startOfCpuScratch + indtolook + 2u ] = z;
                particles[ startOfCpuScratch + indtolook + 3u ] = metaseven;
                particles[ startOfCpuScratch + indtolook + 4u ] = f32( id );

                // Gets the Meta3 so you can get the front orienting
                // var frontArea: u32 = u32( particles[startOfEnts + (helprind*partSize) + 9u + grabOffset] );
                // frontArea = frontArea - 1u;
                var thefrontArea = u32( particles[dbStartInd + (meta3u-1) + 0u] );  // this gets the front orienter id thing in the db
                thefrontArea = thefrontArea - 1u;

                you.x = particles[ startOfEnts + (thefrontArea*partSize) + 1u + grabOffset ];//GETTING THE XYZ OF THE ORIENT PRTICLE (FRONT) FOR U
                you.y = particles[ startOfEnts + (thefrontArea*partSize) + 2u + grabOffset ];
                you.z = particles[ startOfEnts + (thefrontArea*partSize) + 3u + grabOffset ];

                var straightAheadDir = normalize( you - me );

                particles[ startOfCpuScratch + indtolook + 5u ] = straightAheadDir.x;
                particles[ startOfCpuScratch + indtolook + 6u ] = straightAheadDir.y;
                particles[ startOfCpuScratch + indtolook + 7u ] = straightAheadDir.z;
            }
        }

        // Dormant particle
        else if( tutu == 14u ){ 

        }

        // Water particle
        else if( tutu == 15u ){
            
        }

        // uh oh
        // if( mainChar && tee > 0u){
        //     vy += 1.4f;
        // }


        
        //    ____   ____     ___    _   _   _   _   ____  
        //   / ___| |  _ \   / _ \  | | | | | \ | | |  _ \ 
        //  | |  _  | |_) | | | | | | | | | |  \| | | | | |
        //  | |_| | |  _ <  | |_| | | |_| | | |\  | | |_| |
        //   \____| |_| \_\  \___/   \___/  |_| \_| |____/ 
                                                        


        // Just a good idea to have the ground in avariabl ehre
        var thground_here: f32 = calculate_nuground(x, z, sftep);
                    // not a bucket particle
        if (y < thground_here && tutu != 1u && tutu != 3u) {
            y = calculate_nuground(x, z, sftep);

            // // Get the surface normal using sampled points
            // let normal: vec3<f32> = calculate_surface_normal_from_points(x, z, sftep, 0.0001);
            // let nx: f32 = normal.x;
            // let ny: f32 = normal.y;
            // let nz: f32 = normal.z;

            // // Continue with your velocity projection and friction logic
            // let dot_product: f32 = vx * nx + vy * ny + vz * nz;
            // let force_x: f32 = -dot_product * nx;
            // let force_y: f32 = -dot_product * ny;
            // let force_z: f32 = -dot_product * nz;

            // vx += force_x;
            // vy += force_y;
            // vz += force_z;

            // var tangent_x: f32 = vx - dot_product * nx;
            // var tangent_y: f32 = vy - dot_product * ny;
            // var tangent_z: f32 = vz - dot_product * nz;

            // let friction_coefficient: f32 = 0.04;
            // tangent_x *= (1.0 - friction_coefficient);
            // tangent_y *= (1.0 - friction_coefficient);
            // tangent_z *= (1.0 - friction_coefficient);

            // vx = tangent_x + dot_product * nx;
            // vy = tangent_y + dot_product * ny;
            // vz = tangent_z + dot_product * nz;

            // Std boring y set 
            vy += ( thground_here - y ) * 1f;
            vx *= 0.90f;
            vz *= 0.90f;
        }



        // DROMANT particles t14, or water particles t15
        if( is_spec_physics_particle( tutu ) ){
            // Is there a teal particle associated with this?
            var tealent = meta3u - 1u; // tealent is now the real index of the hub particle that has the ROLE which is important to you.

            //vy += 3*sgrav; 
            // Dormant particle
            if( tutu == 14u ){
                if( meta3u > 0u ){  // if there's a hub entity on this
                
                    x = particles[ startOfEnts + (tealent*partSize) + 1u + grabOffset ];
                    y = particles[ startOfEnts + (tealent*partSize) + 2u + grabOffset ];
                    z = particles[ startOfEnts + (tealent*partSize) + 3u + grabOffset ];    // SET THE DORMANT, OWNED PARTICLE TO ITS TEAL LOC.

                    //var hub_ents_role: u32 = u32( particles[ startOfEnts + (tealent*partSize) + 13u + grabOffset ] );//GETTING THE META 7 of the teal particle

                    var m8u: u32 = u32( metaeight );    // this is the reserved section ind
                    if( m8u > 0u ){
                        m8u = m8u - 1u; // now this is the secton of reserved particles
                        var hubEntIndsDbInd: u32 = u32( particles[startOfEnts + (tealent*partSize) + 9u + grabOffset] );
                                // ^ This is now the db ind for this teal particle
                                //  (The hub entity's (teal particle) database index, that stores its meta info, ) (THE t3 of a teal particle is THE DB ind)
                        hubEntIndsDbInd = hubEntIndsDbInd - 1u;
                        var amoundOfReservedSections: u32 = u32( particles[dbStartInd + hubEntIndsDbInd + 8u] );
                            // This is now how many reserved particles there are (SHOULD be over 0 if you're down here)
                            //  BUT just double checking anyways::::
                        if( amoundOfReservedSections > 0 && m8u < amoundOfReservedSections ){// this last conditional is kind of redundant if it 
                            //always gets setup in the correct same way

                            //Grab the particle reservations meta data
                            var partResStartInd: u32 = u32( particles[dbStartInd + hubEntIndsDbInd + 9u + (m8u*resPartSize) + 0u]);
                            var sizeOfPartReservation: u32 = u32( particles[dbStartInd + hubEntIndsDbInd + 9u + (m8u*resPartSize) + 1u]);
                            var destinationParticle: f32 = particles[ dbStartInd + hubEntIndsDbInd + 9u + (m8u*resPartSize) + 2u];

                            // This should get the current type of the particle
                            var primaryParticleType: u32 = u32( particles[startOfEnts + (partResStartInd*partSize) + 0u + grabOffset] );

                            var missileXCoor: f32 = particles[startOfEnts + (partResStartInd*partSize) + 1u + grabOffset];
                            var missileYCoor: f32 = particles[startOfEnts + (partResStartInd*partSize) + 2u + grabOffset];
                            var missileZCoor: f32 = particles[startOfEnts + (partResStartInd*partSize) + 3u + grabOffset];

                            var isMissileArmed: u32 = u32( particles[startOfEnts + (partResStartInd*partSize) + 12u + grabOffset] );
                            var primaryCounter: u32 = u32( particles[startOfEnts + (partResStartInd*partSize) + 13u + grabOffset] ); // the counter of the missile ( if it's armed and goin)

                            // DONUT DELETeE DIS IS WHERE RESERVeD PARTICLes AGET ANIAMTED
                            // NOW THis is the reserved section
                            //-----------------------------
                            // m8u              is the reserved section (0,1,2) (depending on how many differnt reserved particle sections this has)
                            // hub_ents_role    is 
                            //-----------------

                            // ind_main_char
                            
                            // Is the main char
                            if( ind_main_char == tealent ){

                                // EVENT___  forward particle push press
                                if( tee > 0u ){                 // 'T' is being pressed
                                    if( m8u == 0u ){            // Is the first reserved slot section
                                        //Finally 
                                        if( 0u == ((id + step) % sizeOfPartReservation) ){
                                            t = destinationParticle;
                                            metaseven = 0f; // set the counter to 0 i guess
                                            //metaeight = 0f; // dont reset the reserve group index
                                        }
                                    }
                                }

                                // EVENT___  is there a target being highlighted
                                if( targetingid > 0u && targeted_ent_id > 0u ){
                                    if( m8u == 1u ){            // Is the second reserved slot section
                                        t = 18f;                // set to marker deco particle
                                        metaseven = 0f;         // set the counter to 0
                                        //metaeight = 0f;       // NO keep it to this reserved particel group index
                                    }
                                }

                                // EVENT___ missile firing
                                if( targetingid > 0u && targeted_ent_id > 0u ){
                                    if( m8u == 2u && eEvent == 1u ){   // one time event

                                        // If the missile is locekd and loaed
                                        // If the exact missile 
                                        if( id == partResStartInd && u32(destinationParticle) == 19u ){
                                            
                                            t = destinationParticle;   // experimental set the t19 to da thing
                                            metaseven = 0f;

                                            vx = 0f;    // TODO set this to the originator vx,vy,vz
                                            vy = 0f;
                                            vz = 0f;

                                            metafour = f32(targeted_ent_id);//+1'd already

                                            metafive = 0f;// radius of explosion keep it 0 to start

                                            metasix = 1f;// turning on, or 'arming' the missle (this makes it produce smoke now)
                                        }
                                    }
                                }

                                // THIS IS FOR ANY ENTITY THAT HAS the head particle being a 19f (missile)
                                // EVENT___ missile back wash (the reserved particles that arent the head of the missile 
                                //                      but are reserved under the same slot
                                
                                // Primary particle type is the missile 
                                if( m8u == 2u ){//primaryParticleType == 19u ){
                                    if( isMissileArmed == 1u ){ // is the msisiel armed
                                        //if( 0u == ((id + step) % sizeOfPartReservation) ){// we are looking at the smoke particle
                                        if( 0u==((id+primaryCounter+step*21)%(sizeOfPartReservation))  ){
                                            x = missileXCoor;
                                            y = missileYCoor;
                                            z = missileZCoor;

                                            var tte: f32 = EZ_RAND2ER(x*x*0.762 + y*y*33f + z*z*0.9921   );
                                            vx = 0.006f * sin( tte );
                                            tte = EZ_RAND2ER( tte );
                                            vy = 0.006f * cos(tte) * sin( tte );
                                            tte = EZ_RAND2ER( tte );
                                            vz = 0.006f * sin( tte * 13f + tte*tte );

                                            t = metaseven;//destinationParticle; // probably 21
                                            metaseven = 0f; // set the counter to 0 i guess
                                        }
                                        //}

                                    }

                                }


                            }

                            // Not the main char
                            else{

                                // TODO: figure out how to trigger this transofmration

                                // USE THE TEAL DESIRED B value

                                // Continuous push out of particles 
                                // ( this is for the cloud i guess?)
                                // ^^ JUST LCOUD RIGHT NOW
                                if( 0u == ((id + step) % sizeOfPartReservation) ){
                                    t = destinationParticle;
                                    metaseven = 0f; // set the counter to 0 i guess
                                    //metaeight = 0f; // dont reset the reserve group index

                                }
                            }


                            
                            // Conditional particles here

                            if( m8u == 2u ){

                                // Use the first t=19 (the actual missile head)
                                // and if the coutner (m7) is not 0, then use that counter value 
                                // to determine which backwash to use 
                                //var exactbackwash: u32 = 
                                
                            }


                            //destinationParticleu32( particles[destinationParticle] ); 
                            
                        }   // END if statement are there reserved parciles on this teal ind?


                    }
                
 
                }
                else{
                    vy -= sgrav;
                }
            }


            // Water particle    // Gold paritlce waiting
            else if( tutu == 15u || tutu == 16u ){
                metaseven = metaseven + 1f;
                if( metaseven > da_counter_max){
                    metaseven = da_counter_max;
                }
                
                var colliding_with: f32 = 0f;// TODO : it's hard coded to collide w good entities rn rn
                var entsToCountVal: u32 = 0u;
                var entsWhereToStart: u32 = 0u;
                

                // Collide with bad (you are car role)
                if(colliding_with == 1f){//if( entity_role_seven == 1u){//if( collide_with == 0f || collide_with == 2f ){
                    entsToCountVal = entsToCountVal + maxbadents;
                    entsWhereToStart = 0u + maxxedGoodEnts;
                } 
                // Collide with good (you are evil care role)
                else if(colliding_with == 0f){//if( entity_role_seven == 3u){//if( collide_with == 1f || collide_with == 2f ){
                    entsToCountVal = entsToCountVal + maxgoodents;
                    entsWhereToStart = 0u;
                }
                // Collide with good AND bad  EXCEPT urself (??? u are grass i guess idk)
                else if(colliding_with == 2f){ 
                    entsToCountVal = maxbadents + maxgoodents;
                    entsWhereToStart = 0u;
                }

                // DONUTMODIFT<- ThiS IS TWO of THREE instances looping through collisoin balls
                var qq: u32 = 0u;
                loop {
                    if qq >= entsToCountVal { break; } // go through each bad entity 

                    var mqind: u32 = qq + 0u;// modified qq val
                    
                    // In next stage
                    if( colliding_with == 2f && qq >= maxgoodents){
                        mqind = qq - maxgoodents;
                        entsWhereToStart = maxxedGoodEnts;// start checking at the start of the bad ents now
                    } 

                    var indOfBadEntity: u32 = u32(particles[ dbStartInd + entsWhereToStart + mqind ]) - 1u;  // A pure id of particle t=5 of a bad guy with a radius
                    //                                                                          AND only t=5 entities in the db ent list 
                    var locationOfEnt = vec3<f32>( 
                        particles[ startOfEnts + (indOfBadEntity*partSize) + 1u + grabOffset ],
                        particles[ startOfEnts + (indOfBadEntity*partSize) + 2u + grabOffset ],
                        particles[ startOfEnts + (indOfBadEntity*partSize) + 3u + grabOffset ] );

                    var radius: f32 = particles[ startOfEnts + (indOfBadEntity*partSize) + 13u + grabOffset ];   // (THE META 7 for a t=5 is the radius)

                    // var tealofoffendingball: u32 = u32(particles[ startOfEnts + (indOfBadEntity*partSize) + 9u + grabOffset ] );// the meta 3 for this is the teal ind
                    // if( tealofoffendingball > 0u ){
                    //     tealofoffendingball = u32( particles[ startOfEnts + ((tealofoffendingball-1u)*partSize) + 13u + grabOffset ] );//GETTING THE META 7 of the teal particle
                    //     tealofoffendingball = u32(particles[ dbStartInd + rolesStartInd + (tealofoffendingball*rolesSize) + 3u ]);//collide_with... -> (2=both), (1=bad), (0=good)
                    // }

                    var disncet = distance( me, locationOfEnt );

                    if( tutu == 16u ){ // ohhhhhh for gold that's dormant waiting to be actiavedby good
                        radius *= 3.5f;
                    }

                    if( disncet < (radius) ){
                        disncet = disncet - (radius);
                        var pbackdir = normalize( me - locationOfEnt );

                        if( disncet < 0 ){
                            pbackdir *= (std_spring_k_val*12f) * abs(disncet);
                        }
                        else{ 
                            pbackdir *= -(std_spring_k_val*12f) * abs(disncet);
                        }

                        // SFX tap tap TODO commented out fornow becuase not sure how to distinguish between the main char and a random fish
                        //particles[ startOfSFXCpuScratch + (0u*sfxSlotSize) + sfxOffset ] = 1;

                        if( tutu == 16u ){
                            t = 17f;    // resting to gold 
                            vy += 0.08f;
                        }

                        // Spring snap
                        // if( disncet > 2.4*stabledist ){
                        //     thderr *= 0f;
                        //     t = 4f;     // change to dead spring
                        // } 

                        //t = 4;
                        vx += pbackdir.x;
                        vy += pbackdir.y;
                        vz += pbackdir.z;

                        // if(disncet < distToClosest){
                        //     distToClosest = disncet;
                        //     closestCollBlock = indOfBadEntity + 1u; // index 1'd it and set it to the thing
                        // }
                    }

                    qq = qq + 1u;
                }   // End colliding with all GOod entities (player woned i guess)



                

                // COLLIDE WITH GOOD GUYS
                var functionalGround: f32 = max( thground_here, 0 );
                
                if( y < functionalGround ){// hard collide w the absolute ground
                    // LET THE catch all at the end of the thing handle this case

                    //vy = abs(vy)*0.9f;//sgrav;
                    y = functionalGround;
                    //vy = 0;
                }
                else if(y < functionalGround + (bucket_pacing*0.35f)){ // just at stasis i guess
                    //vy -= sgrav*0.1f;
                    vy += 0.0008f + 0.00045f * sin( (x + f32(id) * 22) + sftep*0.001f + (y * 99) + ((f32(id)%55)-27f)*288 );
                    
                    vx *= 0.98f;
                    vy *= 0.98f;
                    vz *= 0.98f;

                }
                else{ // normal goin through air

                    vx *= 0.987f;
                    vy *= 0.987f;
                    vz *= 0.987f;

                    vy -= sgrav;
                }


                x += vx;
                y += vy;
                z += vz;


                // Water expiration ? return to cloud
                if( tutu == 15u ){

                    if( metaseven > 1150f ){    // Max time so convert back to its

                        // There's a hub ent to return to
                        if( meta3u > 0u ){
                            x = particles[ startOfEnts + ((meta3u-1u)*partSize) + 1u + grabOffset ];
                            y = particles[ startOfEnts + ((meta3u-1u)*partSize) + 2u + grabOffset ];
                            z = particles[ startOfEnts + ((meta3u-1u)*partSize) + 3u + grabOffset ];
                            t = 14f;
                            metaseven = 15f;//<- convert back to water
                            //metaeight = 0f;//<-wasnt even used i dont think
                        }
                    }
                }

                 
            }


            // Active gold particle - goes towards the main char
            else if( tutu == 17u ){
                metaseven = metaseven + 1f;
                if( metaseven > da_counter_max){
                    metaseven = da_counter_max;
                }

                you.x = particles[ startOfEnts + (ind_main_char*partSize) + 1u + grabOffset ];//GETTING THE XYZ OF THE ORIENT PRTICLE FOR U
                you.y = particles[ startOfEnts + (ind_main_char*partSize) + 2u + grabOffset ];
                you.z = particles[ startOfEnts + (ind_main_char*partSize) + 3u + grabOffset ];

                var goinTowardsMain = normalize( you - me );

                
                var dismt = distance( me, you );
                dismt*=0.005f;

                vx += goinTowardsMain.x * dismt;
                vy += goinTowardsMain.y * dismt;
                vz += goinTowardsMain.z * dismt;
                
                vx *= 0.987f;
                vy *= 0.987f;
                vz *= 0.987f;

                vy -= sgrav;
                
                x += vx;
                y += vy;
                z += vz;
            }

            // Marker Deco particle
            else if( tutu == 18u ){
                metaseven = metaseven + 1f;
                if( metaseven > da_counter_max){
                    metaseven = da_counter_max;
                }

                if( meta3u > 0u ){  // if there's a hub entity on this

                    //var hub_ents_role: u32 = u32( particles[ startOfEnts + (tealent*partSize) + 13u + grabOffset ] );//GETTING THE META 7 of the teal particle

                    var m8u: u32 = u32( metaeight );    // this is the reserved section ind
                    if( m8u > 0u ){
                        m8u = m8u - 1u; // now this is the secton of reserved particles
                        var hubEntIndsDbInd: u32 = u32( particles[startOfEnts + (tealent*partSize) + 9u + grabOffset] );
                        // ^ This is now the db ind for this teal particle
                                //  (The hub entity's (teal particle) database index, that stores its meta info, ) (THE t3 of a teal particle is THE DB ind)
                        hubEntIndsDbInd = hubEntIndsDbInd - 1u;
                        var amoundOfReservedSections: u32 = u32( particles[dbStartInd + hubEntIndsDbInd + 8u] );
                            // This is now how many reserved particles there are (SHOULD be over 0 if you're down here)
                            //  BUT just double checking anyways::::
                        if( amoundOfReservedSections > 0 && m8u < amoundOfReservedSections ){// this last conditional is kind of redundant if it always gets setup in the same way

                            //Grab the particle reservations meta data
                            //var partResStartInd: u32 =  u32( particles[dbStartInd + hubEntIndsDbInd + 9u + (m8u*resPartSize) + 0u]);
                            var sizeOfPartReservation: u32 =  u32( particles[dbStartInd + hubEntIndsDbInd + 9u + (m8u*resPartSize) + 1u]);
                            var destinationParticle: f32 = particles[ dbStartInd + hubEntIndsDbInd + 9u + (m8u*resPartSize) + 2u];
 
                            
                            // Is the main char
                            if( ind_main_char == tealent ){

                                // EVENT___  is there a target being highlighted
                                // current id you're contorlling,   current id you're targeting
                                if( targetingid > 0u && targeted_ent_id > 0u ){
                                    // if( m8u == 0u ){} the first reserved particle slot
                                    if( m8u == 1u ){            // Is the second reserved slot section

                                        x = particles[ startOfEnts + ((targeted_ent_id-1u)*partSize) + 1u + grabOffset ];
                                        y = particles[ startOfEnts + ((targeted_ent_id-1u)*partSize) + 2u + grabOffset ];
                                        z = particles[ startOfEnts + ((targeted_ent_id-1u)*partSize) + 3u + grabOffset ];

                                        var spherepoint = (id % sizeOfPartReservation);
                                        var spoint = sphere_point( spherepoint, sizeOfPartReservation, sftep );

                                        x += spoint.x * (2.1f + (sin(sftep*0.08f)*0.12f) );
                                        y += spoint.y * (2.1f + (sin(sftep*0.08f)*0.12f) );
                                        z += spoint.z * (2.1f + (sin(sftep*0.08f)*0.12f) );

                                        // Green or red color tint on the targeting marker
                                        var rollee: u32 = u32( particles[ startOfEnts + ((targeted_ent_id-1u)*partSize) + 13u + grabOffset ] );

                                        var collide_withh: u32 = u32( particles[ dbStartInd + rolesStartInd + (rollee*rolesSize) + 3u ] ); 
                                            // Val3 of the role is the 'collide_with' variable , 0 = collide with goods, 1 = collide iwth bads, 2 = collide with both
                                        // The meta7 of the targeted ind should always be a t13 so this is the DB ind
                                        // Get the collide profile of the t13

                                        // DONnUT MODIFY THIS < - LINE CHANGe HOW THe TARGETER RETICLE REACTS WITH TARGES

                                        if( collide_withh == 0u ){ // collides with good ents
                                            metafour = 250f;
                                            metafive = 0f;
                                            metasix = 0f;
                                        }
                                        else if( collide_withh == 1u ){ // collides with bad ents
                                            metafour = 0f;
                                            metafive = 250f;
                                            metasix = 0f;
                                        }
                                        else if( collide_withh == 2u ){ // collides with both
                                            metafour = 120f;
                                            metafive = 150f;
                                            metasix = 60f;
                                        }
                                        else{ // should never be this
                                            metafour = 255f;
                                            metafive = 255f;
                                            metasix = 255f;
                                        }
                                        
                                    }
                                }
                                // Reset the t's back
                                else{
                                    t = 14f;
                                    metaseven = 18f;    // return the thing to its destination as it becomes the stem partricle again (the dormant particle)
                                    //metaeight = 0f; <- dont modify the reserve particle group id 

                                }

                            } 

                            

                            // Conditional particles here


                            //destinationParticleu32( particles[destinationParticle] ); 

                        }


                    }

                }

            }   //  End of t== 18

            // This is missile territory
            else if( tutu == 19u ){
                
                // Just add a max cap to make sure the f32 number dun get too big
                // which COULD happen
                metaseven = metaseven + 1f;
                if( metaseven > da_counter_max){
                    metaseven = da_counter_max;
                }

                var activateMissile: bool = false;  // if detonati
                var collidedWTarg: bool = false;// if the missile hit the target
                var resetMissile: bool = false; // ifr eturn to dormant

                // CHECK COLLISION SPHERES AROUND FOR MISSILE ACTIVATION

                // get the teal entity
                var tealind: u32 = meta3u;
                var closestCollBlock: u32 = 0u;// (0 obivously means undecided)     // USED FOR THE meta 7
                var distToClosest: f32 = 99999f;
                // Check if a valid teal block herer (which there always... should be?)
                if( tealind > 0u){  //
                    tealind = tealind - 1u;
                    var entity_role_seven: u32 = u32( particles[ startOfEnts + (tealind*partSize) + 13u + grabOffset ] );//GETTING THE META 7 of the teal particle
                    //                                                                                      (WHICH IS THE ENTITY_ROLE)
                    var collide_with = particles[ dbStartInd + rolesStartInd + (entity_role_seven*rolesSize) + 3u ];//collide_with... -> (2=both), (1=bad), (0=good)
                    var maxEntsToCheck: u32 = 0u;
                    var entsCheckingStart: u32 = 0u;
                    
                    // Collide with bad (you are car role)
                    if(collide_with == 1f){//if( entity_role_seven == 1u){//if( collide_with == 0f || collide_with == 2f ){
                        maxEntsToCheck = maxEntsToCheck + maxbadents;
                        entsCheckingStart = 0u + maxxedGoodEnts;
                    }

                    // Collide with good (you are evil care role)
                    else if(collide_with == 0f){//if( entity_role_seven == 3u){//if( collide_with == 1f || collide_with == 2f ){
                        maxEntsToCheck = maxEntsToCheck + maxgoodents;
                        entsCheckingStart = 0u;
                    }
                    // Collide with good AND bad  EXCEPT urself (??? u are something that collides w everything)
                    else if(collide_with == 2f){ 
                        maxEntsToCheck = maxbadents + maxgoodents;
                        entsCheckingStart = 0u;
                    }

                    // DONUTMODIFT<- ThiS IS THREE of THREE instances looping through collisoin balls
                    // NOW LOOP THROUGH the entity to see if u gotta activate it for an explosion
                    var ee: u32 = 0u;
                    loop {
                        if ee >= maxEntsToCheck { break; } // go through each bad entity
                        
                        var veri: u32 = ee + 0u; //modified ee ind for covering all 
                        
                        // In next stage
                        if( collide_with == 2f && ee >= maxgoodents){
                            veri = ee - maxgoodents;
                            entsCheckingStart = maxxedGoodEnts;// start checking at the start of the bad ents now
                        } 

                        var indOfBadEntity: u32 = u32(particles[ dbStartInd + entsCheckingStart + veri ]) - 1u;  // A pure id of particle t=5 of a bad guy with a radius
                        //                                                                          AND only t=5 entities in the db ent list 
                        var locationOfEnt = vec3<f32>( 
                            particles[ startOfEnts + (indOfBadEntity*partSize) + 1u + grabOffset ],
                            particles[ startOfEnts + (indOfBadEntity*partSize) + 2u + grabOffset ],
                            particles[ startOfEnts + (indOfBadEntity*partSize) + 3u + grabOffset ] );

                        var radis: f32 = particles[ startOfEnts + (indOfBadEntity*partSize) + 13u + grabOffset ];   // (THE META 7 for a t=5 is the radius)
                        var tealIndOf: u32 = u32( particles[ startOfEnts + (indOfBadEntity*partSize) + 9u + grabOffset ] );  // THE meta 3 teal value
                    
                        var dist = distance( me, locationOfEnt );

                        if( dist < (radis) && tealIndOf != meta3u ){ // always reject own 
                            // Instead of setting the meta8 for the closest coll block ind,
                            // activate the missile :)
                            collidedWTarg = true;
                        }

                        ee = ee + 1u;
                    } 

                }

                // Red = metafour, green=.... blue=....
                // metaforu for t19 is id of target, metafive is the explosinm readus
                if( metafour > 0f ){
                    // this was the coordinates of the target for the missile set when it was still a t=14
                    var heatseekingtowards: u32 = u32(metafour) - 1u;
                    
                    var destx: f32 = particles[ startOfEnts + ((heatseekingtowards)*partSize) + 1u + grabOffset ];
                    var desty: f32 = particles[ startOfEnts + ((heatseekingtowards)*partSize) + 2u + grabOffset ];
                    var destz: f32 = particles[ startOfEnts + ((heatseekingtowards)*partSize) + 3u + grabOffset ];

                    // HOme in to the target
                    vx += (destx - x ) / 2000f;
                    vy += (desty - y ) / 2000f;
                    vz += (destz - z ) / 2000f;
                    
                    x += vx;
                    y += vy;
                    z += vz;
                }

                
                if( metafive == 0f && collidedWTarg ){
                    activateMissile = true;
                }
                else if( metaseven > 700){// and expl radius is 0
                    resetMissile = true;
                }

                if( activateMissile ){
                    // SFX missile detonation
                    particles[ startOfSFXCpuScratch + (1u*sfxSlotSize) + sfxOffset ] = 1;
                    metafive = 2.5f; // Explosion radius

                    vx = 0f;
                    vy = 0f;
                    vz = 0f;    // stop the missile dead in its tracks initial expl
                }

                if( metafive > 0f ){

                    metafive *= 0.9f; // diminish explos radius

                    if( metafive < 0.06f ){
                        resetMissile = true;
                    }
                }

                if( resetMissile ){
                    t = 14f;
                    metaseven = 19f;    // return the thing to its destined particle

                    metafour = 0f;// check if setting ind to 0 is deactiaved
                    metafive = 0f;// readius to 0 too
                    metasix = 0f;// disarm the missile (1 is on, 0 is off)
                }
                
            }   // END of t=19 missile


            // Air drifter paarticle
            else if( tutu == 21u ){

                metaseven = metaseven + 1f;
                if( metaseven > da_counter_max){
                    metaseven = da_counter_max;
                }


                vx *= 0.994f;
                vy *= 0.994f;
                vz *= 0.994f;

                vy += sgrav*0.5f;
                
                x += vx;
                y += vy;
                z += vz;

                if( metaseven > 200){// reset to 14 i guess?
                    t = 14f;
                    metaseven = 21f;    // Return back to its dormant i gues
                }



            }


        }// END OF IF IS SPEC PHYSICS 



        // Normal particle conected to larger entity
        else{
            vx *= 0.985f;
            vy *= 0.985f;
            vz *= 0.985f;

            x += vx;
            y += vy;
            z += vz;

            if( y < thground_here ){
                y = thground_here;
                vy = 0;
            }


        }





        // No matter what, repel the bottom-most ground
        if( y < 0 ){
            y = 0;
            vy = 0;
        }
        
        // Extra repel
        // if( y < thground_here ){
        //     y = thground_here + 0.002f;
        //     vy = abs(vy);
        // }


    }   // End the pause

   
    particles[particleIndex + 0 + writeOffset] = t;
    
    particles[particleIndex + 1 + writeOffset] = x;
    particles[particleIndex + 2 + writeOffset] = y;
    particles[particleIndex + 3 + writeOffset] = z; 

    particles[particleIndex + 4 + writeOffset] = vx;
    particles[particleIndex + 5 + writeOffset] = vy;
    particles[particleIndex + 6 + writeOffset] = vz;

    particles[particleIndex + 7 + writeOffset] = metaone;
    particles[particleIndex + 8 + writeOffset] = metatwo;
    particles[particleIndex + 9 + writeOffset] = metathree;
    particles[particleIndex + 10 + writeOffset] = metafour;
    particles[particleIndex + 11 + writeOffset] = metafive;
    particles[particleIndex + 12 + writeOffset] = metasix;
    particles[particleIndex + 13 + writeOffset] = metaseven;
    particles[particleIndex + 14 + writeOffset] = metaeight;


    // Springs remained unchained for now

}
    `;

    const computeModule = device.createShaderModule({ code: computeShader });
    computePipeline = device.createComputePipeline({
        layout: 'auto',
        compute: {
            module: computeModule,
            entryPoint: 'main',
        },
    });

    computeBindGroup = device.createBindGroup({
        layout: computePipeline.getBindGroupLayout(0),
        entries: [
            { binding: 0, resource: { buffer: particleBuffer } },
            { binding: 1, resource: { buffer: userInputBuffer } },
            {
              binding: 2,
              resource: { buffer: planeStorageBuffer },
            },
        ],
    });
}

// --------------------
//   RENDER PIPELINES
// --------------------
var particlePipeline, planePipeline;
var renderBindGroupParticles, renderBindGroupVP, planeBindGroup;
var vpBuffer; // uniform buffer

async function createRenderPipelines(device) {
    const wgslCode = `
        





struct CameraData {
    vp : mat4x4<f32>,
    right : vec3<f32>,
    pad1 : f32,
    up : vec3<f32>,
    pad2 : f32,
    forward : vec3<f32>,
    pad3 : f32,
    cameraPos : vec3<f32>,
    pad4 : f32,
    fogColor : vec4<f32>,
    fogNear : f32,
    fogFar : f32,
    pad5 : vec2<f32>,
};


@group(0) @binding(0) var<storage,read> particles: array<f32>;
@group(1) @binding(0) var<uniform> cameraData: CameraData;
@group(1) @binding(1) var<storage,read> userInput: array<u32>;

// For plane's texture
@group(2) @binding(0) var planeTexture: texture_2d<f32>;
@group(2) @binding(1) var planeSampler: sampler;

// ------------------
//   PARTICLES
// ------------------
struct ParticleVSOut {
    @builtin(position) position : vec4<f32>,
    @location(0) color : vec4<f32>,
    @location(1) localPos : vec2<f32>,
    @location(2) worldPos : vec3<f32>,
}; 



// ------------------------------
//  SHADOW 
// ------------------------------  

// Function to calculate the nuground value
fn calculate_lightspots_area(x: f32, z: f32, sftep: f32) -> f32 {
    let base_freq: f32 = 0.171;
    let freq_x: f32 = 0.22;
    var timefrewe: f32 = 0.076f;
    let freq_z: f32 = 0.032;

    let amp1: f32 = 0.45;
    let amp2: f32 = 0.75;
    let amp3: f32 = 0.3;
    let amp4: f32 = 0.6;
    let amp5: f32 = 0.9;
    let amp6: f32 = 0.4;
    let amp7: f32 = 0.7;
    let amp8: f32 = 0.5;
    let amp9: f32 = 0.35;
    let amp10: f32 = 0.65;
    let amp11: f32 = 0.55;
    let amp12: f32 = 0.25;
    let amp13: f32 = 0.8;
    let amp14: f32 = 0.3;
    let amp15: f32 = 0.4;
    let amp16: f32 = 0.2;
    let amp17: f32 = 0.6;
    let amp18: f32 = 0.5;

    return amp1 * sin(x * base_freq * freq_x + sftep * 0.008 * timefrewe) +
           amp2 * cos(z * base_freq * freq_z + sftep * 0.0014 * timefrewe) +
           amp3 * sin((x + z) * base_freq * 0.5 + sftep * 0.031 * timefrewe) +
           amp4 * cos(x * z * base_freq * freq_x + sftep * 0.035 * timefrewe) +
           amp5 * sin((x - z) * base_freq * 1.5 + sftep * 0.08 * timefrewe) +
           amp6 * cos((x * x + z * z) * base_freq * 0.01 + sftep * 0.09 * timefrewe) +
           amp7 * sin((x + z * 0.5) * base_freq * 0.02 + sftep * 0.015 * timefrewe) +
           amp8 * cos((z - x * 0.3) * base_freq * 0.07 + sftep * 0.013 * timefrewe) +
           amp9 * sin(x * z * base_freq * 1.2 + sftep * 0.025 * timefrewe) +
           amp10 * cos((x + z * z) * base_freq * freq_z + sftep * 0.021 * timefrewe) +
           amp11 * sin((z + x * x) * base_freq * 0.09 + sftep * 0.02 * timefrewe) +
           amp12 * cos((x - z * z) * base_freq * 0.11 + sftep * 0.05 * timefrewe) +
           amp13 * sin((x * z + z * z) * base_freq * 0.06 + sftep * 0.014 * timefrewe) +
           amp14 * cos((x * z - z * x) * base_freq * 0.03 + sftep * 0.017 * timefrewe) +
           amp15 * sin((x * x - z * z) * base_freq * 0.04 + sftep * 0.022 * timefrewe) +
           amp16 * cos((x * x + z) * base_freq * 0.08 + sftep * 0.018 * timefrewe) +
           amp17 * sin((z * z + x * x) * base_freq * 0.05 + sftep * 0.016 * timefrewe) +
           amp18 * cos((z - x) * base_freq * freq_x + sftep * 0.019 * timefrewe) + 
           0.0; // Final bias
}

// Function to calculate the scrambled nuground value with three parameters
fn calculate_scrambled_value(a: f32, b: f32, c: f32, time: f32) -> f32 {
    let base_offset: f32 = 0.03;
    let shift_a: f32 = 0.1;
    let shift_b: f32 = 0.015;
    let shift_c: f32 = 0.05;
    var time_variance: f32 = 0.041f;

    let scale1: f32 = 0.5;
    let scale2: f32 = 0.85;
    let scale3: f32 = 0.4;
    let scale4: f32 = 0.75;
    let scale5: f32 = 0.95;
    let scale6: f32 = 0.3;
    let scale7: f32 = 0.65;
    let scale8: f32 = 0.45;
    let scale9: f32 = 0.5;
    let scale10: f32 = 0.7;
    let scale11: f32 = 0.6;
    let scale12: f32 = 0.35;
    let scale13: f32 = 0.9;
    let scale14: f32 = 0.25;
    let scale15: f32 = 0.55;
    let scale16: f32 = 0.2;
    let scale17: f32 = 0.7;
    let scale18: f32 = 0.6;
    let scale19: f32 = 0.4;
    let scale20: f32 = 0.5;

    return scale1 * cos(a * base_offset * shift_a + time * 0.01 * time_variance) +
           scale2 * sin(b * base_offset * shift_b + time * 0.005 * time_variance) +
           scale3 * cos((c + a) * base_offset * 0.3 + time * 0.02 * time_variance) +
           scale4 * sin(a * b * c * base_offset * shift_a + time * 0.025 * time_variance) +
           scale5 * cos((a - c) * base_offset * 1.2 + time * 0.03 * time_variance) +
           scale6 * sin((b * b + c * c) * base_offset * 0.015 + time * 0.04 * time_variance) +
           scale7 * cos((a + c * 0.7) * base_offset * 0.08 + time * 0.009 * time_variance) +
           scale8 * sin((b - c * 0.5) * base_offset * 0.05 + time * 0.011 * time_variance) +
           scale9 * cos(c * b * base_offset * 1.1 + time * 0.018 * time_variance) +
           scale10 * sin((a + b * c) * base_offset * shift_c + time * 0.012 * time_variance) +
           scale11 * cos((c + a * b) * base_offset * 0.07 + time * 0.014 * time_variance) +
           scale12 * sin((b - c * a) * base_offset * 0.13 + time * 0.016 * time_variance) +
           scale13 * cos((a * c + c * b) * base_offset * 0.04 + time * 0.01 * time_variance) +
           scale14 * sin((c * b - b * a) * base_offset * 0.06 + time * 0.0095 * time_variance) +
           scale15 * cos((c * c - a * b) * base_offset * 0.08 + time * 0.013 * time_variance) +
           scale16 * sin((b * a + c) * base_offset * 0.1 + time * 0.012 * time_variance) +
           scale17 * cos((c * c + a * b) * base_offset * 0.045 + time * 0.015 * time_variance) +
           scale18 * sin((b - c) * base_offset * shift_b + time * 0.017 * time_variance) +
           scale19 * cos((a * c + b) * base_offset * 0.02 + time * 0.03 * time_variance) +
           scale20 * sin((c - b * a) * base_offset * 0.09 + time * 0.018 * time_variance) +
           0.0; // Final bias
}



// Shadow manp seeing
fn shading_map(x: f32, y: f32, z: f32, sftep: f32) -> f32 {
    let base_freq: f32 = 0.0016;

    let freq_x: f32 = 2.8;
    let freq_z: f32 = 2.56;
    let freq_y: f32 = 2.46;

    var amp1 = 3.5f;

    return 0.7 * amp1 * sin(772+x * freq_x + sftep * base_freq *  0.19) *
           0.38 * amp1 * cos(177+z * freq_z + sftep * base_freq * 0.11) *
           0.98 * amp1 * sin(737+z * freq_x + sftep * base_freq * 0.08) *
           0.28 * amp1 * cos(477+x * freq_x + sftep * base_freq * 0.34) *
           0.48 * amp1 * sin(771+y * freq_y + sftep * base_freq * 0.23) *
           0.88 * amp1 * cos(727+y * freq_y + sftep * base_freq * 0.289) *
           0.93 * amp1 * cos(747+x * freq_x + sftep * base_freq * 0.44);
   
}




fn is_springful_entity( ett: u32 ) -> bool {
    return ${FINAL_POINT_DATA.allowedTeesInSprings};// ||
}


// ------------------------------
//  PARTICLE VERTEX + FRAGMENT
// ------------------------------


// Each instance = 1 particle
// We draw 6 vertices per instance => 2 triangles forming a quad
@vertex
fn vs_main(
    @builtin(vertex_index) vertexIndex: u32,
    @builtin(instance_index) instanceIndex: u32
) -> ParticleVSOut {
    
    var ind_main_char: u32 = ${FINAL_POINT_DATA.KEY_PROTAGONIST}u;
    var mainChar: bool = ind_main_char == instanceIndex; 

    var i = instanceIndex * ${FINAL_POINT_DATA.oneParticleSize}u;
    i += ${FINAL_POINT_DATA.START_PARTICLES}u;

    var step: u32 = userInput[6];
    var sftep: f32 = f32(step);


    var dbStartInd: u32 =  ${FINAL_POINT_DATA.START_DB}u;

    var ofstr: u32 = 0;//6u * ((userInput[6]+1u) % 2u); 

    var pingpong: bool = ( step % 2 ) == 0u;
    var grabOffset: u32 = 0u;
    var writeOffset: u32 = ${FINAL_POINT_DATA.PARTICLE_ATTRIBUTES}u;
    if(!pingpong){
        grabOffset = ${FINAL_POINT_DATA.PARTICLE_ATTRIBUTES}u;
        writeOffset = 0u;
    }
    ofstr = grabOffset;

    
    let t = u32(particles[i + 0 + ofstr]);
    
    var x = particles[i + 1 + ofstr];
    var y = particles[i + 2 + ofstr];
    var z = particles[i + 3 + ofstr];
    let met3 = particles[i + 9 + ofstr];  
    let met4 = particles[i + 10 + ofstr];
    let met5 = particles[i + 11 + ofstr];
    let met6 = particles[i + 12 + ofstr];
    let met7 = particles[i + 13 + ofstr];
    let met8 = particles[i + 14 + ofstr];

    // var maincharx: f32 = particles[ startOfEnts + (ind_main_char*partSize) + 1u + grabOffset ];//GETTING THE XYZ OF THE ORIENT PRTICLE FOR U
    // var mainchary: f32 = particles[ startOfEnts + (ind_main_char*partSize) + 2u + grabOffset ];
    // var maincharz: f32 = particles[ startOfEnts + (ind_main_char*partSize) + 3u + grabOffset ];



    var bucket_pacing: f32 = ${FINAL_POINT_DATA.BUCKET_SPACING}f;

    //show nothing
    var oritnerdebugere: u32 = 0;
 
    

    // Let's define a small array of the 6 corners for the quad in local 2D space:
    // This forms two triangles:
    var corners = array<vec2<f32>, 6>(
        vec2<f32>(-0.1, -0.1),
        vec2<f32>( 0.1, -0.1),
        vec2<f32>(-0.1,  0.1),
        vec2<f32>(-0.1,  0.1),
        vec2<f32>( 0.1, -0.1),
        vec2<f32>( 0.1,  0.1),
    );

    // SIZE DIFFERENCES
    var scaler: f32 = 1f;
    if( t == 0u ){
        scaler = 0.2f;
    }
    else if( t == 1u ){
        scaler = 0.35;
    }

    // Std thing from voxel engine
    else if( t == 2u ){
        scaler = 0.5;
    }

    // A Ground particle
    else if( t == 3u ){
        scaler = 0.46;
    }
    else{
        scaler = 0.46;
    }


    if( t == 5u && oritnerdebugere == 2u ){

    }



    // Deco particle, make it smaller
    if( t == 18u ){
        scaler = 0.83;
    }

    // Dust particle
    else if( t == 21u ){
        scaler += met7*0.008f;
    }
 
    var corner = corners[vertexIndex] * scaler;
    // if( userInput[6] > 300 ){
    //     corner = corner * 4;
    // }

    let worldPos = vec3<f32>(x, y, z)
        + cameraData.right * corner.x
        + cameraData.up    * corner.y;

    var out : ParticleVSOut;
    out.position = cameraData.vp * vec4<f32>(worldPos, 1.0);
    out.worldPos = worldPos;
    out.localPos = corners[vertexIndex];

    // For coloring: map radius from [3..5+] into some gradient
    var c3 = (x) / 1.1;
    var c1 = (y) / 1.2;
    var c2 = (z) / 1.3;

    if( t == 0u ){
        out.color = vec4<f32>(0.0, 1.0, 0.0, 0.0);
    }

    // Collision Bucket
    else if( t == 1u ){ 
        out.color = vec4<f32>(met4/255f, met5/255f, met6/255f, 1.0);
        //out.color = vec4<f32>(1.0, 0.0, 1.0, 0.0);
    }

    // STD voxel model
    else if( t == 2u ){
        out.color = vec4<f32>(met4/255f, met5/255f, met6/255f, 1.0);
    }
    
    // Ground area
    else if( t == 3u ){
        out.color = vec4<f32>(0.1, 1.0, 0.1, 0.0);
        // out.color = vec4<f32>(
        //     cos(x*(0.04 + sin(z*0.07)))*0.35 + 0.4,
        //     sin(y*6)*0.6 + 0.4,
        //     sin(x*(0.03 + sin(z*0.03)))*0.4 + 0.42,
        //     1.0 );
    }
    // Dead guy yellow 
    else if( t == 4u ){
        //out.color = vec4<f32>(0.7, 0.8, 0.05, 0.0);
        out.color = vec4<f32>(met4/255f, met5/255f, floor(met6%1000f)/255f, 1.0);
        //out.color = vec4<f32>(0.23f + 0.01f*(sftep%78f), 0.3f + 0.01f*(sftep%48f), 0.25f + 0.02f*(sftep%30f), 1.0f);
    }

    // Collision indicator
    else if( t == 5u && oritnerdebugere == 1u ){
        out.color = vec4<f32>(0.96-sin(c2*0.4)*0.03, 0.471-cos(c1*1.63)*0.07, 0.471-sin(c3*0.85)*0.06, 1.0);
    } 
    // LArge indicator
    else if( t == 5u && oritnerdebugere == 1u ){
        out.color = vec4<f32>(0.96-sin(c2*0.4)*0.03, 0.471-cos(c1*1.63)*0.07, 0.471-sin(c3*0.85)*0.06, 1.0);
    }
    // Front
    else if( t == 6u && oritnerdebugere == 1u){ 
        out.color = vec4<f32>(0.09-sin(c2*0.4)*0.05, 0.96-cos(c1*1.63)*0.03, 0.09-sin(c3*0.85)*0.03, 1.0);
    }
    // Back
    else if( t == 7u && oritnerdebugere == 1u){ 
        out.color = vec4<f32>(0.96-cos(c1*1.63)*0.03, 0.09-sin(c2*0.4)*0.05, 0.09-sin(c3*0.85)*0.03, 1.0);
    }
    // Top
    else if( t == 8u && oritnerdebugere == 1u){ 
        out.color = vec4<f32>( 0.09-sin(c2*0.4)*0.05, 0.09-sin(c3*0.85)*0.03,0.96-cos(c1*1.63)*0.03, 1.0);
    }
    // Bottom
    else if( t == 9u && oritnerdebugere == 1u){ 
        out.color = vec4<f32>( 0.96-cos(c1*1.63)*0.03, 0.96-sin(c3*1.63)*0.03, 0.09-sin(c2*0.85)*0.03, 1.0);
    }
    // Left
    else if( t == 10u && oritnerdebugere == 1u){ 
        out.color = vec4<f32>( 0.96-cos(c1*1.63)*0.03, 0.5-sin(c3*1.63)*0.03, 0.09-sin(c2*0.85)*0.03, 1.0);
    }
    // Right
    else if( t == 11u && oritnerdebugere == 1u){ 
        out.color = vec4<f32>( 0.96-cos(c1*1.63)*0.03,  0.09-sin(c2*0.85)*0.03, 0.96-sin(c3*1.63)*0.03, 1.0);
    }


    // Middle
    else if( t == 12u){
        out.color = vec4<f32>(0f, 0.8f, 0.8f, 1.0);
    }
    // Exact nucleus
    else if( t == 13u){
        out.color = vec4<f32>(0f, 1f, 1f, 1.0);
    }
    // I think normal water? or aprticle
    else if( t == 14u){
        out.color = vec4<f32>(met4/255f, met5/255f, met6/255f, 1.0);
    }
    
    // INACTIVE (  G O L D  )  ( rewards )
    else if( t == 16u ) {
        // Colors: normalized to range [0, 1]
        let color1 = vec3<f32>(255.0 / 255.0, 224.0 / 255.0, 0.0 / 255.0);
        let color2 = vec3<f32>(212.0 / 255.0, 175.0 / 255.0, 55.0 / 255.0);
        let color3 = vec3<f32>(187.0 / 255.0, 165.0 / 255.0, 61.0 / 255.0);
        let colorWhite = vec3<f32>(1.0, 1.0, 1.0);

        // Calculate oscillation offset based on particle's position (x, z)
        let positionOffset = (sin(x * 0.05 + sftep * 0.01) + cos(z * 0.03 + sftep * 0.01)) * 0.5;

        // Adjust the interpolation factor
        let normalizedStep = fract(sftep * 0.01 + positionOffset); // Value between 0 and 1

        // Determine the color by interpolating smoothly across all colors (wrapping)
        var interpolatedColor: vec3<f32>;
        if (normalizedStep < 0.25) {
            // Interpolate between color1 and color2
            let localFactor = normalizedStep / 0.25;
            interpolatedColor = color1 * (1.0 - localFactor) + color2 * localFactor;
        } else if (normalizedStep < 0.5) {
            // Interpolate between color2 and color3
            let localFactor = (normalizedStep - 0.25) / 0.25;
            interpolatedColor = color2 * (1.0 - localFactor) + color3 * localFactor;
        } else if (normalizedStep < 0.75) {
            // Interpolate between color3 and white
            let localFactor = (normalizedStep - 0.5) / 0.25;
            interpolatedColor = color3 * (1.0 - localFactor) + colorWhite * localFactor;
        } else {
            // Interpolate between white and color1 (wrap around smoothly)
            let localFactor = (normalizedStep - 0.75) / 0.25;
            interpolatedColor = colorWhite * (1.0 - localFactor) + color1 * localFactor;
        }

        // Set the output color
        out.color = vec4<f32>(interpolatedColor, 1.0);
    }





    // A C T I V E (  GOLD  )
    else if( t == 17u ) {
        // Colors: normalized to range [0, 1]
        let goldColor = vec3<f32>(212.0 / 255.0, 175.0 / 255.0, 55.0 / 255.0); // A single gold color
        let colorWhite = vec3<f32>(1.0, 1.0, 1.0);

        // Calculate oscillation offset based on particle's position (x, y, z)
        let positionOffset = (sin(x * 0.05 + sftep * 0.01) + cos(y * 0.03 + sftep * 0.01) + sin(z * 0.07 + sftep * 0.01)) * 0.333;

        // Adjust the interpolation factor for flashing effect
        let normalizedStep = fract(sftep * 0.03 + positionOffset); // Value between 0 and 1

        // Interpolate between goldColor and white to create the flashing effect
        var interpolatedColor: vec3<f32>;
        if (normalizedStep < 0.5) {
            // Transition to white (brighter flash)
            interpolatedColor = goldColor * (1.0 - normalizedStep * 2.0) + colorWhite * (normalizedStep * 2.0);
        }
        else {
            // Transition back to goldColor (fade out flash)
            let localFactor = (normalizedStep - 0.5) * 2.0;
            interpolatedColor = colorWhite * (1.0 - localFactor) + goldColor * localFactor;
        }
        // Set the output color
        out.color = vec4<f32>(interpolatedColor, 1.0);
    }

    // Marker Decoration particle
    else if( t == 18u ) {
        var flsahremodifer: f32 = cos(y * 0.03 + sftep * 0.3)*0.7;
        //calculate_lightspots_area
        out.color = vec4<f32>(met4/255f + flsahremodifer, met5/255f + flsahremodifer, met6/255f + flsahremodifer, 1.0);
    }

    //Weapon - Explosion
    else if( t == 19u ) {
        var blacnknthwiter: f32 = sin(y * 0.03 + sftep * 0.3)*0.4;
        out.color = vec4<f32>(1f+blacnknthwiter, 1f+blacnknthwiter, 1f+blacnknthwiter, 1.0);
    }

    // Weapon Lazer
    else if( t == 20u ) {
        //calculate_lightspots_area
        out.color = vec4<f32>(1f, 1f, 0f, 1.0);
    }

    // Air Drifter particle
    else if( t == 21u ) {
        var blacnknthwiter: f32 = sin(x * 0.025 + sftep * 0.072)*0.23;
        out.color = vec4<f32>(0.6f+blacnknthwiter, 0.6f+blacnknthwiter, 0.6f+blacnknthwiter, 1.0);
    }

    else{
        out.color = vec4<f32>( met4/255f, met5/255f, met6/255f, 1.0 );
    }

    // var shouldbeshine:

    // Apply shadowing and cloud

    var shaderem: f32 = shading_map( x, y, z, sftep );
    var shaderborer: f32 = 22f*bucket_pacing;
    if( shaderem > -shaderborer && shaderem < shaderborer ){
        shaderem /= 22f*bucket_pacing;
        if(shaderem<0){shaderem = abs(shaderem);shaderem *= shaderem;}
        //else{shaderem *= shaderem;shaderem*=-1f;}
        
        out.color.x += (0f - out.color.x)*0.33f*(1f-shaderem);
        out.color.y += (0f - out.color.y)*0.33f*(1f-shaderem);
        out.color.z += (0f - out.color.z)*0.33f*(1f-shaderem);
    }

    // Directinal lighting
    if( is_springful_entity( t ) && t != 13u ){
        var direlight = vec3<f32>(10f, 23f, 10f);

    }

    // shaderem = calculate_lightspots_area( x, z, sftep );
    // shaderborer = 1f;
    // if( shaderem > -shaderborer && shaderem < shaderborer ){
    //     shaderem /= 1f;
    //     if(shaderem>0){shaderem *= shaderem;}
    //     else{shaderem *= -shaderem;}
    //     out.color.x += (1f - out.color.x)*0.34*(1f-shaderem);
    //     out.color.y += (1f - out.color.y)*0.34*(1f-shaderem);
    //     out.color.z += (1f - out.color.z)*0.34*(1f-shaderem);
    // }

    // We'll pass the local 2D corner along for the fragment to use for alpha shaping
    out.localPos = corners[vertexIndex];

    return out;
}

// @fragment
// fn fs_main(input: VertexOutput) -> @location(0) vec4<f32> {
//     // Make a circular alpha shape based on the localPos
//     let dist = length(input.localPos) / 0.1;  // 0.1 was half-size
//     // We'll fade out near the edges for a smoother circle
//     let alpha = 1.0 - smoothstep(0.85, 1.0, dist);

//     return vec4<f32>(input.color.r, input.color.g, input.color.b, alpha);
// }


@fragment
fn fs_main(input: ParticleVSOut) -> @location(0) vec4<f32> {
    // alpha fade near edges
    let dist = length(input.localPos) / 0.1;
    let alpha = 1.0 - smoothstep(0.85, 1.0, dist);

    var baseColor = input.color;
    baseColor.a = alpha;

    // Fog
    let distanceToCamera = distance(input.worldPos, cameraData.cameraPos);
    let fogFactor = clamp((distanceToCamera - cameraData.fogNear)/(cameraData.fogFar - cameraData.fogNear), 0.0, 1.0);
    let finalColor = mix(baseColor, cameraData.fogColor, fogFactor);
    return finalColor;
}

// ------------------
//   PLANE
// ------------------
struct PlaneVSIn {
    @location(0) position : vec3<f32>,
    @location(1) uv : vec2<f32>,
};

struct PlaneVSOut {
    @builtin(position) position : vec4<f32>,
    @location(0) fragUV : vec2<f32>,
    @location(1) worldPos : vec3<f32>,
};

@vertex
fn vs_plane_main(inData: PlaneVSIn) -> PlaneVSOut {
    var out : PlaneVSOut;
    out.worldPos = inData.position;
    out.position = cameraData.vp * vec4<f32>(inData.position, 1.0);
    out.fragUV = inData.uv;
    return out;
}

@fragment
fn fs_plane_main(input: PlaneVSOut) -> @location(0) vec4<f32> {
    let texColor = textureSample(planeTexture, planeSampler, input.fragUV);

    // Fog
    let distanceToCamera = distance(input.worldPos, cameraData.cameraPos);
    let fogFactor = clamp((distanceToCamera - cameraData.fogNear)/(cameraData.fogFar - cameraData.fogNear), 0.0, 1.0);

    let finalColor = mix(texColor, cameraData.fogColor, fogFactor);
    return finalColor;
}
    `;
    const module = device.createShaderModule({ code: wgslCode });
    const pipelineLayout = device.createPipelineLayout({
        bindGroupLayouts: [
            device.createBindGroupLayout({
                entries: [
                    {
                        binding: 0,
                        visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
                        buffer: { type: 'read-only-storage' },
                    },
                ],
            }),
            device.createBindGroupLayout({
                entries: [
                    {
                        binding: 0,
                        visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
                        buffer: { type: 'uniform' },
                    },
                    {
                        binding: 1,
                        visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
                        buffer: { type: 'read-only-storage' },
                    },
                ],
            }),
            device.createBindGroupLayout({
                entries: [
                    {
                        binding: 0,
                        visibility: GPUShaderStage.FRAGMENT,
                        texture: {},
                    },
                    {
                        binding: 1,
                        visibility: GPUShaderStage.FRAGMENT,
                        sampler: {},
                    },
                ],
            }),
        ],
    });

    // Particle pipeline
    particlePipeline = device.createRenderPipeline({
        layout: pipelineLayout,
        vertex: {
            module,
            entryPoint: 'vs_main',
        },
        fragment: {
            module,
            entryPoint: 'fs_main',
            targets: [{ format: canvasFormat }],
        },
        primitive: {
            topology: 'triangle-list',
        },
        depthStencil: {
            format: 'depth24plus',
            depthWriteEnabled: true,
            depthCompare: 'less',
        },
    });

    // Plane pipeline
    planePipeline = device.createRenderPipeline({
        layout: pipelineLayout,
        vertex: {
            module,
            entryPoint: 'vs_plane_main',
            buffers: [
                {
                    arrayStride: 5*4, // x,y,z,u,v => 5 floats => 20 bytes
                    attributes: [
                        { shaderLocation: 0, offset: 0,  format: 'float32x3' },
                        { shaderLocation: 1, offset: 12, format: 'float32x2' },
                    ],
                },
            ],
        },
        fragment: {
            module,
            entryPoint: 'fs_plane_main',
            targets: [{ format: canvasFormat }],
        },
        primitive: {
            topology: 'triangle-list',
        },
        depthStencil: {
            format: 'depth24plus',
            depthWriteEnabled: true,
            depthCompare: 'less',
        },
    });

    // Bind groups for particles
    renderBindGroupParticles = device.createBindGroup({
        layout: particlePipeline.getBindGroupLayout(0),
        entries: [{ binding: 0, resource: { buffer: particleBuffer } }],
    });
    renderBindGroupVP = device.createBindGroup({
        layout: particlePipeline.getBindGroupLayout(1),
        entries: [
            { binding: 0, resource: { buffer: vpBuffer } },
            { binding: 1, resource: { buffer: userInputBuffer } },
        ],
    });
}

// For the plane texture
// Updated function
async function createPlaneTextureAndBindGroup(device) {
    const imgEl = document.getElementById('bgText1');
    if (!imgEl) {
        console.warn("No <img id='bgText1'> found!");
        return;
    }
    await imgEl.decode();
    const bmp = await createImageBitmap(imgEl);

    const planeTexture = device.createTexture({
        size: [bmp.width, bmp.height],
        format: 'rgba8unorm',
        usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT,
    });

    // Copy the bitmap directly to the texture
    device.queue.copyExternalImageToTexture(
        { source: bmp },
        { texture: planeTexture },
        [bmp.width, bmp.height]
    );

    const sampler = device.createSampler({
        magFilter: 'linear',
        minFilter: 'linear',
        mipmapFilter: 'linear',
    });

    planeBindGroup = device.createBindGroup({
        layout: planePipeline.getBindGroupLayout(2),
        entries: [
            { binding: 0, resource: planeTexture.createView() },
            { binding: 1, resource: sampler },
        ],
    });
}

async function main() {
    await initWebGPU();
    setupInputHandlers();

    await createParticleSystem(device);
    createPlaneGeometry(device);

    // userInput
    userInputBuffer = device.createBuffer({
        size: 64*4,
        usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
    });

    readbackBuffer = device.createBuffer({
        size: FINAL_POINT_DATA.ENT_SCRATCH_PAD_SIZE*4,//400,
        usage: GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST,
    });

    await createComputePipeline(device);

    // Uniform buffer => 160 bytes (multiple of 16)
    vpBuffer = device.createBuffer({
        size: 160,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });

    await createRenderPipelines(device);

    // Load plane texture
    await createPlaneTextureAndBindGroup(device);

    depthTexture = createDepthTexture(device, canvas.width, canvas.height);

    var FOG_R = 0.42;
    var FOG_G = 0.42;
    var FOG_B = 0.86;

    const renderPassDesc = {
        colorAttachments: [
            {
                view: null,
                clearValue: { r:FOG_R, g:FOG_G, b:FOG_B, a:1 },
                loadOp: 'clear',
                storeOp: 'store',
            },
        ],
        depthStencilAttachment: {
            view: null,
            depthClearValue: 1.0,
            depthLoadOp: 'clear',
            depthStoreOp: 'store',
        },
    };

    const cameraDataArray = new Float32Array(40);

    function frame() {
        if (stopSimulation) {
            return; // Prevents rescheduling when simulation should stop
        }
        if (isMapping || !device || !depthTexture) {
            setTimeout(frame, MSTIME);
            return;
        }
    
        document.getElementById('camModeDisplay').innerHTML = 'CURR_CAM_MODE: ' + CURR_CAM_MODE;
        //document.getElementById('distFromCenterDisplay').innerHTML = 
        // 2) If we want to force the camera to face a target, do that now:
        if (camera.useTarget && !(CURR_CAM_MODE < 0)) {

            // let xx = ALL_READABLE_ENTS[ CURR_CAM_MODE ].x;
            // let yy = ALL_READABLE_ENTS[ CURR_CAM_MODE ].y;
            // let zz = ALL_READABLE_ENTS[ CURR_CAM_MODE ].z;

            

            // Get closest interactive ent i think? 
            let shortestDistance = Infinity; // Track shortest distance found

            for(let v = 0; v < ALL_READABLE_ENTS.length; v++) {
                // Confirm if different entities
                if(v !== CURR_CAM_MODE) {
                    // Get current camera position
                    const camX = ALL_READABLE_ENTS[CURR_CAM_MODE].x;
                    const camY = ALL_READABLE_ENTS[CURR_CAM_MODE].y;
                    const camZ = ALL_READABLE_ENTS[CURR_CAM_MODE].z;

                    // Get entity position
                    const entX = ALL_READABLE_ENTS[v].x;
                    const entY = ALL_READABLE_ENTS[v].y;
                    const entZ = ALL_READABLE_ENTS[v].z;

                    // Calculate Euclidean distance between camera and entity
                    const dx = camX - entX;
                    const dy = camY - entY;
                    const dz = camZ - entZ;
                    const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

                    // Update closest entity if this distance is shorter
                    if(distance < shortestDistance) {
                        shortestDistance = distance;
                        CLOSEST_ENT_ID = 1 + ALL_READABLE_ENTS[v].i; // Store the 'i' value of closest entity
                    }
                }
            }

            // radius, angle, maybe a height offset
            //camera.position[0] = 14 * Math.sin(STEPCOUNT/124);
            //camera.position[1] = 5;
            //camera.position[2] = 14 * Math.cos(STEPCOUNT/124);

            // GET THE CURRENT VELOCITY OF THE 
            let velx = LAST_VEL_FROM_KEY_PROTAGONIST.x - ALL_READABLE_ENTS[ CURR_CAM_MODE ].x;
            let vely = LAST_VEL_FROM_KEY_PROTAGONIST.y - ALL_READABLE_ENTS[ CURR_CAM_MODE ].y;
            let velz = LAST_VEL_FROM_KEY_PROTAGONIST.z - ALL_READABLE_ENTS[ CURR_CAM_MODE ].z; 
            LAST_VEL_FROM_KEY_PROTAGONIST.x = ALL_READABLE_ENTS[ CURR_CAM_MODE ].x;
            LAST_VEL_FROM_KEY_PROTAGONIST.y = ALL_READABLE_ENTS[ CURR_CAM_MODE ].y;
            LAST_VEL_FROM_KEY_PROTAGONIST.z = ALL_READABLE_ENTS[ CURR_CAM_MODE ].z;

            let velofprotagonist = Math.hypot(velx, vely, velz);
            velofprotagonist *= 10000;
            velofprotagonist = Math.floor(velofprotagonist)

            let originToProtatgonist = Math.hypot(
                middlePlaneOffsetX - LAST_VEL_FROM_KEY_PROTAGONIST.x, 
                0 - LAST_VEL_FROM_KEY_PROTAGONIST.y, 
                middlePlaneOffsetZ - LAST_VEL_FROM_KEY_PROTAGONIST.z);
            originToProtatgonist *= 10000;
            originToProtatgonist = Math.floor(originToProtatgonist)



            // CURR_CAM_TARGET.x = CURR_CAM_TARGET.x + ALL_READABLE_ENTS[ CURR_CAM_MODE ].sx;//
            // CURR_CAM_TARGET.y = CURR_CAM_TARGET.y + ALL_READABLE_ENTS[ CURR_CAM_MODE ].sy;//
            // CURR_CAM_TARGET.z = CURR_CAM_TARGET.z + ALL_READABLE_ENTS[ CURR_CAM_MODE ].sz;//

            // Aqruaeim view
            if(proneCameraType === 2 ){
                // Push the cam somehere
                CURR_CAM_ENROUTE_TARGET.x -= ( CURR_CAM_ENROUTE_TARGET.x - ALL_READABLE_ENTS[ CURR_CAM_MODE ].x) / 21;
                CURR_CAM_ENROUTE_TARGET.y -= ( CURR_CAM_ENROUTE_TARGET.y - ALL_READABLE_ENTS[ CURR_CAM_MODE ].y) / 21;
                CURR_CAM_ENROUTE_TARGET.z -= ( CURR_CAM_ENROUTE_TARGET.z - ALL_READABLE_ENTS[ CURR_CAM_MODE ].z) / 21;

                CURR_CAM_TARGET.x -= ( CURR_CAM_TARGET.x - CURR_CAM_ENROUTE_TARGET.x ) / 21;
                CURR_CAM_TARGET.y -= ( CURR_CAM_TARGET.y - CURR_CAM_ENROUTE_TARGET.y ) / 21;
                CURR_CAM_TARGET.z -= ( CURR_CAM_TARGET.z - CURR_CAM_ENROUTE_TARGET.z ) / 21;
            }
            // "Aiming" mode
            else if(proneCameraType === 1 ){
                // Push the cam somehere farther out in aiming mode
                CURR_CAM_ENROUTE_TARGET.x -= ( CURR_CAM_ENROUTE_TARGET.x - (ALL_READABLE_ENTS[ CURR_CAM_MODE ].x+(5*ALL_READABLE_ENTS[CURR_CAM_MODE].sx)) ) / 21;
                CURR_CAM_ENROUTE_TARGET.y -= ( CURR_CAM_ENROUTE_TARGET.y - (ALL_READABLE_ENTS[ CURR_CAM_MODE ].y+(5*ALL_READABLE_ENTS[CURR_CAM_MODE].sy)) ) / 21;
                CURR_CAM_ENROUTE_TARGET.z -= ( CURR_CAM_ENROUTE_TARGET.z - (ALL_READABLE_ENTS[ CURR_CAM_MODE ].z+(5*ALL_READABLE_ENTS[CURR_CAM_MODE].sz)) ) / 21;

                CURR_CAM_TARGET.x -= ( CURR_CAM_TARGET.x - CURR_CAM_ENROUTE_TARGET.x ) / 21;
                CURR_CAM_TARGET.y -= ( CURR_CAM_TARGET.y - CURR_CAM_ENROUTE_TARGET.y ) / 21;
                CURR_CAM_TARGET.z -= ( CURR_CAM_TARGET.z - CURR_CAM_ENROUTE_TARGET.z ) / 21;
            }

            // "Aiming" mode false
            else if(proneCameraType === 0){
                
                // Push the cam somehere
                CURR_CAM_ENROUTE_TARGET.x -= ( CURR_CAM_ENROUTE_TARGET.x - ALL_READABLE_ENTS[ CURR_CAM_MODE ].x) / 21;
                CURR_CAM_ENROUTE_TARGET.y -= ( CURR_CAM_ENROUTE_TARGET.y - ALL_READABLE_ENTS[ CURR_CAM_MODE ].y) / 21;
                CURR_CAM_ENROUTE_TARGET.z -= ( CURR_CAM_ENROUTE_TARGET.z - ALL_READABLE_ENTS[ CURR_CAM_MODE ].z) / 21;

                CURR_CAM_TARGET.x -= ( CURR_CAM_TARGET.x - CURR_CAM_ENROUTE_TARGET.x ) / 21;
                CURR_CAM_TARGET.y -= ( CURR_CAM_TARGET.y - CURR_CAM_ENROUTE_TARGET.y ) / 21;
                CURR_CAM_TARGET.z -= ( CURR_CAM_TARGET.z - CURR_CAM_ENROUTE_TARGET.z ) / 21;

            }


            if(STEPCOUNT % 20 === 0){
                document.getElementById('scorePointsDisplay').innerHTML = "sfx 1\'s: " + SFX_COUNT_1;
                document.getElementById('velOfCentralGuy').innerHTML = 'velocity: ' + velofprotagonist;
                document.getElementById('distFromCenterDisplay').innerHTML = 'origin: ' + originToProtatgonist;
            }
            
            // Then look at 0,0,0
            // setCameraLookAt(camera, 0,3,28);
            setCameraLookAt(camera, CURR_CAM_TARGET.x, CURR_CAM_TARGET.y, CURR_CAM_TARGET.z );
        }
        else{
            CURR_CAM_TARGET.x = 0;//Math.cos(camera.rotation[0] + Math.PI);
            CURR_CAM_TARGET.y = 0;//
            CURR_CAM_TARGET.z = 0;//Math.sin(camera.rotation[0] + Math.PI);
            CLOSEST_ENT_ID = 0;
        }

        
        // 1) Update camera logic (WASD, etc.)
        updateCamera();

    
        // 3) Update user input
        userInputArray[0] = keys.t  ? 1:0;
        userInputArray[1] = keys.f  ? 1:0;
        userInputArray[2] = keys.g  ? 1:0;
        userInputArray[3] = keys.h  ? 1:0;
        userInputArray[4] = keys.q  ? 1:0;
        userInputArray[5] = keys.e  ? 1:0;
        userInputArray[6] = STEPCOUNT;
        userInputArray[7] = keys.w  ? 1:0;
        userInputArray[8] = keys.a  ? 1:0;
        userInputArray[9] = keys.s  ? 1:0;
        userInputArray[10] = keys.d ? 1:0; 
                let pausedthisone = keys.p ? true : false;
        userInputArray[11] = pausedthisone ? 1:0;  // pauseem, could also be paused for a ill death maneuver....(reseting timeline)
        userInputArray[12] = CURR_CAM_MODE > -1 ? (ALL_READABLE_ENTS[CURR_CAM_MODE].i+1) : (0);

        userInputArray[13] = userKeySpace ? 1:0;
        userInputArray[14] = userKeyShift ? 1:0;

        userInputArray[15] = userAbilityE ? 1:0;
        userInputArray[16] = userAbilityQ ? 1:0;

        userInputArray[17] = CLOSEST_ENT_ID;

        userInputArray[18] = keys.u ? 1:0; 
        userInputArray[19] = 0;//keys.enter ? 1:0; // closer up aimer
        if( proneCameraType === 0){// normal orbit follow
            userInputArray[19] = 0;
        }
        else if(proneCameraType === 1 ){// prone mode behind selected feesh
            userInputArray[19] = 1;
        }
        else if(proneCameraType === 2 ){// view fish tank mode 
            userInputArray[19] = 2;
        }
        userInputArray[20] = DEBUG_VISUALS ? 1:0; // toggle debug viewer



        //console.log(userInputArray[13], userInputArray[14])


        if( device)
        device.queue.writeBuffer(userInputBuffer, 0, userInputArray);
    
        // 4) Compute view-projection
        const vpMatrix = createViewProjectionMatrix(
            canvas.width / canvas.height,
            Math.PI/4,
            0.1, 100,
            camera.position,
            camera.rotation
        );
        cameraDataArray.set(vpMatrix, 0);
    
        // 5) Recalculate camera basis
        const cosPitch = Math.cos(camera.rotation[0]);
        const sinPitch = Math.sin(camera.rotation[0]);
        const cosYaw   = Math.cos(camera.rotation[1]);
        const sinYaw   = Math.sin(camera.rotation[1]);
    
        const forward = [
            cosPitch * sinYaw,
            sinPitch,
            cosPitch * cosYaw,
        ];
        const right = [
            cosYaw,
            0,
            -sinYaw,
        ];
        const up = [
            -sinPitch * sinYaw,
            cosPitch,
            -sinPitch * cosYaw,
        ];
    
        cameraDataArray[16] = right[0];
        cameraDataArray[17] = right[1];
        cameraDataArray[18] = right[2];
        cameraDataArray[20] = up[0];
        cameraDataArray[21] = up[1];
        cameraDataArray[22] = up[2];
        cameraDataArray[24] = forward[0];
        cameraDataArray[25] = forward[1];
        cameraDataArray[26] = forward[2];
    
        // camera pos
        cameraDataArray[28] = camera.position[0];
        cameraDataArray[29] = camera.position[1];
        cameraDataArray[30] = camera.position[2];
    
        // Fog fog, FOG
        cameraDataArray[32] = FOG_R;
        cameraDataArray[33] = FOG_G;
        cameraDataArray[34] = FOG_B;
        cameraDataArray[35] = 1.0;
        cameraDataArray[36] = 35.0;   // near
        cameraDataArray[37] = 70.0;   // far
    
        if(device)
        device.queue.writeBuffer(vpBuffer, 0, cameraDataArray);
    
        // 6) Encode commands
        const cmdEncoder = device.createCommandEncoder();
    
        // Example compute pass
        const computePass = cmdEncoder.beginComputePass();
        computePass.setPipeline(computePipeline);
        computePass.setBindGroup(0, computeBindGroup);
        computePass.dispatchWorkgroups(
            Math.ceil((FINAL_POINT_DATA.totalParticleCount - 100) / 64)
        );
        computePass.end();





        // Possibly read back
        let goodToReadback = ((STEPCOUNT+1) % READBACKFREQ===0);
        if (goodToReadback) {
            cmdEncoder.copyBufferToBuffer(particleBuffer, 0, readbackBuffer, 0, FINAL_POINT_DATA.ENT_SCRATCH_PAD_SIZE * 4);
        }

        // Render pass
        renderPassDesc.colorAttachments[0].view = context.getCurrentTexture().createView();
        renderPassDesc.depthStencilAttachment.view = depthTexture.createView();

        const pass = cmdEncoder.beginRenderPass(renderPassDesc);

        // 1) Draw particles
        pass.setPipeline(particlePipeline);
        pass.setBindGroup(0, renderBindGroupParticles);
        pass.setBindGroup(1, renderBindGroupVP);
        if (planeBindGroup) pass.setBindGroup(2, planeBindGroup);
        pass.draw(6, particleCount, 0, 0);

        // 2) Draw plane
        if (planeBindGroup) {
            pass.setPipeline(planePipeline);
            // For group(0), we can reuse the particles buffer or a dummy – not used by plane
            pass.setBindGroup(0, renderBindGroupParticles);
            pass.setBindGroup(1, renderBindGroupVP);
            pass.setBindGroup(2, planeBindGroup);

            // Now the plane's vertex buffer is planeStorageBuffer
            pass.setVertexBuffer(0, planeStorageBuffer);
            pass.setIndexBuffer(planeIndexBuffer, 'uint32');
            pass.drawIndexed(planeIndexCount, 1, 0, 0, 0);
        }
        pass.end();

        const cmd = cmdEncoder.finish();
        device.queue.submit([cmd]);

        // If readback
        if (goodToReadback) {
            isMapping = true;
            device.queue.onSubmittedWorkDone().then(async () => {
                await readbackBuffer.mapAsync(GPUMapMode.READ);
                const copyArray = new Float32Array(readbackBuffer.getMappedRange());
                cpuReadback(copyArray);
                readbackBuffer.unmap();
                isMapping = false;
            });
        }

        if( !pausedthisone ){
            STEPCOUNT++;
            userAbilityE = false;
            userAbilityQ = false;
        }
        setTimeout(frame, MSTIME);
    }

    frame();
}

const img = new Image();
img.id = "bgText1"; // Match the expected ID
img.src = bgsmolcave;
document.body.appendChild(img); // Add to DOM if needed
img.classList.add("hidden"); // Match your original class 


main()
//main();
