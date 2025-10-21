// File for how to conduct things going on in the game

var GAME_MODE = 0;
// 0 = title screen 
// 1 = in a scenario 

var INTELLIGENTLY_CONTROLLED = []; // the profile of who's controlling the guys

var THIS_CLIENT_CONTROL_IND = -1;   // the index this client controls


// Call this if u wanna start a fresh game as well
function resetGameMetaToo(){
    GAME_MODE = 0;
    INTELLIGENTLY_CONTROLLED = [];
    THIS_CLIENT_CONTROL_IND = -1;
}


// Updated statistics data
var starterStats = [
    [
        {Label: "Name", value: "Fish Bus"},
        {Label: "Total Mass", value: 1098},
        {Label: "Total Springs", value: 258796},
        {Label: "Awesome", value: 5}
    ],
    [
        {Label: "Name", value: "Alaskan Bull Worm"},
        {Label: "Total Mass", value: 3666},
        {Label: "Total Springs", value: 520012},
        {Label: "Awesome", value: 6}
    ],
    [
        {Label: "Name", value: "Bumble"},
        {Label: "Total Mass", value: 593},
        {Label: "Total Springs", value: 197996},
        {Label: "Awesome", value: 4}
    ],
    [
        {Label: "Name", value: "in development"},
        {Label: "Total Mass", value: 0},
        {Label: "Total Springs", value: 0},
        {Label: "Defence Shields", value: 0}
    ],
    
    [
        {Label: "Name", value: "in development"},
        {Label: "Total Mass", value: 0},
        {Label: "Total Springs", value: 0},
        {Label: "Defence Shields", value: 0}
    ],
    
    [
        {Label: "Name", value: "in development"},
        {Label: "Total Mass", value: 0},
        {Label: "Total Springs", value: 0},
        {Label: "Defence Shields", value: 0}
    ],
    
    [
        {Label: "Name", value: "in development"},
        {Label: "Total Mass", value: 0},
        {Label: "Total Springs", value: 0},
        {Label: "Defence Shields", value: 0}
    ],
    
    [
        {Label: "Name", value: "in development"},
        {Label: "Total Mass", value: 0},
        {Label: "Total Springs", value: 0},
        {Label: "Defence Shields", value: 0}
    ],
];





function startBumblebeeSim( customScenarioObject, locationsOfTheseNewEntities, theseNewDbEntries, totalParticleIndexTracker, entity_role_templates, STAD ){
    EZWG.SHA1.seed( customScenarioObject.seed );

    var ALL_ENTITY_ROLES = {       
        
        CTRLFISH1: {ind: -1},

        BUMBLEBEE1: {ind: -1},
        DRAGONFLY1: {ind: -1},

        DANDELION1: {ind: -1},

        CHILL1: { ind : -1 },       // Doesn't do anything  
 
 
 
    };

    
    // 2
    ALL_ENTITY_ROLES.CTRLFISH1 = 
        createNewEntityRoleInDatabase( entity_role_templates,
            {
                ind: entity_role_templates.length,  // index of the entity roles 
                top_pull: 0.0115 * 0.3,
                bottom_pull: -0.0115 * 0.3,
                target_id: "-none---",          // no target because you are being controlled by the player
                collide_with: 2,                // collide with bad
                forward_engine: 0.015,          // how much forward thrust
                backward_engine: 0.01,          // how much pull back on the back for orienting
                grav_pull: 0.0,//0.00084,//..
                reserved_particles: [],          // reserved particle amount
                user_ctrl_scheme: 1,
                top_bottom_mass_ratio: 0.92,// multiply all the top forces by this to get even balanceer
                rotation_engine: 0.02, // turn force for left n right, and tilting up n down for left n right, and tilting up n down
                behaviour_type: 0,   
            }
        );
 
    ALL_ENTITY_ROLES.DRAGONFLY1 = 
        createNewEntityRoleInDatabase( entity_role_templates,
            {
                ind: entity_role_templates.length,  // index of the entity roles 
                top_pull:  0.0115 * 0.05,
                bottom_pull:  -0.0115 * 0.05,
                target_id: "-nonen-",    // attribute of STAD that has the ID of a particle to follow 
                collide_with: 2,                // collide with good and bad (collide with both )
                forward_engine: 0.0045,
                backward_engine: 0.0021,
                grav_pull: 0,//0.00011,          
                reserved_particles: [
        
                    //{size: 340, t: 22}
                ],          // reserved particle amount
                user_ctrl_scheme: 2,
                top_bottom_mass_ratio: 1.1,// multiply all the top forces by this to get even balanceer
                rotation_engine: 0.01, // turn force for left n right, and tilting up n down
                behaviour_type: 2,
                custom_movement_rules: [
                    {identifying_colour: {r: 144, g: 210, b: 229}, mode: 2}, // FLAPPER dragonfly 1
                    {identifying_colour: {r: 145, g: 218, b: 239}, mode: 3} // FLAPPER dragonfly 1
                ]
            }
        );
        
    // 7
    ALL_ENTITY_ROLES.DANDELION1 = 
        createNewEntityRoleInDatabase( entity_role_templates,
            {
                ind: entity_role_templates.length,  // index of the entity roles 
                top_pull: 0.0115 * 0.3,
                bottom_pull: -0.0115 * 0.7,
                target_id: "-nonen-",    // attribute of STAD that has the ID of a particle to follow 
                collide_with: 2,                // collide with good 
                forward_engine: 0.0,
                backward_engine: 0.0,
                grav_pull: 0.00004,          
                reserved_particles: [],          // reserved particle amount
                user_ctrl_scheme: 1,
                top_bottom_mass_ratio: 1,// multiply all the top forces by this to get even balanceer
                rotation_engine: 0.01, // turn force for left n right, and tilting up n down
                behaviour_type: 0,   
            }
        );

        
    
    ALL_ENTITY_ROLES.BUMBLEBEE1 = 
        createNewEntityRoleInDatabase( entity_role_templates,
            {
                ind: entity_role_templates.length,  // index of the entity roles 
                top_pull:  0.0115 * 0.05,
                bottom_pull:  -0.0115 * 0.05,
                target_id: "-nonen-",    // attribute of STAD that has the ID of a particle to follow 
                collide_with: 2,                // collide with good and bad (collide with both )
                forward_engine: 0.003,
                backward_engine: 0.002,
                grav_pull: 0,//0.00011,          
                reserved_particles: [
        
                    //{size: 340, t: 22}
                ],          // reserved particle amount
                user_ctrl_scheme: 2,
                top_bottom_mass_ratio: 1.1,// multiply all the top forces by this to get even balanceer
                rotation_engine: 0.01, // turn force for left n right, and tilting up n down
                behaviour_type: 2,
                max_sight_range: 11*STAD.bucks_pacing,  // when it detects
                wants_entity_role: 0,//what role it is attracted to
                custom_movement_rules: [
                    {identifying_colour: {r: 159, g: 216, b: 233}, mode: 1} // FLAPPER
                ]
            }
        );




    
    //  ADD
    //      INSTNATIAITNG THE OBJECTS
    //          =================================================================================================
    //                          I N S T A N T I A T E
    //__________________________________________________________________________________




    var new_parts_for_main_scalpel = [];
    console.log('ALL_ENTITY_ROLES.CTRLFISH1.ind', ALL_ENTITY_ROLES.CTRLFISH1.ind);
    STAD.instance_urfish = addVoxelModelApplyOrientersAndBindNearest(
        STAD.middleSpawnPointX, 6.0, STAD.middleSpawnPointY,
        new_parts_for_main_scalpel, theseNewDbEntries, getVoxelModel( "lilminnow1" ),// ( "lilfish1" ) ( "lilfish2"), "lilminnow1""biggertruck
        STAD.stdvoxeldensity, totalParticleIndexTracker,
        {
            debugrender: true,
            entityrole: ALL_ENTITY_ROLES.CTRLFISH1,        
            bindunits: 8.0,       //multiply factor of spacing for spring connection
            orientbind: 1.5,      //multiply factor for orienting control cataloguing
            allowedspringtypes: STAD.springAllowedTees,
            reserve_cpu_readbackspot: true,  // if true, reserve a spot in the scratch pad
            collision_orbs_mode: "good",     // all collisino orbs (t=5, r=255,g=120,b=120) which side do they go on.
            paintjobs: [
                // // Thumb
                // {input:{r:238,g:211,b:21}, output:{r:14, g: 215, b: 3}},
                // // Index
                // {input:{r:240,g:213,b:20}, output:{r:215, g: 17, b: 17}},
                // // Middle
                // {input:{r:239,g:213,b:27}, output:{r:14, g: 34, b: 234}},
                // // Ring
                // {input:{r:239,g:214,b:40}, output:{r:244, g: 127, b: 23}},
            ], 
        }
    );
    locationsOfTheseNewEntities = locationsOfTheseNewEntities.concat( new_parts_for_main_scalpel );

    


    // HERE SET THE PLAYER TO THE IND YOURE CONTROLLING
    INTELLIGENTLY_CONTROLLED[ THIS_CLIENT_CONTROL_IND ].tealind = 
        STAD.instance_urfish.nucleus;




    for(let sc = 0;sc < 33;sc++){
        let bumlebeeparts= [];
        
        console.log('ALL_ENTITY_ROLES.BUMBLEBEE1.ind', ALL_ENTITY_ROLES.BUMBLEBEE1.ind)
        addVoxelModelApplyOrientersAndBindNearest(
            //STAD.middleSpawnPointX + 2.0, 13.0, STAD.middleSpawnPointY + 8.0,
            EZWG.SHA1.random()*STAD.oneSideLength ,
            EZWG.SHA1.random()*STAD.oneSideLength*0.06,
            EZWG.SHA1.random()*STAD.oneSideLength,
            bumlebeeparts, theseNewDbEntries, getVoxelModel("bumblebee1"),
            STAD.titevoxeldensity, totalParticleIndexTracker,
            {
                debugrender: true,
                entityrole: ALL_ENTITY_ROLES.BUMBLEBEE1,      
                bindunits: 4.0,                                 
                orientbind: 1.5,                                
                allowedspringtypes: STAD.springAllowedTees,     
                reserve_cpu_readbackspot: true,                 
                collision_orbs_mode: "bad",
                paintjobs: [
                    // // Thumb
                    // {input:{r:238,g:211,b:21}, output:{r:14, g: 215, b: 3}},
                    // // Index
                    // {input:{r:240,g:213,b:20}, output:{r:215, g: 17, b: 17}},
                    // // Middle
                    // {input:{r:239,g:213,b:27}, output:{r:14, g: 34, b: 234}},
                    // // Ring
                    // {input:{r:239,g:214,b:40}, output:{r:244, g: 127, b: 23}},
                ],
                restricted_spring_rules: [
    
                ],                 
            }
        );
        locationsOfTheseNewEntities = locationsOfTheseNewEntities.concat( bumlebeeparts );

    }

    

    for(let sc = 0;sc < 3;sc++){
        let dragon_fly_parts= [];
        
        console.log('ALL_ENTITY_ROLES.DRAGONFLY1.ind', ALL_ENTITY_ROLES.DRAGONFLY1.ind)
        addVoxelModelApplyOrientersAndBindNearest(
            //STAD.middleSpawnPointX + 2.0, 13.0, STAD.middleSpawnPointY + 8.0,
            EZWG.SHA1.random()*STAD.oneSideLength ,
            EZWG.SHA1.random()*STAD.oneSideLength*0.06,
            EZWG.SHA1.random()*STAD.oneSideLength,
            dragon_fly_parts, theseNewDbEntries, getVoxelModel("dragonfly1"),
            STAD.titevoxeldensity, totalParticleIndexTracker,
            {
                debugrender: true,
                entityrole: ALL_ENTITY_ROLES.DRAGONFLY1,      
                bindunits: 5.5,                                 
                orientbind: 1.5,                                
                allowedspringtypes: STAD.springAllowedTees,     
                reserve_cpu_readbackspot: true,                 
                collision_orbs_mode: "bad",
                paintjobs: [
                    // // Thumb
                    // {input:{r:238,g:211,b:21}, output:{r:14, g: 215, b: 3}},
                    // // Index
                    // {input:{r:240,g:213,b:20}, output:{r:215, g: 17, b: 17}},
                    // // Middle
                    // {input:{r:239,g:213,b:27}, output:{r:14, g: 34, b: 234}},
                    // // Ring
                    // {input:{r:239,g:214,b:40}, output:{r:244, g: 127, b: 23}},
                ],
                restricted_spring_rules: [
    
                ],                 
            }
        );
        locationsOfTheseNewEntities = locationsOfTheseNewEntities.concat( dragon_fly_parts );

    }

    let spanx = STAD.spawnAreaLengthX*2;
    let spany = STAD.spawnAreaLengthY*2;
    for(let sc = 0;sc < 4;sc++){
        let faunalist = [];
        console.log('ALL_ENTITY_ROLES.DANDELION1.ind', ALL_ENTITY_ROLES.DANDELION1.ind)
        
        //STAD["instance_seaweedf"] = 
        addVoxelModelApplyOrientersAndBindNearest(
            STAD.middleSpawnPointX - STAD.spawnAreaLengthX + EZWG.SHA1.random()*spanx ,
            EZWG.SHA1.random()*STAD.BUCKET_PERIMETER*STAD.bucks_pacing*0.1,
            STAD.middleSpawnPointY - STAD.spawnAreaLengthY + EZWG.SHA1.random()*spany,
            faunalist, theseNewDbEntries, getVoxelModel("gardenflower1"),
            STAD.stdvoxeldensity, totalParticleIndexTracker,
            {
                debugrender: true,
                entityrole: ALL_ENTITY_ROLES.DANDELION1,      
                bindunits: 5.0,                                 
                orientbind: 3.5,                                
                allowedspringtypes: STAD.springAllowedTees,     
                reserve_cpu_readbackspot: true,                 
                collision_orbs_mode: "bad"                      
            }
        );
        locationsOfTheseNewEntities = locationsOfTheseNewEntities.concat( faunalist );
    }

    

    // This is the only pointer that gets fucked with so gotta 
    return locationsOfTheseNewEntities;


}

function startSpongeCity( customScenarioObject, locationsOfTheseNewEntities, theseNewDbEntries, totalParticleIndexTracker, entity_role_templates, STAD ){

    EZWG.SHA1.seed( customScenarioObject.seed );

    var ALL_ENTITY_ROLES = {        
        CHILL1: { ind : -1 },       // Doesn't do anything 
        CTRLFISH1: {ind: -1},       

        TRUCKBEACHBOY1: {ind: -1},
        MEGAWORM1: {ind: -1},

        DRIFTERTRASH1: {ind: -1},   // Drift and be nice 

        STATICBUILDING1: {ind: -1}, // Just stay put :)
        STATICBIGBUILDING1: {ind: -1}, // Just stay put :)
        KNOCKABLEDOWN1: {ind: -1}, // Just stay put  and be very weak

        TRENDINGJELLYFISH1: {ind: -1},

        BOATTRUCKFREEROAM1: {ind: -1},
    };

    
        
    var MAIN_PLAYER_RESERVED_MUDWORM_PARTICLES = [
        
        //{size: 150, t: 22}, // water-like mud that gets kicked up

        {size: 1650, t: 15}, // for mud from the wermmmm worm

        {size: 350, t: 15}, // magic particles for fish lasso
        //{size: 26, t: 15},   // KEEP it to 15 (water particles) BUT they're just never activated so it stays as 14 (but for the ent youre targeting)
        {size: 500, t: 19, smk: 21}    // add one MISSILE[0]. [1-199] smolk particles (being 21)
    ];
    var MAIN_PLAYER_RESERVED_WATER_PARTICLES = [
        
        {size: 1250, t: 22}, // water-like mud that gets kicked up

        //{size: 3650, t: 15}, // for mud from the wermmmm worm

        {size: 350, t: 15}, // magic particles for fish lasso
        //{size: 26, t: 15},   // KEEP it to 15 (water particles) BUT they're just never activated so it stays as 14 (but for the ent youre targeting)
        {size: 500, t: 19, smk: 21}    // add one MISSILE[0]. [1-199] smolk particles (being 21)
    ]


    // 2
    ALL_ENTITY_ROLES.CTRLFISH1 = 
        createNewEntityRoleInDatabase( entity_role_templates,
            {
                ind: entity_role_templates.length,  // index of the entity roles 
                top_pull: 0.0115 * 0.3,
                bottom_pull: -0.0115 * 0.3,
                target_id: "-none---",          // no target because you are being controlled by the player
                collide_with: 2,                // collide with bad
                forward_engine: 0.0122,          // how much forward thrust
                backward_engine: 0.0,          // how much pull back on the back for orienting
                grav_pull: 0.0,//0.00084,//..
                reserved_particles: MAIN_PLAYER_RESERVED_WATER_PARTICLES,          // reserved particle amount
                user_ctrl_scheme: 5,
                top_bottom_mass_ratio: 1.04,// multiply all the top forces by this to get even balanceer
                rotation_engine: 0.016, // turn force for left n right, and tilting up n down for left n right, and tilting up n down
                behaviour_type: 4,   
            }
        );



    
    // 4 Evil Car runin u over role, stock target at certain elevation
    ALL_ENTITY_ROLES.TRUCKBEACHBOY1 = 
        createNewEntityRoleInDatabase( entity_role_templates,
            {
                ind: entity_role_templates.length,  // index of the entity roles 
                top_pull: 0.0115 * 0.34,
                bottom_pull: -0.0115 * 0.29,
                target_id: "instance_beachball1",    // attribute of STAD that has the ID of a particle to follow 
                collide_with: 2,                // collide with both 
                forward_engine: 0.034,
                backward_engine: 0.031,       // how much pull back on the back for orienting
                grav_pull: 0.0007,          
                reserved_particles: MAIN_PLAYER_RESERVED_WATER_PARTICLES,          // reserved particle amount
                user_ctrl_scheme: 1,
                top_bottom_mass_ratio: 2.3,// multiply all the top forces by this to get even balanceer
                rotation_engine: 0.038, // turn force for left n right, and tilting up n down
                behaviour_type: 1,   
            }
        );
        
    
    // 4 Evil Car runin u over role, stock target at certain elevation
    ALL_ENTITY_ROLES.MEGAWORM1 = 
        createNewEntityRoleInDatabase( entity_role_templates,
            {
                ind: entity_role_templates.length,  // index of the entity roles 
                top_pull: 0.0115 * 0.04,
                bottom_pull: -0.0115 * 0.15,
                target_id: "instance_beachball1",    // attribute of STAD that has the ID of a particle to follow 
                collide_with: 2,                // collide with both 
                forward_engine: 0.0087,
                backward_engine: 0.006,       // how much pull back on the back for orienting
                grav_pull: 0.0003,          
                reserved_particles: MAIN_PLAYER_RESERVED_MUDWORM_PARTICLES,          // reserved particle amount
                user_ctrl_scheme: 1,
                top_bottom_mass_ratio: 1.0,// multiply all the top forces by this to get even balanceer
                rotation_engine: 0.014, // turn force for left n right, and tilting up n down
                behaviour_type: 1,
                
                voxel_sizer: STAD.larger_voxel_sizer*1.3//1.62
            }
        );


        
    // 12
    ALL_ENTITY_ROLES.DRIFTERTRASH1 = 
        createNewEntityRoleInDatabase( entity_role_templates,
            {
                ind: entity_role_templates.length,  // index of the entity roles 
                top_pull: 0,
                bottom_pull: 0,
                target_id: "-none---",      // attribute of STAD that has the ID of a particle to follow (INSERTED AT THE END)
                collide_with: 2,            // both good and bad
                forward_engine: 0.02,       // how does the forward engine work
                backward_engine: 0.00,      // how much pull back on the back for orienting
                grav_pull: 0.0,             // how much gravity to apply to each
                reserved_particles: [],     // reserved particle amount
                user_ctrl_scheme: 1,         //1= truck mode (WASD forward/back)
                                        //2 = float mode (WASD flightstick/thrust)
                                        //3=helicopter movement
                                        //4=ufo
                                        //5=orient towards current selection
                top_bottom_mass_ratio: 1,// multiply all the top forces by this to get even balanceer
                rotation_engine: 0.01 // turn force for left n right, and tilting up n down
            }
        );
        
    ALL_ENTITY_ROLES.STATICBUILDING1 = 
        createNewEntityRoleInDatabase( entity_role_templates,
            {
                ind: entity_role_templates.length,  // index of the entity roles 
                top_pull: 0.0115 * 0.48,
                bottom_pull: -0.0115 * 0.6,
                target_id: "-nonen-",    // attribute of STAD that has the ID of a particle to follow 
                collide_with: 2,                // collide with good 
                forward_engine: 0.0,
                backward_engine: 0.0,
                grav_pull: 0.00005,          
                reserved_particles: [],          // reserved particle amount
                user_ctrl_scheme: 1,
                top_bottom_mass_ratio: 1,// multiply all the top forces by this to get even balanceer
                rotation_engine: 0.01, // turn force for left n right, and tilting up n down
                behaviour_type: 0,   
            }
        );
    ALL_ENTITY_ROLES.STATICBIGBUILDING1 = 
        createNewEntityRoleInDatabase( entity_role_templates,
            {
                ind: entity_role_templates.length,  // index of the entity roles 
                top_pull: 0.0115 * 0.48,
                bottom_pull: -0.0115 * 0.6,
                target_id: "-nonen-",    // attribute of STAD that has the ID of a particle to follow 
                collide_with: 2,                // collide with good 
                forward_engine: 0.0,
                backward_engine: 0.0,
                grav_pull: 0.00005,          
                reserved_particles: [],          // reserved particle amount
                user_ctrl_scheme: 1,
                top_bottom_mass_ratio: 1,// multiply all the top forces by this to get even balanceer
                rotation_engine: 0.01, // turn force for left n right, and tilting up n down
                behaviour_type: 0,  

                voxel_sizer: STAD.larger_voxel_sizer//1.62
            }
        );
    ALL_ENTITY_ROLES.KNOCKABLEDOWN1 = 
        createNewEntityRoleInDatabase( entity_role_templates,
            {
                ind: entity_role_templates.length,  // index of the entity roles 
                top_pull: 0,//0.0115 * 0.48,
                bottom_pull: 0,//-0.0115 * 0.6,
                target_id: "-nonen-",    // attribute of STAD that has the ID of a particle to follow 
                collide_with: 2,                // collide with good 
                forward_engine: 0.0,
                backward_engine: 0.0,
                grav_pull: 0.0,          
                reserved_particles: [],          // reserved particle amount
                user_ctrl_scheme: 1,
                top_bottom_mass_ratio: 1,// multiply all the top forces by this to get even balanceer
                rotation_engine: 0.01, // turn force for left n right, and tilting up n down
                behaviour_type: 0,
                
                voxel_sizer: STAD.larger_voxel_sizer//1.62
            }
        );

        
    // 6
    ALL_ENTITY_ROLES.TRENDINGJELLYFISH1 = 
        createNewEntityRoleInDatabase( entity_role_templates,
            {
                ind: entity_role_templates.length,  // index of the entity roles 
                top_pull: 0,//0.0115 * 0.01,
                bottom_pull: 0,//-0.0115 * 0.01,
                target_id: "-nonen-",    // attribute of STAD that has the ID of a particle to follow 
                collide_with: 2,                // collide with good and bad (collide with both )
                forward_engine: 0.0023,
                backward_engine: 0.001,
                grav_pull: 0,//0.00011,          
                reserved_particles: [
        
                    {size: 340, t: 22}
                ],          // reserved particle amount
                user_ctrl_scheme: 2,
                top_bottom_mass_ratio: 1.1,// multiply all the top forces by this to get even balanceer
                rotation_engine: 0.01, // turn force for left n right, and tilting up n down
                behaviour_type: 2,   
            }
        );

    ALL_ENTITY_ROLES.BOATTRUCKFREEROAM1 = 
        createNewEntityRoleInDatabase( entity_role_templates,
            {
                ind: entity_role_templates.length,  // index of the entity roles 
                top_pull: 0.0115 * 0.08,
                bottom_pull: -0.0115 * 0.05,
                target_id: "-none---",    // attribute of STAD that has the ID of a particle to follow 
                collide_with: 2,                // collide with both 
                forward_engine: 0.007,
                backward_engine: 0.003,       // how much pull back on the back for orienting
                grav_pull: 0.0007,          
                reserved_particles: [],          // reserved particle amount
                user_ctrl_scheme: 1,
                top_bottom_mass_ratio: 1,// multiply all the top forces by this to get even balanceer
                rotation_engine: 0.01, // turn force for left n right, and tilting up n down
                behaviour_type: 3,   
            }
        );
    

        
        
    if( customScenarioObject.starting === 0 ){
        var new_parts_truck = [];
        console.log('ALL_ENTITY_ROLES.TRUCKBEACHBOY1.ind', ALL_ENTITY_ROLES.TRUCKBEACHBOY1.ind);
        
        // RED TRUCK
        STAD.instance_urfish = 
            addVoxelModelApplyOrientersAndBindNearest(
                STAD.middleSpawnPointX + STAD.spawnAreaLengthX, 8.0, STAD.middleSpawnPointY - STAD.spawnAreaLengthY,
                new_parts_truck, theseNewDbEntries, getVoxelModel("spbus1"),
                STAD.stdvoxeldensity, totalParticleIndexTracker,
                {
                    debugrender: true,
                    entityrole: ALL_ENTITY_ROLES.TRUCKBEACHBOY1,   
                    bindunits: 8.0,
                    orientbind: 2.0,
                    allowedspringtypes: STAD.springAllowedTees,
                    reserve_cpu_readbackspot: true,  
                    collision_orbs_mode: "bad",
                    paintjobs:[
                        //{input:{r:101,g:99,b:109}, output:{r:215, g: 17, b: 17}},
                    ]
                }
            ); 
        locationsOfTheseNewEntities = locationsOfTheseNewEntities.concat( new_parts_truck );
    }
    else if( customScenarioObject.starting === 1 ){
        var new_parts_truck = [];
        console.log('ALL_ENTITY_ROLES.MEGAWORM1.ind', ALL_ENTITY_ROLES.MEGAWORM1.ind);
        
        // RED TRUCK
        STAD.instance_urfish = 
            addVoxelModelApplyOrientersAndBindNearest(
                STAD.middleSpawnPointX + STAD.spawnAreaLengthX, 
                8.0, 
                STAD.middleSpawnPointY - STAD.spawnAreaLengthY,
                new_parts_truck, theseNewDbEntries, getVoxelModel("spmegaworm2"),
                STAD.largervoxeldensity*1.2, totalParticleIndexTracker,
                {
                    debugrender: true,
                    entityrole: ALL_ENTITY_ROLES.MEGAWORM1,   
                    bindunits: 5.0,
                    orientbind: 4.0,
                    allowedspringtypes: STAD.springAllowedTees,
                    reserve_cpu_readbackspot: true,  
                    collision_orbs_mode: "bad",
                    paintjobs:[
                        //{input:{r:101,g:99,b:109}, output:{r:215, g: 17, b: 17}},
                    ],
                    xyzmover: (x,y,z) => {
                        return {x: x, y: y, z: z}
                    }
                }
            ); 
        locationsOfTheseNewEntities = locationsOfTheseNewEntities.concat( new_parts_truck );
    }

    

    


    // HERE SET THE PLAYER TO THE IND YOURE CONTROLLING
    INTELLIGENTLY_CONTROLLED[ THIS_CLIENT_CONTROL_IND ].tealind = 
        STAD.instance_urfish.nucleus;

 



    
    //  ADD
    //      KEY CHARACTER HOUSES
    //          =================================================================================================
    //                          K E Y    S P E C I A L    D O M I C I L E S 
    //__________________________________________________________________________________

    let SPONGE_NEIGHBOURHOOD_X = STAD.middleSpawnPointX - 23*STAD.bucks_pacing 

    let spongebhouseparts = [];
    console.log('ALL_ENTITY_ROLES.STATICBIGBUILDING1.ind', ALL_ENTITY_ROLES.STATICBIGBUILDING1.ind)
    
    //STAD["instance_seaweedf"] = 
    addVoxelModelApplyOrientersAndBindNearest(
        SPONGE_NEIGHBOURHOOD_X,
        STAD.bucks_pacing*1,
        STAD.middleSpawnPointY - 3*STAD.bucks_pacing ,//EZWG.SHA1.random()*spany,
        spongebhouseparts, theseNewDbEntries, getVoxelModel("sppineapple1"),
        STAD.largervoxeldensity, totalParticleIndexTracker,
        {
            debugrender: true,
            entityrole: ALL_ENTITY_ROLES.STATICBIGBUILDING1,      
            bindunits: 3.5,                                 
            orientbind: 2.5,   
            springpowermod: 1.0,                             
            allowedspringtypes: STAD.springAllowedTees,     
            reserve_cpu_readbackspot: true,                 
            collision_orbs_mode: "bad",
            xyzmover: (x,y,z) => {
                return {x: -z, y: y, z: x}
            }
        }
    );
    locationsOfTheseNewEntities = locationsOfTheseNewEntities.concat( spongebhouseparts );

    let squdiwarehouseparts = [];
    console.log('ALL_ENTITY_ROLES.STATICBIGBUILDING1.ind', ALL_ENTITY_ROLES.STATICBIGBUILDING1.ind)
    
    //STAD["instance_seaweedf"] = 
    addVoxelModelApplyOrientersAndBindNearest(
        SPONGE_NEIGHBOURHOOD_X,
        STAD.bucks_pacing*1,
        STAD.middleSpawnPointY + 3*STAD.bucks_pacing ,//EZWG.SHA1.random()*spany,
        squdiwarehouseparts, theseNewDbEntries, getVoxelModel("spstonehenge1"),
        STAD.largervoxeldensity, totalParticleIndexTracker,
        {
            debugrender: true,
            entityrole: ALL_ENTITY_ROLES.STATICBIGBUILDING1,
            bindunits: 4.0,
            orientbind: 2.5,
            springpowermod: 1.0,
            allowedspringtypes: STAD.springAllowedTees,
            reserve_cpu_readbackspot: true,
            collision_orbs_mode: "bad",
            xyzmover: (x,y,z) => {
                return {x: -z, y: y, z: x}
            }
        }
    );
    locationsOfTheseNewEntities = locationsOfTheseNewEntities.concat( squdiwarehouseparts );

    
    let coconuthouseparts = [];
    console.log('ALL_ENTITY_ROLES.STATICBIGBUILDING1.ind', ALL_ENTITY_ROLES.STATICBIGBUILDING1.ind)
    
    //STAD["instance_seaweedf"] = 
    addVoxelModelApplyOrientersAndBindNearest(
        SPONGE_NEIGHBOURHOOD_X ,
        STAD.bucks_pacing*1,
        STAD.middleSpawnPointY + 9*STAD.bucks_pacing ,//EZWG.SHA1.random()*spany,
        coconuthouseparts, theseNewDbEntries, getVoxelModel("spcoconuthouse1"),
        STAD.largervoxeldensity, totalParticleIndexTracker,
        {
            debugrender: true,
            entityrole: ALL_ENTITY_ROLES.STATICBIGBUILDING1,
            bindunits: 4.0,
            orientbind: 2.5,
            springpowermod: 1.0,
            allowedspringtypes: STAD.springAllowedTees,
            reserve_cpu_readbackspot: true,
            collision_orbs_mode: "bad",
            xyzmover: (x,y,z) => {
                return {x: -z, y: y, z: x}
            }
        }
    );
    locationsOfTheseNewEntities = locationsOfTheseNewEntities.concat( coconuthouseparts );

    

    //  ADD
    //      GROUND BUILDINGS (BUT WEAK)
    //          =================================================================================================
    //                          W E A K E R    S P O N G E B O B    D O M I C I L E S 
    //__________________________________________________________________________________

    for(let sc = 0;sc < 6;sc++){
        let buildinglisterparts = [];
        console.log('ALL_ENTITY_ROLES.KNOCKABLEDOWN1.ind', ALL_ENTITY_ROLES.KNOCKABLEDOWN1.ind);

        let colorationOfBuildings = [];
        let particleReorineter = null;
        
        if( sc === 0 ){
            colorationOfBuildings = [
                // base col
                {input:{r:79,g:110,b:201}, output:{r:103, g: 50, b: 118}},
                // roof
                {input:{r:90,g:123,b:220}, output:{r:170, g: 101, b: 190}},
                // sidearm
                {input:{r:61,g:97,b:206}, output:{r:40, g: 128, b: 78}},
            ];
            particleReorineter = (x,y,z) => {
                return {x: -z, y: y, z: x}
            } 
        }
        else if( sc === 1 ){
            colorationOfBuildings = [
                // base col
                {input:{r:79,g:110,b:201}, output:{r:139, g: 117, b: 29}},
                // roof
                {input:{r:90,g:123,b:220}, output:{r:143, g: 54, b: 24}},
                // sidearm
                {input:{r:61,g:97,b:206}, output:{r:147, g: 143, b: 21}},
            ];
            particleReorineter = (x,y,z) => {
                return {x: -z, y: y, z: -x}
            } 
        }
        else{
            
            colorationOfBuildings = [
                // base col
                {input:{r:79,g:110,b:201}, output:{r:Math.floor(256*EZWG.SHA1.random()), g: Math.floor(256*EZWG.SHA1.random()), b: Math.floor(256*EZWG.SHA1.random())}},
                // roof
                {input:{r:90,g:123,b:220}, output:{r:Math.floor(256*EZWG.SHA1.random()), g: Math.floor(256*EZWG.SHA1.random()), b: Math.floor(256*EZWG.SHA1.random())}},
                // sidearm
                {input:{r:61,g:97,b:206}, output:{r:Math.floor(256*EZWG.SHA1.random()), g: Math.floor(256*EZWG.SHA1.random()), b: Math.floor(256*EZWG.SHA1.random())}},
            ];

            // Switch up the niceiness
            if( sc %2===0){
                particleReorineter = (x,y,z) => {
                    return {x: -z, y: y, z: x}
                } 
            }
            else{
                particleReorineter = (x,y,z) => {
                    return {x: -z, y: y, z: -x}
                } 
            } 

        }
        
        //STAD["instance_seaweedf"] = 
        addVoxelModelApplyOrientersAndBindNearest(
            STAD.middleSpawnPointX + sc*5*STAD.bucks_pacing - 7*STAD.bucks_pacing ,
            0,//STAD.bucks_pacing*1,
            STAD.middleSpawnPointY + 17*STAD.bucks_pacing ,//EZWG.SHA1.random()*spany,
            buildinglisterparts, theseNewDbEntries, getVoxelModel("sphouse2"),
            STAD.largervoxeldensity, totalParticleIndexTracker,
            {
                debugrender: true,
                entityrole: ALL_ENTITY_ROLES.KNOCKABLEDOWN1,
                bindunits: 1.2,
                orientbind: 1.5,
                springpowermod: 1.0,
                allowedspringtypes: STAD.springAllowedTees,
                reserve_cpu_readbackspot: true,
                collision_orbs_mode: "bad",
                paintjobs: colorationOfBuildings,
                xyzmover: particleReorineter
            }
        );
        locationsOfTheseNewEntities = locationsOfTheseNewEntities.concat( buildinglisterparts );

    }

    
    //  ADD
    //      BIG TOUGH DOMICILES
    //          =================================================================================================
    //                          S T R O N G E R      D O M I C I L E S 
    //__________________________________________________________________________________

    for(let sc = 0;sc < 5;sc++){
        let buildinglisterparts = [];
        console.log('ALL_ENTITY_ROLES.STATICBIGBUILDING1.ind', ALL_ENTITY_ROLES.STATICBIGBUILDING1.ind);
        
        let particleReorineter = null;
        
        if( sc === 0 ){
            particleReorineter = (x,y,z) => {
                return {x: -z, y: y, z: x}
            };
        }
        
        //STAD["instance_seaweedf"] = 
        addVoxelModelApplyOrientersAndBindNearest(
            STAD.middleSpawnPointX + 11*STAD.bucks_pacing ,
            STAD.bucks_pacing*1,
            STAD.middleSpawnPointY + sc*5*STAD.bucks_pacing - 13*STAD.bucks_pacing ,//EZWG.SHA1.random()*spany,
            buildinglisterparts, theseNewDbEntries, getVoxelModel("sphouse3"),
            STAD.largervoxeldensity, totalParticleIndexTracker,
            {
                debugrender: true,
                entityrole: ALL_ENTITY_ROLES.STATICBIGBUILDING1,      
                bindunits: 3.5,                                 
                orientbind: 2.5,   
                springpowermod: 1.0,                             
                allowedspringtypes: STAD.springAllowedTees,     
                reserve_cpu_readbackspot: true,                 
                collision_orbs_mode: "bad",
                paintjobs:[
                    // // base col
                    // {input:{r:79,g:110,b:201}, output:{r:164, g: 124, b: 87}},
                    // // roof
                    // {input:{r:90,g:123,b:220}, output:{r:233, g: 123, b: 123}},
                    // // other part
                    // {input:{r:61,g:97,b:206}, output:{r:233, g: 123, b: 123}},
                    // base col
                    {input:{r:79,g:110,b:201}, output:{r:Math.floor(256*EZWG.SHA1.random()), g: Math.floor(256*EZWG.SHA1.random()), b: Math.floor(256*EZWG.SHA1.random())}},
                    // roof
                    {input:{r:90,g:123,b:220}, output:{r:Math.floor(256*EZWG.SHA1.random()), g: Math.floor(256*EZWG.SHA1.random()), b: Math.floor(256*EZWG.SHA1.random())}},
                    // other part
                    {input:{r:61,g:97,b:206}, output:{r:Math.floor(256*EZWG.SHA1.random()), g: Math.floor(256*EZWG.SHA1.random()), b: Math.floor(256*EZWG.SHA1.random())}},
                ],
                xyzmover: particleReorineter
            }
        );
        locationsOfTheseNewEntities = locationsOfTheseNewEntities.concat( buildinglisterparts );

    }

    //  ADD
    //      NICE LIGHTHOUSE
    //          =================================================================================================
    //                          S I N G U L A R   L I G H T H O U S E 
    //__________________________________________________________________________________
    let lighthouseparts = [];
    console.log('ALL_ENTITY_ROLES.STATICBIGBUILDING1.ind', ALL_ENTITY_ROLES.STATICBIGBUILDING1.ind);
     
     
    //STAD["instance_seaweedf"] = 
    addVoxelModelApplyOrientersAndBindNearest(
        STAD.middleSpawnPointX - 11*STAD.bucks_pacing ,
        STAD.bucks_pacing*1,
        STAD.middleSpawnPointY + 11*STAD.bucks_pacing ,//EZWG.SHA1.random()*spany,
        lighthouseparts, theseNewDbEntries, getVoxelModel("splighthouse1"),
        STAD.largervoxeldensity, totalParticleIndexTracker,
        {
            debugrender: true,
            entityrole: ALL_ENTITY_ROLES.STATICBIGBUILDING1,      
            bindunits: 4.0,                                 
            orientbind: 2.5,   
            springpowermod: 1.0,                             
            allowedspringtypes: STAD.springAllowedTees,     
            reserve_cpu_readbackspot: true,                 
            collision_orbs_mode: "bad",
            paintjobs:[
                // base col
                // {input:{r:79,g:110,b:201}, output:{r:164, g: 124, b: 87}},
                // // roof
                // {input:{r:90,g:123,b:220}, output:{r:233, g: 123, b: 123}},
            ],
            //xyzmover: particleReorineter
        }
    );
    locationsOfTheseNewEntities = locationsOfTheseNewEntities.concat( lighthouseparts );



    
    //  ADD
    //      RANDOM DECORATIONS AROUND
    //          =================================================================================================
    //                          R A N D O M    D E C O S  BOULDERS N PLUMBUS'
    //__________________________________________________________________________________

    for(let sc = 0;sc < 13;sc++){

        let spanx = STAD.spawnAreaLengthX*3;
        let spany = STAD.spawnAreaLengthY*3;
        
        let buildinglisterparts = [];
        console.log('ALL_ENTITY_ROLES.STATICBUILDING1.ind', ALL_ENTITY_ROLES.STATICBUILDING1.ind);

        let faunaListObjects = [
            "spplumbus1",
            "spboulder1"
        ];
        particularFaunaToUse = faunaListObjects[ Math.floor( EZWG.SHA1.random()*faunaListObjects.length ) ];
        
        //STAD["instance_seaweedf"] = 
        addVoxelModelApplyOrientersAndBindNearest(
            STAD.middleSpawnPointX - STAD.spawnAreaLengthX + EZWG.SHA1.random()*spanx ,
            STAD.bucks_pacing*1,//EZWG.SHA1.random()*STAD.BUCKET_PERIMETER*
            STAD.middleSpawnPointY - STAD.spawnAreaLengthY + EZWG.SHA1.random()*spany,
            buildinglisterparts, theseNewDbEntries, getVoxelModel("" + particularFaunaToUse),
            STAD.stdvoxeldensity, totalParticleIndexTracker,
            {
                debugrender: true,
                entityrole: ALL_ENTITY_ROLES.STATICBUILDING1,
                bindunits: 4.0,
                orientbind: 1.5,
                springpowermod: 1.0,
                allowedspringtypes: STAD.springAllowedTees,
                reserve_cpu_readbackspot: true,
                collision_orbs_mode: "bad",
                paintjobs:[
                    // base col
                    // {input:{r:79,g:110,b:201}, output:{r:164, g: 124, b: 87}},
                    // // roof
                    // {input:{r:90,g:123,b:220}, output:{r:233, g: 123, b: 123}},
                ]
            }
        );
        locationsOfTheseNewEntities = locationsOfTheseNewEntities.concat( buildinglisterparts );

    }


    
    
    //  ADD
    //      GROUND FAUNA
    //          =================================================================================================
    //                          H A R M L E S S    F L O A T      D E C O R 
    //__________________________________________________________________________________
    // let spanx = STAD.spawnAreaLengthX*2;
    // let spany = STAD.spawnAreaLengthY*2;
    for(let sc = 0;sc < 41;sc++){
        let trash_list = [];
        console.log('ALL_ENTITY_ROLES.DRIFTERTRASH1.ind', ALL_ENTITY_ROLES.DRIFTERTRASH1.ind)
        
        //STAD["instance_seaweedf"] = 
        addVoxelModelApplyOrientersAndBindNearest(
            // STAD.middleSpawnPointX - STAD.spawnAreaLengthX + EZWG.SHA1.random()*spanx ,
            // EZWG.SHA1.random()*STAD.BUCKET_PERIMETER*STAD.bucks_pacing*0.1,
            // STAD.middleSpawnPointY - STAD.spawnAreaLengthY + EZWG.SHA1.random()*spany,
            EZWG.SHA1.random()*STAD.oneSideLength ,
            EZWG.SHA1.random()*STAD.oneSideLength*0.24,
            EZWG.SHA1.random()*STAD.oneSideLength,
            trash_list, theseNewDbEntries, getVoxelModel(`${EZWG.SHA1.random()<0.5?'decorflower1':'decorflower2'}`),
            STAD.stdvoxeldensity, totalParticleIndexTracker,
            {
                debugrender: true,
                entityrole: ALL_ENTITY_ROLES.DRIFTERTRASH1,      
                bindunits: 3.0,                                 
                orientbind: 2.5,                                
                allowedspringtypes: STAD.springAllowedTees,     
                reserve_cpu_readbackspot: true,                 
                collision_orbs_mode: "bad"                      
            }
        );
        locationsOfTheseNewEntities = locationsOfTheseNewEntities.concat( trash_list );
    }


    for(let sc = 0;sc < 13;sc++){
        let new_jelly_fish_parts= [];
        
        console.log('ALL_ENTITY_ROLES.TRENDINGJELLYFISH1.ind', ALL_ENTITY_ROLES.TRENDINGJELLYFISH1.ind)
        addVoxelModelApplyOrientersAndBindNearest(
            //STAD.middleSpawnPointX + 2.0, 13.0, STAD.middleSpawnPointY + 8.0,
            EZWG.SHA1.random()*STAD.oneSideLength ,
            EZWG.SHA1.random()*STAD.oneSideLength*0.06,
            EZWG.SHA1.random()*STAD.oneSideLength,
            new_jelly_fish_parts, theseNewDbEntries, getVoxelModel("spjellyfish1"),
            STAD.stdvoxeldensity, totalParticleIndexTracker,
            {
                debugrender: true,
                entityrole: ALL_ENTITY_ROLES.TRENDINGJELLYFISH1,      
                bindunits: 3.0,                                 
                orientbind: 1.5,                                
                allowedspringtypes: STAD.springAllowedTees,     
                reserve_cpu_readbackspot: true,                 
                collision_orbs_mode: "bad"                      
            }
        );
        locationsOfTheseNewEntities = locationsOfTheseNewEntities.concat( new_jelly_fish_parts );

    }

    for(let sc = 0;sc < 8;sc++){
        
        let spanx = STAD.spawnAreaLengthX*3;
        let spany = STAD.spawnAreaLengthY*3;
        // BOAT TRICK GOIN ROUND
        let new_parts_boat_truck = [];
        console.log('ALL_ENTITY_ROLES.BOATTRUCKFREEROAM1.ind', ALL_ENTITY_ROLES.BOATTRUCKFREEROAM1.ind)
        addVoxelModelApplyOrientersAndBindNearest(
            //STAD.middleSpawnPointX - STAD.spawnAreaLengthX, 2.0, STAD.middleSpawnPointY + STAD.spawnAreaLengthY,
            
            STAD.middleSpawnPointX - STAD.spawnAreaLengthX + EZWG.SHA1.random()*spanx ,
            STAD.bucks_pacing*1,//EZWG.SHA1.random()*STAD.BUCKET_PERIMETER*
            STAD.middleSpawnPointY - STAD.spawnAreaLengthY + EZWG.SHA1.random()*spany,

            new_parts_boat_truck, theseNewDbEntries, getVoxelModel("spboatcar2"),
            STAD.stdvoxeldensity, totalParticleIndexTracker,
            {
                debugrender: true,
                entityrole: ALL_ENTITY_ROLES.BOATTRUCKFREEROAM1,   
                bindunits: 6.0,
                orientbind: 2.0,
                allowedspringtypes: STAD.springAllowedTees,
                reserve_cpu_readbackspot: true,  
                collision_orbs_mode: "bad",
                paintjobs:[
                    // Boat Rim
                    {input:{r:183,g:27,b:27}, output:{r:Math.floor(256*EZWG.SHA1.random()), g: Math.floor(256*EZWG.SHA1.random()), b: Math.floor(256*EZWG.SHA1.random())}},
                    // Driver Skin
                    {input:{r:90,g:222,b:148}, output:{r:Math.floor(256*EZWG.SHA1.random()), g: Math.floor(256*EZWG.SHA1.random()), b: Math.floor(256*EZWG.SHA1.random())}},
                    // Driver Shirt
                    {input:{r:90,g:184,b:222}, output:{r:Math.floor(256*EZWG.SHA1.random()), g: Math.floor(256*EZWG.SHA1.random()), b: Math.floor(256*EZWG.SHA1.random())}},
                    // Driver Eyes
                    {input:{r:21,g:32,b:26}, output:{r:Math.floor(256*EZWG.SHA1.random()), g: Math.floor(256*EZWG.SHA1.random()), b: Math.floor(256*EZWG.SHA1.random())}},
                ]
            }
        ); 
        locationsOfTheseNewEntities = locationsOfTheseNewEntities.concat( new_parts_boat_truck );

    }
        



    // This is the only pointer that gets fucked with so gotta 
    return locationsOfTheseNewEntities;


}



function startRogueLike( locationsOfTheseNewEntities, theseNewDbEntries, totalParticleIndexTracker, entity_role_templates, STAD ){


    var ALL_ENTITY_ROLES = {        
        CHILL1: { ind : -1 },       // Doesn't do anything 
        CTRLFISH1: {ind: -1},       

        OPPOSERFUSH1: {ind: -1},    

        DRIFTERTRASH1: {ind: -1},   // Drift and be nice 

    };

    
        
    var MAIN_PLAYER_RESERVED_PARTICLES = [
        
        {size: 150, t: 22}, // water-like mud that gets kicked up
        {size: 350, t: 15}, // magic particles for fish lasso
        //{size: 26, t: 15},   // KEEP it to 15 (water particles) BUT they're just never activated so it stays as 14 (but for the ent youre targeting)
        {size: 500, t: 19, smk: 21}    // add one MISSILE[0]. [1-199] smolk particles (being 21)
    ]


    // 2
    ALL_ENTITY_ROLES.CTRLFISH1 = 
        createNewEntityRoleInDatabase( entity_role_templates,
            {
                ind: entity_role_templates.length,  // index of the entity roles 
                top_pull: 0.0115 * 0.3,
                bottom_pull: -0.0115 * 0.3,
                target_id: "-none---",          // no target because you are being controlled by the player
                collide_with: 2,                // collide with bad
                forward_engine: 0.0122,          // how much forward thrust
                backward_engine: 0.0,          // how much pull back on the back for orienting
                grav_pull: 0.0,//0.00084,//..
                reserved_particles: MAIN_PLAYER_RESERVED_PARTICLES,          // reserved particle amount
                user_ctrl_scheme: 5,
                top_bottom_mass_ratio: 1.04,// multiply all the top forces by this to get even balanceer
                rotation_engine: 0.016, // turn force for left n right, and tilting up n down for left n right, and tilting up n down
                behaviour_type: 4,   
            }
        );



    ALL_ENTITY_ROLES.OPPOSERFUSH1 = 
        createNewEntityRoleInDatabase( entity_role_templates,
            {
                ind: entity_role_templates.length,  // index of the entity roles 
                top_pull: 0.0115 * 2,
                bottom_pull: -0.0115 * 2,
                target_id: "-nonen-",    // attribute of STAD that has the ID of a particle to follow 
                collide_with: 2,                // collide with good and bad (collide with both )
                forward_engine: 0.02,
                backward_engine: 0.01,
                grav_pull: 0,//0.00011,          
                reserved_particles: [],          // reserved particle amount
                user_ctrl_scheme: 5,
                top_bottom_mass_ratio: 1.3,// multiply all the top forces by this to get even balanceer
                rotation_engine: 0.01, // turn force for left n right, and tilting up n down
                behaviour_type: 4,   
            }
        );

        
    // 12
    ALL_ENTITY_ROLES.DRIFTERTRASH1 = 
        createNewEntityRoleInDatabase( entity_role_templates,
            {
                ind: entity_role_templates.length,  // index of the entity roles 
                top_pull: 0,
                bottom_pull: 0,
                target_id: "-none---",      // attribute of STAD that has the ID of a particle to follow (INSERTED AT THE END)
                collide_with: 2,            // both good and bad
                forward_engine: 0.02,       // how does the forward engine work
                backward_engine: 0.00,      // how much pull back on the back for orienting
                grav_pull: 0.0,             // how much gravity to apply to each
                reserved_particles: [],     // reserved particle amount
                user_ctrl_scheme: 1,         //1= truck mode (WASD forward/back)
                                        //2 = float mode (WASD flightstick/thrust)
                                        //3=helicopter movement
                                        //4=ufo
                                        //5=orient towards current selection
                top_bottom_mass_ratio: 1,// multiply all the top forces by this to get even balanceer
                rotation_engine: 0.01 // turn force for left n right, and tilting up n down
            }
        );

        


    var new_fish_parts = [];
    console.log('ALL_ENTITY_ROLES.CTRLFISH1.ind', ALL_ENTITY_ROLES.CTRLFISH1.ind)
    STAD.instance_urfish = addVoxelModelApplyOrientersAndBindNearest(
        STAD.middleSpawnPointX - 1.0, 8.0, STAD.middleSpawnPointY + 2.0,
        new_fish_parts, theseNewDbEntries, getVoxelModel("molamola2"),
        STAD.stdvoxeldensity, totalParticleIndexTracker,
        {
            debugrender: true,
            entityrole: ALL_ENTITY_ROLES.CTRLFISH1,      
            bindunits: 7.0,                                 
            orientbind: 2.5,                                
            allowedspringtypes: STAD.springAllowedTees,     
            reserve_cpu_readbackspot: true,                 
            collision_orbs_mode: "bad"                      
        }
    );
    locationsOfTheseNewEntities = locationsOfTheseNewEntities.concat( new_fish_parts );


    // HERE SET THE PLAYER TO THE IND YOURE CONTROLLING
    INTELLIGENTLY_CONTROLLED[ THIS_CLIENT_CONTROL_IND ].tealind = 
        STAD.instance_urfish.nucleus;



    
    var evil_fish_parts = [];
    console.log('ALL_ENTITY_ROLES.OPPOSERFUSH1.ind', ALL_ENTITY_ROLES.OPPOSERFUSH1.ind)
    STAD.instance_opposerfush = addVoxelModelApplyOrientersAndBindNearest(
        STAD.middleSpawnPointX + 8.0, 8.0, STAD.middleSpawnPointY + 2.0,
        evil_fish_parts, theseNewDbEntries, getVoxelModel("molamola2"),
        STAD.stdvoxeldensity, totalParticleIndexTracker,
        {
            debugrender: true,
            entityrole: ALL_ENTITY_ROLES.OPPOSERFUSH1,      
            bindunits: 7.0,                                 
            orientbind: 2.5,                                
            allowedspringtypes: STAD.springAllowedTees,     
            reserve_cpu_readbackspot: true,                 
            collision_orbs_mode: "bad"                      
        }
    );
    locationsOfTheseNewEntities = locationsOfTheseNewEntities.concat( evil_fish_parts );



    //  ADD
    //      GROUND FAUNA
    //          =================================================================================================
    //                          H A R M L E S S    F L O A T      D E C O R 
    //__________________________________________________________________________________
    // let spanx = STAD.spawnAreaLengthX*2;
    // let spany = STAD.spawnAreaLengthY*2;
    for(let sc = 0;sc < 45;sc++){
        let trash_list = [];
        console.log('ALL_ENTITY_ROLES.DRIFTERTRASH1.ind', ALL_ENTITY_ROLES.DRIFTERTRASH1.ind)
        
        //STAD["instance_seaweedf"] = 
        addVoxelModelApplyOrientersAndBindNearest(
            // STAD.middleSpawnPointX - STAD.spawnAreaLengthX + EZWG.SHA1.random()*spanx ,
            // EZWG.SHA1.random()*STAD.BUCKET_PERIMETER*STAD.bucks_pacing*0.1,
            // STAD.middleSpawnPointY - STAD.spawnAreaLengthY + EZWG.SHA1.random()*spany,
            EZWG.SHA1.random()*STAD.oneSideLength ,
            EZWG.SHA1.random()*STAD.oneSideLength*0.24,
            EZWG.SHA1.random()*STAD.oneSideLength,
            trash_list, theseNewDbEntries, getVoxelModel(`${EZWG.SHA1.random()<0.5?'decorflower1':'decorflower2'}`),
            STAD.stdvoxeldensity, totalParticleIndexTracker,
            {
                debugrender: true,
                entityrole: ALL_ENTITY_ROLES.DRIFTERTRASH1,      
                bindunits: 3.0,                                 
                orientbind: 1.5,                                
                allowedspringtypes: STAD.springAllowedTees,     
                reserve_cpu_readbackspot: true,                 
                collision_orbs_mode: "bad"                      
            }
        );
        locationsOfTheseNewEntities = locationsOfTheseNewEntities.concat( trash_list );
    }
    



    // This is the only pointer that gets fucked with so gotta 
    return locationsOfTheseNewEntities;


}




function SS_titleScreenSetter( locationsOfTheseNewEntities, theseNewDbEntries, totalParticleIndexTracker, entity_role_templates, STAD ){


    


    var ALL_ENTITY_ROLES = {
        CHILL1: { ind : -1 },       // Doesn't do anything
        CAR1: { ind : -1 },
        CTRLFISH1: { ind : -1 },    // Fish point one
        MASTERHAND1: { ind : -1 },  // Main guy 
        TRUCKBEACHBOY1: { ind : -1 },
        TRUCKFREEROAM1: { ind : -1 },
        PLECKO1: { ind : -1 },
        TRENDINGFISH1:{ ind : -1 },     // Head of da feesh
        PLAYFULFISH1:{ ind : -1 }, 
        PLAYFULFISH2:{ ind : -1 },  
        SEAWEED1:{ ind : -1 },
        MANTARAY1:{ ind : -1 },
        STARDESTROYER1:{ ind : -1 },
        THUNDERCLOUD1:{ ind : -1 },
        DRIFT1:{ ind : -1 },        // Sea urchin bomb 1
        DRIFT_BEACHBALL1:{ ind : -1 },        // Beachballl driftin around

        MOLAMOLA1: {ind: -1},       //molaa!!

        HOMERHEAD1: {ind: -1},

        MODEL_HEART1: { ind : -1 },     // model heart

        MEGAEYE1: {ind: -1} // dabeeg eye
    }

    


    // 0
    ALL_ENTITY_ROLES.CHILL1 = 
        createNewEntityRoleInDatabase( entity_role_templates,
            {
                ind: entity_role_templates.length,  // index of the entity roles 
                top_pull: 0,
                bottom_pull: 0,
                target_id: "-none---",      // attribute of STAD that has the ID of a particle to follow (INSERTED AT THE END)
                collide_with: 2,            //0 = coolide with good 
                                            // 1= colllide with bad
                                            // 2 = collide with all except own collision balls with your teal m3 
                                            //      value (the +1 ind of the teal particle for that entity)
                                            // 3 = ????
                forward_engine: 0.02,       // how does the forward engine work
                backward_engine: 0.00,      // how much pull back on the back for orienting
                grav_pull: 0.00061,         // how much gravity to apply to each
                reserved_particles: [],     // reserved particle amount
                user_ctrl_scheme: 1,         //1= truck mode (WASD forward/back)
                                    //2 = float mode (WASD flightstick/thrust)
                                    //3 = float mode (WASD flightstick/thrust) ( and WIGGLE for boost )
                                    //4 = master hand ufo movement
                                    //5 = ufo
                                    // ( THIS VALUE used by ai controlled to 
                                    //      determine how to move the thing)
                top_bottom_mass_ratio: 1,// multiply all the top forces by this to get even balanceer
                rotation_engine: 0.01, // turn force for left n right, and tilting up n down

                behaviour_type: 0,   // 0 = do not move ( ONLY APPLIES IF AI)
                                    // 1 = move towards your target_id ( ONLY APPLIES IF AI)
                                    // 2 = do a long distnace attack ( ONLY APPLIES IF AI)
                                    // 3 = go to random location on the ground (ONLY APPLIES IF AI)
                max_sight_range: 64.0,        // # = max radius to ntoice the teal particle of ur target_id entity( ONLY APPLIES IF AI)
                                    // *STAD.bucks_pacing   ?
                idle_activity: 0,          // 0 = do nothing when ur target is not in sight( ONLY APPLIES IF AI)
                                           // 1 = ????
                max_attack_range: 64.0     // # = max radius to do an attack on ur target id
                    // ??/?

                
            }
        );
    




    // 1
    ALL_ENTITY_ROLES.CAR1 = 
        createNewEntityRoleInDatabase( entity_role_templates,
            {
                ind: entity_role_templates.length,  // index of the entity roles 
                top_pull: 0.0115 * 2,
                bottom_pull: -0.0115 * 3,
                target_id: "-none---",          // no target because you are being controlled by the player
                collide_with: 2,                // collide with both
                forward_engine: 0.005,
                backward_engine: 0.02,          // how much pull back on the back for orienting
                grav_pull: 0.00064,
                reserved_particles: [
                    {size: 200, t: 15}, // water-like mud that gets kicked up
                    {size: 32, t: 15}   // KEEP it to 15 (water particles) BUT they're just never activated so it stays as 14
                ],          // reserved particle amount
                user_ctrl_scheme: 1,
                top_bottom_mass_ratio: 1,// multiply all the top forces by this to get even balanceer
                rotation_engine: 0.01, // turn force for left n right, and tilting up n down
                behaviour_type: 0,   
                max_sight_range: 64.0,        // # = max radius to ntoice the teal particle of ur target_id entity( ONLY APPLIES IF AI)
                                    // *STAD.bucks_pacing   ?
                idle_activity: 0,          // 0 = do nothing when ur target is not in sight( ONLY APPLIES IF AI)
                                           // 1 = ????
                max_attack_range: 64.0     // # = max radius to do an attack on ur target id
            }
        );

    var MAIN_PLAYER_RESERVED_PARTICLES = [
        
        {size: 150, t: 22}, // water-like mud that gets kicked up
        {size: 350, t: 15}, // magic particles for fish lasso
        //{size: 26, t: 15},   // KEEP it to 15 (water particles) BUT they're just never activated so it stays as 14 (but for the ent youre targeting)
        {size: 500, t: 19, smk: 21}    // add one MISSILE[0]. [1-199] smolk particles (being 21)
    ]


    // 2
    ALL_ENTITY_ROLES.CTRLFISH1 = 
        createNewEntityRoleInDatabase( entity_role_templates,
            {
                ind: entity_role_templates.length,  // index of the entity roles 
                top_pull: 0.0115 * 0.3,
                bottom_pull: -0.0115 * 0.3,
                target_id: "-none---",          // no target because you are being controlled by the player
                collide_with: 2,                // collide with bad
                forward_engine: 0.0122,          // how much forward thrust
                backward_engine: 0.0,          // how much pull back on the back for orienting
                grav_pull: 0.0,//0.00084,//..
                reserved_particles: MAIN_PLAYER_RESERVED_PARTICLES,          // reserved particle amount
                user_ctrl_scheme: 1,
                top_bottom_mass_ratio: 1.04,// multiply all the top forces by this to get even balanceer
                rotation_engine: 0.016, // turn force for left n right, and tilting up n down for left n right, and tilting up n down
                behaviour_type: 0,   
            }
        );

        
    // 2
    ALL_ENTITY_ROLES.MASTERHAND1 = 
        createNewEntityRoleInDatabase( entity_role_templates,
            {
                ind: entity_role_templates.length,  // index of the entity roles 
                top_pull: 0.0115 * 2.4,
                bottom_pull: -0.0115 * 2.2,
                target_id: "-none---",          // no target because you are being controlled by the player
                collide_with: 2,                // collide with bith
                forward_engine: 0.002,          // how much forward thrust
                backward_engine: 0.0,          // how much pull back on the back for orienting
                grav_pull: 0.0,//0.00084,//..
                reserved_particles: MAIN_PLAYER_RESERVED_PARTICLES,          // reserved particle amount
                user_ctrl_scheme: 4,
                top_bottom_mass_ratio: 1.0,// multiply all the top forces by this to get even balanceer
                rotation_engine: 0.1, // turn force for left n right, and tilting up n down for left n right, and tilting up n down
                behaviour_type: 0,   
            }
        );



    // 4 Evil Car runin u over role, stock target at certain elevation
    ALL_ENTITY_ROLES.TRUCKBEACHBOY1 = 
        createNewEntityRoleInDatabase( entity_role_templates,
            {
                ind: entity_role_templates.length,  // index of the entity roles 
                top_pull: 0.0115 * 1.21,
                bottom_pull: -0.0115 * 0.65,
                target_id: "instance_beachball1",    // attribute of STAD that has the ID of a particle to follow 
                collide_with: 2,                // collide with both 
                forward_engine: 0.016,
                backward_engine: 0.007,       // how much pull back on the back for orienting
                grav_pull: 0.0007,          
                reserved_particles: [],          // reserved particle amount
                user_ctrl_scheme: 1,
                top_bottom_mass_ratio: 1,// multiply all the top forces by this to get even balanceer
                rotation_engine: 0.01, // turn force for left n right, and tilting up n down
                behaviour_type: 1,   
            }
        );


    ALL_ENTITY_ROLES.TRUCKFREEROAM1 = 
        createNewEntityRoleInDatabase( entity_role_templates,
            {
                ind: entity_role_templates.length,  // index of the entity roles 
                top_pull: 0.0115 * 1.21,
                bottom_pull: -0.0115 * 0.65,
                target_id: "-none---",    // attribute of STAD that has the ID of a particle to follow 
                collide_with: 2,                // collide with both 
                forward_engine: 0.016,
                backward_engine: 0.007,       // how much pull back on the back for orienting
                grav_pull: 0.0007,          
                reserved_particles: [],          // reserved particle amount
                user_ctrl_scheme: 1,
                top_bottom_mass_ratio: 1,// multiply all the top forces by this to get even balanceer
                rotation_engine: 0.01, // turn force for left n right, and tilting up n down
                behaviour_type: 3,   
            }
        );
        
        



    // 5
    ALL_ENTITY_ROLES.PLECKO1 = 
        createNewEntityRoleInDatabase( entity_role_templates,
            {
                ind: entity_role_templates.length,  // index of the entity roles 
                top_pull: 0.0115 * 1,
                bottom_pull: -0.0115 * 2,
                target_id: "-nonen-",   // attribute of STAD that has the ID of a particle to follow 
                collide_with: 2,                // collide with both 
                forward_engine: 0.005,
                backward_engine: 0.004,
                grav_pull: 0.00011,          
                reserved_particles: [],          // reserved particle amount
                user_ctrl_scheme: 1,
                top_bottom_mass_ratio: 1,// multiply all the top forces by this to get even balanceer
                rotation_engine: 0.01, // turn force for left n right, and tilting up n down
                behaviour_type: 3,   
            }
        );
    


    // 6
    ALL_ENTITY_ROLES.TRENDINGFISH1 = 
        createNewEntityRoleInDatabase( entity_role_templates,
            {
                ind: entity_role_templates.length,  // index of the entity roles 
                top_pull: 0.0115 * 0.05,
                bottom_pull: -0.0115 * 0.05,
                target_id: "-nonen-",    // attribute of STAD that has the ID of a particle to follow 
                collide_with: 2,                // collide with good and bad (collide with both )
                forward_engine: 0.003,
                backward_engine: 0.001,
                grav_pull: 0,//0.00011,          
                reserved_particles: [],          // reserved particle amount
                user_ctrl_scheme: 2,
                top_bottom_mass_ratio: 1.3,// multiply all the top forces by this to get even balanceer
                rotation_engine: 0.01, // turn force for left n right, and tilting up n down
                behaviour_type: 2,   
            }
        );
        
    // 6
    ALL_ENTITY_ROLES.PLAYFULFISH1 = 
        createNewEntityRoleInDatabase( entity_role_templates,
            {
                ind: entity_role_templates.length,  // index of the entity roles 
                top_pull: 0.0115 * 0.05,
                bottom_pull: -0.0115 * 0.05,
                target_id: "instance_plecko1", // attribute of STAD that has the ID of a particle to follow 
                collide_with: 2,                // collide with good and bad (collide with both )
                forward_engine: 0.0024,
                backward_engine: 0.001,
                grav_pull: 0,//0.00011,          
                reserved_particles: [],          // reserved particle amount
                user_ctrl_scheme: 2,
                top_bottom_mass_ratio: 1.1,// multiply all the top forces by this to get even balanceer
                rotation_engine: 0.01, // turn force for left n right, and tilting up n down
                behaviour_type: 1,  
            }
        );
        
    // 6
    ALL_ENTITY_ROLES.PLAYFULFISH2 = 
        createNewEntityRoleInDatabase( entity_role_templates,
            {
                ind: entity_role_templates.length,  // index of the entity roles 
                top_pull: 0.0115 * 0.05,
                bottom_pull: -0.0115 * 0.05,
                target_id: "instance_playfulfish1", // attribute of STAD that has the ID of a particle to follow 
                collide_with: 2,                // collide with good and bad (collide with both )
                forward_engine: 0.0024,
                backward_engine: 0.001,
                grav_pull: 0,//0.00011,          
                reserved_particles: [],          // reserved particle amount
                user_ctrl_scheme: 2,
                top_bottom_mass_ratio: 1.1,// multiply all the top forces by this to get even balanceer
                rotation_engine: 0.01, // turn force for left n right, and tilting up n down
                behaviour_type: 1,  
            }
        );
    
    // 7
    ALL_ENTITY_ROLES.SEAWEED1 = 
        createNewEntityRoleInDatabase( entity_role_templates,
            {
                ind: entity_role_templates.length,  // index of the entity roles 
                top_pull: 0.0115 * 1.2,
                bottom_pull: -0.0115 * 1.8,
                target_id: "-nonen-",    // attribute of STAD that has the ID of a particle to follow 
                collide_with: 2,                // collide with good 
                forward_engine: 0.0,
                backward_engine: 0.0,
                grav_pull: 0.00024,          
                reserved_particles: [],          // reserved particle amount
                user_ctrl_scheme: 1,
                top_bottom_mass_ratio: 1,// multiply all the top forces by this to get even balanceer
                rotation_engine: 0.01, // turn force for left n right, and tilting up n down
                behaviour_type: 0,   
            }
        );

    ALL_ENTITY_ROLES.MODEL_HEART1 = 
        createNewEntityRoleInDatabase( entity_role_templates,
            {
                ind: entity_role_templates.length,  // index of the entity roles 
                top_pull: 0.0115 * 0.2,
                bottom_pull: -0.0115 * 0.1,
                target_id: "-nonen-",    // attribute of STAD that has the ID of a particle to follow 
                collide_with: 2,                // collide with good 
                forward_engine: 0.0,
                backward_engine: 0.0,
                grav_pull: -0.00024,          
                reserved_particles: [],          // reserved particle amount
                user_ctrl_scheme: 1,
                top_bottom_mass_ratio: 1,// multiply all the top forces by this to get even balanceer
                rotation_engine: 0.01, // turn force for left n right, and tilting up n down
                behaviour_type: 0,   
            }
        );
        
    // 8 Lakitu role, stock target at certain elevation
    ALL_ENTITY_ROLES.MANTARAY1 = 
        createNewEntityRoleInDatabase( entity_role_templates,
            {
                ind: entity_role_templates.length,  // index of the entity roles 
                top_pull: 0.0115 * 0.021,
                bottom_pull: -0.0115 * 0.015,
                target_id: "instance_urfish",    // attribute of STAD that has the ID of a particle to follow 
                collide_with: 0,                // collide with good
                forward_engine: 0.0032,
                backward_engine: 0.0015,       // how much pull back on the back for orienting
                grav_pull: 0.00011,          
                reserved_particles: [
                    {size: 200, t: 22}, // bubbles that get produced and lfoat UPWARDS
                ],          // reserved particle amount
                user_ctrl_scheme: 2,
                top_bottom_mass_ratio: 1,// multiply all the top forces by this to get even balanceer
                rotation_engine: 0.01, // turn force for left n right, and tilting up n down
                behaviour_type: 1,   
            }
        );

        
    // 9 Star destroyer
    ALL_ENTITY_ROLES.STARDESTROYER1 = 
        createNewEntityRoleInDatabase( entity_role_templates,
            {
                ind: entity_role_templates.length,  // index of the entity roles 
                top_pull: 0.0115 * 0.15,
                bottom_pull: -0.0115 * 0.11,
                target_id: "-none---",//"instance_beachball1",    // attribute of STAD that has the ID of a particle to follow 
                collide_with: 0,                // collide with good
                forward_engine: 0.0042,
                backward_engine: 0.0015,       // how much pull back on the back for orienting
                grav_pull: 0.00021,          
                reserved_particles: [],          // reserved particle amount
                user_ctrl_scheme: 2,
                top_bottom_mass_ratio: 1,// multiply all the top forces by this to get even balanceer
                rotation_engine: 0.01, // turn force for left n right, and tilting up n down
                behaviour_type: 3,   
            }
        );

        
        
    // 10 Thunder cloud
    ALL_ENTITY_ROLES.THUNDERCLOUD1 = 
        createNewEntityRoleInDatabase( entity_role_templates,
            {
                ind: entity_role_templates.length,  // index of the entity roles 
                top_pull: 0.0115 * 0.21,
                bottom_pull: -0.0115 * 0.21,
                target_id: "instance_urfish",    // attribute of STAD that has the ID of a particle to follow 
                collide_with: 0,                // collide with good
                forward_engine: 0.0082,
                backward_engine: 0.0015,       // how much pull back on the back for orienting
                grav_pull: 0.0,          
                reserved_particles: [
                    {size: 1200, t: 15}  // all the particles start off as t:14, this 't' determines what kind it transforms into 
                ],
                user_ctrl_scheme: 2,
                top_bottom_mass_ratio: 1,// multiply all the top forces by this to get even balanceer
                rotation_engine: 0.01, // turn force for left n right, and tilting up n down
                behaviour_type: 2, 
            }
        );
        
        
    ALL_ENTITY_ROLES.MEGAEYE1 = 
        createNewEntityRoleInDatabase( entity_role_templates,
            {
                ind: entity_role_templates.length,  // index of the entity roles 
                top_pull: 0,//0.0115 * 0.011,
                bottom_pull: 0,//-0.0115 * 0.011,
                target_id: "-none---",    // attribute of STAD that has the ID of a particle to follow 
                collide_with: 2,                // collide with good
                forward_engine: 0.0082,
                backward_engine: 0.0035,       // how much pull back on the back for orienting
                grav_pull: 0.0,          
                reserved_particles: [
                    {size: 150, t: 22}, // normal decayer releaser from the eyeball
                    {size: 500, t: 20, smk: 21}  // all the particles start off as t:14, this 't' determines what kind it transforms into 
                ],
                user_ctrl_scheme: 2,
                top_bottom_mass_ratio: 1,// multiply all the top forces by this to get even balanceer
                rotation_engine: 0.052, // turn force for left n right, and tilting up n down
                behaviour_type: 5,  // orbital bombarder at the top
            }
        );

    // 12
    ALL_ENTITY_ROLES.DRIFT1 = 
        createNewEntityRoleInDatabase( entity_role_templates,
            {
                ind: entity_role_templates.length,  // index of the entity roles 
                top_pull: 0,
                bottom_pull: 0,
                target_id: "-none---",      // attribute of STAD that has the ID of a particle to follow (INSERTED AT THE END)
                collide_with: 2,            // both good and bad
                forward_engine: 0.02,       // how does the forward engine work
                backward_engine: 0.00,      // how much pull back on the back for orienting
                grav_pull: 0.0,             // how much gravity to apply to each
                reserved_particles: [],     // reserved particle amount
                user_ctrl_scheme: 1,         //1= truck mode (WASD forward/back)
                                        //2 = float mode (WASD flightstick/thrust)
                                        //3=helicopter movement
                                        //4=ufo
                top_bottom_mass_ratio: 1,// multiply all the top forces by this to get even balanceer
                rotation_engine: 0.01 // turn force for left n right, and tilting up n down
            }
        );

        
    // 13
    ALL_ENTITY_ROLES.DRIFT_BEACHBALL1 = 
        createNewEntityRoleInDatabase( entity_role_templates,
            {
                ind: entity_role_templates.length,  // index of the entity roles 
                top_pull: 0,//0.0115 * 0.05,
                bottom_pull: 0,//-0.0115 * 0.05,
                target_id: "-none---",      // attribute of STAD that has the ID of a particle to follow (INSERTED AT THE END)
                collide_with: 2,            // both good and bad
                forward_engine: 0.018,       // how does the forward engine work
                backward_engine: 0.012,      // how much pull back on the back for orienting
                grav_pull: 0.0005,             // how much gravity to apply to each
                reserved_particles: [],     // reserved particle amount
                user_ctrl_scheme: 1,         //1= truck mode (WASD forward/back)
                                        //2 = float mode (WASD flightstick/thrust)
                                        //3=helicopter movement
                                        //4=ufo
                top_bottom_mass_ratio: 1,// multiply all the top forces by this to get even balanceer
                rotation_engine: 0.01, // turn force for left n right, and tilting up n down
                behaviour_type: 3,   // 0 = do not move ( ONLY APPLIES IF AI)
                                    // 1 = move towards your target_id ( ONLY APPLIES IF AI)
                                    // 2 = go to random location for movement( ONLY APPLIES IF AI)
                                    // 3 = go to random location on the ground (ONLY APPLIES IF AI)
            }
        );
 
    ALL_ENTITY_ROLES.MOLAMOLA1 = 
        createNewEntityRoleInDatabase( entity_role_templates,
            {
                ind: entity_role_templates.length,  // index of the entity roles 
                top_pull: 0.0115 * 2,
                bottom_pull: -0.0115 * 2,
                target_id: "-nonen-",    // attribute of STAD that has the ID of a particle to follow 
                collide_with: 2,                // collide with good and bad (collide with both )
                forward_engine: 0.02,
                backward_engine: 0.01,
                grav_pull: 0,//0.00011,          
                reserved_particles: [],          // reserved particle amount
                user_ctrl_scheme: 2,
                top_bottom_mass_ratio: 1.3,// multiply all the top forces by this to get even balanceer
                rotation_engine: 0.01, // turn force for left n right, and tilting up n down
                behaviour_type: 2,   
            }
        );

    ALL_ENTITY_ROLES.HOMERHEAD1 = 
        createNewEntityRoleInDatabase( entity_role_templates,
            {
                ind: entity_role_templates.length,  // index of the entity roles 
                top_pull: 0.0115 * 2,
                bottom_pull: -0.0115 * 2,
                target_id: "-nonen-",    // attribute of STAD that has the ID of a particle to follow 
                collide_with: 2,                // collide with good and bad (collide with both )
                forward_engine: 0.01,
                backward_engine: 0.007,
                grav_pull: 0,//0.00011,          
                reserved_particles: [],          // reserved particle amount
                user_ctrl_scheme: 2,
                top_bottom_mass_ratio: 1.3,// multiply all the top forces by this to get even balanceer
                rotation_engine: 0.01, // turn force for left n right, and tilting up n down
                behaviour_type: 2,   
            }
        );


    
    



    // var new_parts_for_main_guy = [];
    // console.log('ALL_ENTITY_ROLES.MASTERHAND1.ind', ALL_ENTITY_ROLES.MASTERHAND1.ind);
    // STAD.instance_urfish = addVoxelModelApplyOrientersAndBindNearest(
    //     STAD.middleSpawnPointX, 6.0, middleSpawnPointY,
    //     new_parts_for_main_guy, theseNewDbEntries, getVoxelModel( "primordialhand5" ),// ( "lilfish1" ) ( "lilfish2"), "lilminnow1""biggertruck
    //     STAD.stdvoxeldensity, totalParticleIndexTracker,
    //     {
    //         debugrender: true,
    //         entityrole: ALL_ENTITY_ROLES.MASTERHAND1,        
    //         bindunits: 7.0,       //multiply factor of spacing for spring connection
    //         orientbind: 2.1,      //multiply factor for orienting control cataloguing
    //         allowedspringtypes: STAD.springAllowedTees,
    //         reserve_cpu_readbackspot: true,  // if true, reserve a spot in the scratch pad
    //         collision_orbs_mode: "good",     // all collisino orbs (t=5, r=255,g=120,b=120) which side do they go on.
    //         paintjobs:[
    //             // Thumb
    //             {input:{r:238,g:211,b:21}, output:{r:14, g: 215, b: 3}},
    //             // Index
    //             {input:{r:240,g:213,b:20}, output:{r:215, g: 17, b: 17}},
    //             // Middle
    //             {input:{r:239,g:213,b:27}, output:{r:14, g: 34, b: 234}},
    //             // Ring
    //             {input:{r:239,g:214,b:40}, output:{r:244, g: 127, b: 23}},
    //         ]
    //     }
    // );
    // locationsOfTheseNewEntities = locationsOfTheseNewEntities.concat( new_parts_for_main_guy );


    var new_parts_for_main_guy = [];
    console.log('ALL_ENTITY_ROLES.CTRLFISH1.ind', ALL_ENTITY_ROLES.CTRLFISH1.ind);
    
    STAD.instance_urfish = addVoxelModelApplyOrientersAndBindNearest(
        STAD.middleSpawnPointX, 6.0, STAD.middleSpawnPointY,
        new_parts_for_main_guy, theseNewDbEntries, getVoxelModel( "lilfish1" ),// ( "lilfish1" ) ( "lilfish2"), "lilminnow1""biggertruck
        STAD.stdvoxeldensity, totalParticleIndexTracker,
        {
            debugrender: true,
            entityrole: ALL_ENTITY_ROLES.CTRLFISH1,        
            bindunits: 6.0,       //multiply factor of spacing for spring connection
            orientbind: 1.5,      //multiply factor for orienting control cataloguing
            allowedspringtypes: STAD.springAllowedTees,
            reserve_cpu_readbackspot: true,  // if true, reserve a spot in the scratch pad
            collision_orbs_mode: "good",     // all collisino orbs (t=5, r=255,g=120,b=120) which side do they go on.

        }
    );
    locationsOfTheseNewEntities = locationsOfTheseNewEntities.concat( new_parts_for_main_guy );


 
 
 


 

    
    var newParts_For_A_Blimp = [];
    console.log('ALL_ENTITY_ROLES.PLECKO1.ind', ALL_ENTITY_ROLES.PLECKO1.ind);
    STAD.instance_plecko1 = addVoxelModelApplyOrientersAndBindNearest(
        STAD.middleSpawnPointX-6.0, 15.0, STAD.middleSpawnPointY + 6.0,
        newParts_For_A_Blimp, theseNewDbEntries, getVoxelModel( "lilplecko1"),
        STAD.stdvoxeldensity, totalParticleIndexTracker,
        {
            debugrender: true,
            entityrole: ALL_ENTITY_ROLES.PLECKO1,     
            bindunits: 5.0,                                 
            orientbind: 2.5,                                
            allowedspringtypes: STAD.springAllowedTees,     
            reserve_cpu_readbackspot: true,                 
            collision_orbs_mode: "bad"                      
        }
    );
    locationsOfTheseNewEntities = locationsOfTheseNewEntities.concat( newParts_For_A_Blimp );

















    //  ADD
    //      TREND SETTER FISH
    //          =================================================================================================
    //                          A L P H A   T R E N D    S E T T E R    F I S H
    //__________________________________________________________________________________
    
    var new_fish_parts = [];


    
    // console.log('ALL_ENTITY_ROLES.MOLAMOLA1.ind', ALL_ENTITY_ROLES.MOLAMOLA1.ind)
    // addVoxelModelApplyOrientersAndBindNearest(
    //     STAD.middleSpawnPointX - 17.0, 8.0, STAD.middleSpawnPointY + 2.0,
    //     new_fish_parts, theseNewDbEntries, getVoxelModel("molamola2"),
    //     STAD.stdvoxeldensity, totalParticleIndexTracker,
    //     {
    //         debugrender: true,
    //         entityrole: ALL_ENTITY_ROLES.MOLAMOLA1,      
    //         bindunits: 7.0,                                 
    //         orientbind: 2.5,                                
    //         allowedspringtypes: STAD.springAllowedTees,     
    //         reserve_cpu_readbackspot: true,                 
    //         collision_orbs_mode: "bad"                      
    //     }
    // );
    // locationsOfTheseNewEntities = locationsOfTheseNewEntities.concat( new_fish_parts );

    
    
    // console.log('ALL_ENTITY_ROLES.HOMERHEAD1.ind', ALL_ENTITY_ROLES.HOMERHEAD1.ind)
    // addVoxelModelApplyOrientersAndBindNearest(
    //     STAD.middleSpawnPointX - 17.0, 8.0, STAD.middleSpawnPointY + 2.0,
    //     new_fish_parts, theseNewDbEntries, getVoxelModel("homerhead1"),
    //     STAD.stdvoxeldensity, totalParticleIndexTracker,
    //     {
    //         debugrender: true,
    //         entityrole: ALL_ENTITY_ROLES.HOMERHEAD1,      
    //         bindunits: 5.0,                                 
    //         orientbind: 2.5,                                
    //         allowedspringtypes: STAD.springAllowedTees,     
    //         reserve_cpu_readbackspot: true,                 
    //         collision_orbs_mode: "bad"                      
    //     }
    // );
    // locationsOfTheseNewEntities = locationsOfTheseNewEntities.concat( new_fish_parts );


    new_fish_parts = [];
    console.log('ALL_ENTITY_ROLES.TRENDINGFISH1.ind', ALL_ENTITY_ROLES.TRENDINGFISH1.ind)
    addVoxelModelApplyOrientersAndBindNearest(
        STAD.middleSpawnPointX - 7.0, 15.0, STAD.middleSpawnPointY + 8.0,
        new_fish_parts, theseNewDbEntries, getVoxelModel("lilminnow1"),
        STAD.stdvoxeldensity, totalParticleIndexTracker,
        {
            debugrender: true,
            entityrole: ALL_ENTITY_ROLES.TRENDINGFISH1,      
            bindunits: 6.0,                                 
            orientbind: 2.5,                                
            allowedspringtypes: STAD.springAllowedTees,     
            reserve_cpu_readbackspot: true,                 
            collision_orbs_mode: "bad"                      
        }
    );
    locationsOfTheseNewEntities = locationsOfTheseNewEntities.concat( new_fish_parts );



    new_fish_parts= [];
    addVoxelModelApplyOrientersAndBindNearest(
        STAD.middleSpawnPointX - 2.0, 12.0, STAD.middleSpawnPointY + 8.0,
        new_fish_parts, theseNewDbEntries, getVoxelModel("lilminnow2"),
        STAD.stdvoxeldensity, totalParticleIndexTracker,
        {
            debugrender: true,
            entityrole: ALL_ENTITY_ROLES.TRENDINGFISH1,      
            bindunits: 6.0,                                 
            orientbind: 2.5,                                
            allowedspringtypes: STAD.springAllowedTees,     
            reserve_cpu_readbackspot: true,                 
            collision_orbs_mode: "bad"                      
        }
    );
    locationsOfTheseNewEntities = locationsOfTheseNewEntities.concat( new_fish_parts );

    new_fish_parts= [];
    addVoxelModelApplyOrientersAndBindNearest(
        STAD.middleSpawnPointX + 2.0, 13.0, STAD.middleSpawnPointY + 8.0,
        new_fish_parts, theseNewDbEntries, getVoxelModel("lilminnow3"),
        STAD.stdvoxeldensity, totalParticleIndexTracker,
        {
            debugrender: true,
            entityrole: ALL_ENTITY_ROLES.TRENDINGFISH1,      
            bindunits: 6.0,                                 
            orientbind: 2.5,                                
            allowedspringtypes: STAD.springAllowedTees,     
            reserve_cpu_readbackspot: true,                 
            collision_orbs_mode: "bad"                      
        }
    );
    locationsOfTheseNewEntities = locationsOfTheseNewEntities.concat( new_fish_parts );
    

    new_fish_parts= [];
    addVoxelModelApplyOrientersAndBindNearest(
        STAD.middleSpawnPointX + 7.0, 8.0, STAD.middleSpawnPointY + 8.0,
        new_fish_parts, theseNewDbEntries, getVoxelModel("lilminnow4"),
        STAD.stdvoxeldensity, totalParticleIndexTracker,
        {
            debugrender: true,
            entityrole: ALL_ENTITY_ROLES.TRENDINGFISH1,      
            bindunits: 6.0,                                 
            orientbind: 2.5,                                
            allowedspringtypes: STAD.springAllowedTees,     
            reserve_cpu_readbackspot: true,                 
            collision_orbs_mode: "bad"                      
        }
    );
    locationsOfTheseNewEntities = locationsOfTheseNewEntities.concat( new_fish_parts );
    
    new_fish_parts= [];
    addVoxelModelApplyOrientersAndBindNearest(
        STAD.middleSpawnPointX + 11.0, 16.0, STAD.middleSpawnPointY - 8.0,
        new_fish_parts, theseNewDbEntries, getVoxelModel("lilfish1"),
        STAD.stdvoxeldensity, totalParticleIndexTracker,
        {
            debugrender: true,
            entityrole: ALL_ENTITY_ROLES.TRENDINGFISH1,      
            bindunits: 6.0,                                 
            orientbind: 2.5,                                
            allowedspringtypes: STAD.springAllowedTees,     
            reserve_cpu_readbackspot: true,                 
            collision_orbs_mode: "bad"                      
        }
    );
    locationsOfTheseNewEntities = locationsOfTheseNewEntities.concat( new_fish_parts );

    
    
    //  ADD
    //      PLAYFUL CHASER FISH
    //          =================================================================================================
    //                          H A R M L E S S   C H A S E R    F I S H
    //__________________________________________________________________________________


    var new_partss_4_playful_feesh = [];
    console.log('ALL_ENTITY_ROLES.PLAYFULFISH1.ind', ALL_ENTITY_ROLES.PLAYFULFISH1.ind)
    
    STAD.instance_playfulfish1 = addVoxelModelApplyOrientersAndBindNearest(
        STAD.middleSpawnPointX-2.0, 7.0, STAD.middleSpawnPointY + 4.0  + 0*4,
        new_partss_4_playful_feesh, theseNewDbEntries, getVoxelModel("lilfish2"),
        STAD.stdvoxeldensity, totalParticleIndexTracker,
        {
            debugrender: true,
            entityrole: ALL_ENTITY_ROLES.PLAYFULFISH1,      
            bindunits: 6.0,                                 
            orientbind: 2.5,                                
            allowedspringtypes: STAD.springAllowedTees,     
            reserve_cpu_readbackspot: true,                 
            collision_orbs_mode: "bad"                      
        }
    );
    locationsOfTheseNewEntities = locationsOfTheseNewEntities.concat( new_partss_4_playful_feesh );

    new_partss_4_playful_feesh = [];
    STAD.instance_playfulfish2 = addVoxelModelApplyOrientersAndBindNearest(
        STAD.middleSpawnPointX-2.0, 7.0, STAD.middleSpawnPointY + 4.0  + 1*4,
        new_partss_4_playful_feesh, theseNewDbEntries, getVoxelModel("lilfish2"),
        STAD.stdvoxeldensity, totalParticleIndexTracker,
        {
            debugrender: true,
            entityrole: ALL_ENTITY_ROLES.PLAYFULFISH2,      
            bindunits: 6.0,                                 
            orientbind: 2.5,                                
            allowedspringtypes: STAD.springAllowedTees,     
            reserve_cpu_readbackspot: true,                 
            collision_orbs_mode: "bad"                      
        }
    );
    locationsOfTheseNewEntities = locationsOfTheseNewEntities.concat( new_partss_4_playful_feesh );




    //  ADD
    //      GROUND FAUNA
    //          =================================================================================================
    //                          H A R M L E S S    G R O U N D    D E C O R 
    //__________________________________________________________________________________
    let spanx = STAD.spawnAreaLengthX*2;
    let spany = STAD.spawnAreaLengthY*2;
    for(let sc = 0;sc < 12;sc++){
        let faunalist = [];
        console.log('ALL_ENTITY_ROLES.SEAWEED1.ind', ALL_ENTITY_ROLES.SEAWEED1.ind)
        
        //STAD["instance_seaweedf"] = 
        addVoxelModelApplyOrientersAndBindNearest(
            STAD.middleSpawnPointX - STAD.spawnAreaLengthX + EZWG.SHA1.random()*spanx ,
            EZWG.SHA1.random()*STAD.BUCKET_PERIMETER*STAD.bucks_pacing*0.1,
            STAD.middleSpawnPointY - STAD.spawnAreaLengthY + EZWG.SHA1.random()*spany,
            faunalist, theseNewDbEntries, getVoxelModel("seaweed"),
            STAD.stdvoxeldensity, totalParticleIndexTracker,
            {
                debugrender: true,
                entityrole: ALL_ENTITY_ROLES.SEAWEED1,      
                bindunits: 6.0,                                 
                orientbind: 1.5,                                
                allowedspringtypes: STAD.springAllowedTees,     
                reserve_cpu_readbackspot: true,                 
                collision_orbs_mode: "bad"                      
            }
        );
        locationsOfTheseNewEntities = locationsOfTheseNewEntities.concat( faunalist );
    }

    
    for(let sc = 0;sc < 1;sc++){
        console.log('ALL_ENTITY_ROLES.MODEL_HEART1.ind', ALL_ENTITY_ROLES.MODEL_HEART1.ind) 
        
        let heartslist = [];
        //STAD["instance_seaweedf"] = 
        addVoxelModelApplyOrientersAndBindNearest(
            STAD.middleSpawnPointX - STAD.spawnAreaLengthX + EZWG.SHA1.random()*spanx ,
            EZWG.SHA1.random()*STAD.BUCKET_PERIMETER*STAD.bucks_pacing*0.1,
            STAD.middleSpawnPointY - STAD.spawnAreaLengthY + EZWG.SHA1.random()*spany,
            heartslist, theseNewDbEntries, getVoxelModel("modelofheart1"),
            STAD.minivoxeldensity, totalParticleIndexTracker,
            {
                debugrender: true,
                entityrole: ALL_ENTITY_ROLES.MODEL_HEART1,      
                bindunits: 6.0,                                 
                orientbind: 1.5,                                
                allowedspringtypes: STAD.springAllowedTees,     
                reserve_cpu_readbackspot: true,                 
                collision_orbs_mode: "bad"                      
            }
        );
        locationsOfTheseNewEntities = locationsOfTheseNewEntities.concat( heartslist );
    }





    //  ADD
    //      TRUCK BALL PLAYERS
    //          =================================================================================================
    //                          B E A C H   B O Y S   T R U C K    R A L L Y
    //__________________________________________________________________________________

    var new_parts_truck = [];
    console.log('ALL_ENTITY_ROLES.TRUCKBEACHBOY1.ind', ALL_ENTITY_ROLES.TRUCKBEACHBOY1.ind);
    
    // RED TRUCK
    addVoxelModelApplyOrientersAndBindNearest(
        STAD.middleSpawnPointX + STAD.spawnAreaLengthX, 8.0, STAD.middleSpawnPointY - STAD.spawnAreaLengthY,
        new_parts_truck, theseNewDbEntries, getVoxelModel("lofitruck"),
        STAD.stdvoxeldensity, totalParticleIndexTracker,
        {
            debugrender: true,
            entityrole: ALL_ENTITY_ROLES.TRUCKBEACHBOY1,   
            bindunits: 6.0,
            orientbind: 2.0,
            allowedspringtypes: STAD.springAllowedTees,
            reserve_cpu_readbackspot: true,  
            collision_orbs_mode: "bad",
            paintjobs:[
                {input:{r:101,g:99,b:109}, output:{r:215, g: 17, b: 17}},
            ]
        }
    ); 
    locationsOfTheseNewEntities = locationsOfTheseNewEntities.concat( new_parts_truck );
 
    // GREEN TRUCK
    new_parts_truck = [];
    addVoxelModelApplyOrientersAndBindNearest(
        STAD.middleSpawnPointX - STAD.spawnAreaLengthX, 8.0, STAD.middleSpawnPointY + STAD.spawnAreaLengthY,
        new_parts_truck, theseNewDbEntries, getVoxelModel("lofitruck"),
        STAD.stdvoxeldensity, totalParticleIndexTracker,
        {
            debugrender: true,
            entityrole: ALL_ENTITY_ROLES.TRUCKFREEROAM1,   
            bindunits: 6.0,
            orientbind: 2.0,
            allowedspringtypes: STAD.springAllowedTees,
            reserve_cpu_readbackspot: true,  
            collision_orbs_mode: "bad",
            paintjobs:[
                {input:{r:101,g:99,b:109}, output:{r:21, g: 226, b: 36}},
            ]
        }
    ); 
    locationsOfTheseNewEntities = locationsOfTheseNewEntities.concat( new_parts_truck );

    // YELLOW TRUCK
    new_parts_truck = [];
    addVoxelModelApplyOrientersAndBindNearest(
        STAD.middleSpawnPointX + STAD.spawnAreaLengthX, 8.0, STAD.middleSpawnPointY + STAD.spawnAreaLengthY,
        new_parts_truck, theseNewDbEntries, getVoxelModel("lofitruck"),
        STAD.stdvoxeldensity, totalParticleIndexTracker,
        {
            debugrender: true,
            entityrole: ALL_ENTITY_ROLES.TRUCKFREEROAM1,   
            bindunits: 6.0,
            orientbind: 2.0,
            allowedspringtypes: STAD.springAllowedTees,
            reserve_cpu_readbackspot: true,  
            collision_orbs_mode: "bad",
            paintjobs:[
                {input:{r:101,g:99,b:109}, output:{r:214, g: 226, b: 21}},
            ]
        }
    ); 
    locationsOfTheseNewEntities = locationsOfTheseNewEntities.concat( new_parts_truck );

    // BLUE TRUCK
    new_parts_truck = [];
    addVoxelModelApplyOrientersAndBindNearest(
        STAD.middleSpawnPointX - STAD.spawnAreaLengthX, 8.0, STAD.middleSpawnPointY - STAD.spawnAreaLengthY,
        new_parts_truck, theseNewDbEntries, getVoxelModel("lofitruck"),
        STAD.stdvoxeldensity, totalParticleIndexTracker,
        {
            debugrender: true,
            entityrole: ALL_ENTITY_ROLES.TRUCKBEACHBOY1,   
            bindunits: 6.0,
            orientbind: 2.0,
            allowedspringtypes: STAD.springAllowedTees,
            reserve_cpu_readbackspot: true,  
            collision_orbs_mode: "bad",
            paintjobs:[
                {input:{r:101,g:99,b:109}, output:{r:14, g: 84, b: 211}},
            ]
        }
    ); 
    locationsOfTheseNewEntities = locationsOfTheseNewEntities.concat( new_parts_truck );



    // BEACH BALL
    let faunalist = [];
    
    console.log('ALL_ENTITY_ROLES.DRIFT_BEACHBALL1.ind', ALL_ENTITY_ROLES.DRIFT_BEACHBALL1.ind)
    
    // Instantiate beachball to push around
    STAD["instance_beachball1"] = 
    addVoxelModelApplyOrientersAndBindNearest(
        STAD.middleSpawnPointX, 10.0, STAD.middleSpawnPointY,
        faunalist, theseNewDbEntries, getVoxelModel("beachball1"),
        STAD.stdvoxeldensity, totalParticleIndexTracker,
        {
            debugrender: true,
            entityrole: ALL_ENTITY_ROLES.DRIFT_BEACHBALL1,      
            bindunits: 5.0,                                 
            orientbind: 1.5,                                
            allowedspringtypes: STAD.springAllowedTees,     
            reserve_cpu_readbackspot: true,                 
            collision_orbs_mode: "bad",                      
            paintjobs:[
                {input:{r:126,g:103,b:103}, output:{r:50, g: 80, b: 90}},
                {input:{r:41,g:32,b:99}, output:{r:120, g: 123, b: 42}}
            ]
        }
    );
    locationsOfTheseNewEntities = locationsOfTheseNewEntities.concat( faunalist );



    
    //  ADD
    //      MISC SIDE CHARACTERS
    //          =================================================================================================
    //                          M I S C E L L A N I O U S    M I S C H I E F S
    //__________________________________________________________________________________

    var newPOintsMantaray = [];
    console.log('ALL_ENTITY_ROLES.MANTARAY1.ind', ALL_ENTITY_ROLES.MANTARAY1.ind)
    
    STAD.instance_mantaray1 = addVoxelModelApplyOrientersAndBindNearest(
        STAD.middleSpawnPointX + 0.0, 6.0, STAD.middleSpawnPointY-6.0,
        newPOintsMantaray, theseNewDbEntries, getVoxelModel("mantaray1"),
        STAD.stdvoxeldensity, totalParticleIndexTracker,
        {
            debugrender: true,
            entityrole: ALL_ENTITY_ROLES.MANTARAY1,     
            bindunits: 4.0,                                 
            orientbind: 2,                                  
            allowedspringtypes: STAD.springAllowedTees,     
            reserve_cpu_readbackspot: true,                 
            collision_orbs_mode: "bad"                      
        }
    );
    locationsOfTheseNewEntities = locationsOfTheseNewEntities.concat( newPOintsMantaray );

    
    // var newPointsSTarDestroyer = [];
    // console.log('ALL_ENTITY_ROLES.STARDESTROYER.ind', ALL_ENTITY_ROLES.STARDESTROYER1.ind)
    
    // STAD.instance_stardestroyer1 = addVoxelModelApplyOrientersAndBindNearest(
    //     STAD.middleSpawnPointX-2.0, 12.0, STAD.middleSpawnPointY + 11.0,
    //     newPointsSTarDestroyer, theseNewDbEntries, getVoxelModel("stardestroyer1"),
    //     STAD.stdvoxeldensity, totalParticleIndexTracker,
    //     {
    //         debugrender: true,
    //         entityrole: ALL_ENTITY_ROLES.STARDESTROYER1,
    //         bindunits: 4.0,                                 
    //         orientbind: 2.5,                                
    //         allowedspringtypes: STAD.springAllowedTees,     
    //         reserve_cpu_readbackspot: true,                 
    //         collision_orbs_mode: "bad"                      
    //     }
    // );
    // locationsOfTheseNewEntities = locationsOfTheseNewEntities.concat( newPointsSTarDestroyer );



    var newpartsThudnercloud = [];
    console.log('ALL_ENTITY_ROLES.THUNDERCLOUD1.ind', ALL_ENTITY_ROLES.THUNDERCLOUD1.ind);
    
    STAD.instance_thundercloud = addVoxelModelApplyOrientersAndBindNearest(
        STAD.middleSpawnPointX-6.0, 8.0, STAD.middleSpawnPointY-4.0,
        newpartsThudnercloud, theseNewDbEntries, getVoxelModel("thundercloud1"),
        STAD.stdvoxeldensity, totalParticleIndexTracker,
        {
            debugrender: true,
            entityrole: ALL_ENTITY_ROLES.THUNDERCLOUD1,     
            bindunits: 4.0,                                 
            orientbind: 1.8,                                
            allowedspringtypes: STAD.springAllowedTees,     
            reserve_cpu_readbackspot: true,                 
            collision_orbs_mode: "bad"                      // all collisino orbs (t=5, r=255,g=120,b=120) which side do they go on
        }
    );
    locationsOfTheseNewEntities = locationsOfTheseNewEntities.concat( newpartsThudnercloud );


    

    var newpartsformegaeye = [];
    console.log('ALL_ENTITY_ROLES.MEGAEYE1.ind', ALL_ENTITY_ROLES.MEGAEYE1.ind);
    
    addVoxelModelApplyOrientersAndBindNearest(
        STAD.middleSpawnPointX+6.0, 8.0, STAD.middleSpawnPointY-4.0,
        newpartsformegaeye, theseNewDbEntries, getVoxelModel("megaeye1"),
        STAD.stdvoxeldensity, totalParticleIndexTracker,
        {
            debugrender: true,
            entityrole: ALL_ENTITY_ROLES.MEGAEYE1,     
            bindunits: 4.0,                                 
            orientbind: 1.8,                                
            allowedspringtypes: STAD.springAllowedTees,     
            reserve_cpu_readbackspot: true,                 
            collision_orbs_mode: "bad"                      // all collisino orbs (t=5, r=255,g=120,b=120) which side do they go on
        }
    );
    locationsOfTheseNewEntities = locationsOfTheseNewEntities.concat( newpartsformegaeye );


    
    //  ADD
    //      DIRT CARPET PARTICLES
    //          =================================================================================================
    //                          D I R T   C A R P E T
    //__________________________________________________________________________________


    var carpetedRain = [];
    // carpetParticleHelper_InactiveGold( 5 * STAD.bucks_pacing, 4.0, 5 * STAD.bucks_pacing, // top left start location (x, and z increases)
    //     200, 0.13*STAD.bucks_pacing, // how many and the spacing 
    //     carpetedRain, totalParticleIndexTracker // objects that get changed in this function
    // );
    STAD.bottomMudMeta = carpetParticleHelper_BottomMud( STAD.middleSpawnPointX, 1.3, STAD.middleSpawnPointY, // top left start location (x, and z increases)
        STAD.spawnAreaLengthX*3, STAD.spawnAreaLengthY*3, // the are covered by
        140,  // how many  
        carpetedRain, totalParticleIndexTracker, // objects that get changed in this function
        EZWG.SHA1// random object
    );
    locationsOfTheseNewEntities = locationsOfTheseNewEntities.concat( carpetedRain );







    // This is the only pointer that gets fucked with so gotta 
    return locationsOfTheseNewEntities;


}