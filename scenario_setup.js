


function initNewEntityDictionary(){

    return {
        ENT_SCRATCH_PAD_SIZE:   4096,    // first 100 numbers is for writing back to (MAY be related to BUCKET_PERIMETER? not sure)
        // DONUT DELETE < - For ADDING ANOTHER WRITE SLOT OUTPUT INFO HERE PART 1/2))
        WRITE_SLOT_SIZE:        8,      // how big a readback slot is for an entity that has their readback flag enabled

                    //          ^ The first 3 of this will probs always be the center coordinates of the main guyy
        ENT_AMOUNT_EACH:        512,     // the max number of good guys, the max number of bad guys

        BUCKET_PERIMETER:       64,     // how many buckets long is the collidable world
        COLLISION_LIST:         25,     // how many different entities can be in a bucket
        MAX_PARTICLES:          100_000,
        MAX_DBS:                10_000,     // how many random misc values u need stored 
        MAX_SPRINGS:            6_500_000,
        STD_GRAV:               0.00061,

        MUSIC_SLOTS:            16,     // one of these is a sfx that can play once per frame
        MUSIC_SLT_SIZE:         1,      // ping/pong


        RSRVED_PARTICLE_SIZE:   3,      // how big a new section of rserved particles is in the DB (that the TEal particle looks up to)
                                    // DONUTMMODIDFY < - HTIS LINE this is how to add more meta info on reserved particles

        MAX_WEAPONS:            24,     // maximum weapons allowed to be reserved 

        // DONTUT CHANGE - PART 1 / 2 NEW PARTICLE ADD HERE
        springAllowedTees:      [ 2, 5,     // if this type is here permit it to be used // 4 (not used)
                                6, 7, 8, 9, 10, 11, 12,   // control surfaces
                                13, //central nucleus, one per voxel thing loaded
                                14,  // dormant particle
                                
                                15,// water particle
                                16,   // dormant gold
                                17,   // active gold
                                18,  // marker decoration particles (used for targeting reticles, text, non-physics indication markers)
                                19,  // explosion 1 weapon
                                20 ],// laser 1 weapon

                                //21], // ehh probs not necessary for the air drifert particle
        
        // Important for special physics on particles i guess
        particleSpecialPhysics: [ 14, // dormant particle

                                15,   // water particle
                                16,   // dormant gold
                                17,   // active gold
                                18, // marker decoration particles (used for targeting reticles, text, non-physics indication markers)
                                19, //explosion 1
                                20,// laser 1 weapon

                                21 ],// air drifter particle decoration usually to t19, and t20 weapons

        consideredWeapons:      [ 19, // explosion 1 weapon
                                20 ],//laser 1 weapon

        inOrderEnts:                [],

        thebucketsidk:              null,
        thegroundparts:             null,
        instance_mega_cube_1:       null,
        instance_mega_cube_2:       null,

        instance_urfish:            null, 
        instance_school_head1:      null,
        instance_truck2:            null, 
    }
}




function returnAllStructures() {




    const seedtouse = 'sbrrtee6ed234tt132341';
    EZWG.SHA1.seed(seedtouse);

    
    var spacing = 0.3;     // Spacing between the particles inside the cube structure
    var stdvoxeldensity = 0.1; //
    var minivoxeldensity = 0.03;
    var bucks_pacing = 1.0;// Spacing between grid entities
    var innerCircleSpawnRatio = 0.34;// how much of the radiuso nthe sinse


    var COLLISION_ORB_TYPE_GOOD = 0;
    var COLLISION_ORB_TYPE_BAD = 0;

    


    var ALL_ENTITY_ROLES = {
        CHILL1: { ind : -1 },       // Doesn't do anything
        CAR1: { ind : -1 },
        CTRLFISH1: { ind : -1 },    // Fish point one
        LAKITU: { ind : -1 },
        CAREVIL2: { ind : -1 },
        SWAMPNAT1: { ind : -1 },
        HEADFISH1:{ ind : -1 },     // Head of da feesh
        STUDENTFISH1:{ ind : -1 },
        SEAWEED1:{ ind : -1 },
        MANTARAY1:{ ind : -1 },
        STARDESTROYER1:{ ind : -1 },
        THUNDERCLOUD1:{ ind : -1 },
        MISSILE1:{ ind : -1 },
        DRIFT1:{ ind : -1 },        // Sea urchin bomb 1
    }

    


    // DONTUT CHANGE - ADD RESERVED PARTICLES for EntitYRoles - add reserved here

    // Ok now build out the database
    // For each new type add it on here:
    var entity_role_templates = [];     // JUST A LINEAR INDEXING OF ALL THE ENTITY ROLES

    var ENT_ROLES_SIZE = 14;

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
                                    //4 = helicopter movement
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
                                    // *bucks_pacing   ?
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
                backward_engine: -0.02,          // how much pull back on the back for orienting
                grav_pull: 0.00064,
                reserved_particles: [
                    {size: 200, t: 15}, // water-like mud that gets kicked up
                    {size: 32, t: 15}   // KEEP it to 15 (water particles) BUT they're just never activated so it stays as 14
                ],          // reserved particle amount
                user_ctrl_scheme: 1,
                top_bottom_mass_ratio: 1,// multiply all the top forces by this to get even balanceer
                rotation_engine: 0.01, // turn force for left n right, and tilting up n down
                behaviour_type: 0,   // 0 = do not move ( ONLY APPLIES IF AI)
                                    // 1 = move towards your target_id ( ONLY APPLIES IF AI)
                                    // 2 = go to random location for movement( ONLY APPLIES IF AI)
                                    // 3 = go to random location on the ground (ONLY APPLIES IF AI)
                max_sight_range: 64.0,        // # = max radius to ntoice the teal particle of ur target_id entity( ONLY APPLIES IF AI)
                                    // *bucks_pacing   ?
                idle_activity: 0,          // 0 = do nothing when ur target is not in sight( ONLY APPLIES IF AI)
                                           // 1 = ????
                max_attack_range: 64.0     // # = max radius to do an attack on ur target id
            }
        );

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
                reserved_particles: [
                    {size: 200, t: 15}, // water-like mud that gets kicked up
                    {size: 26, t: 15},   // KEEP it to 15 (water particles) BUT they're just never activated so it stays as 14 
                    //{size: 26, t: 15},   // KEEP it to 15 (water particles) BUT they're just never activated so it stays as 14 (but for the ent youre targeting)
                    {size: 500, t: 19, smk: 21}    // add one MISSILE[0]. [1-199] smolk particles (being 21)
                ],          // reserved particle amount
                user_ctrl_scheme: 3,
                top_bottom_mass_ratio: 1.04,// multiply all the top forces by this to get even balanceer
                rotation_engine: 0.016, // turn force for left n right, and tilting up n down for left n right, and tilting up n down
                behaviour_type: 0,   // 0 = do not move ( ONLY APPLIES IF AI)
                                    // 1 = move towards your target_id ( ONLY APPLIES IF AI)
                                    // 2 = go to random location for movement( ONLY APPLIES IF AI)
                                    // 3 = go to random location on the ground (ONLY APPLIES IF AI)
            }
        );

    


    
    // 3 Lakitu role, stock target at certain elevation
    ALL_ENTITY_ROLES.LAKITU = 
        createNewEntityRoleInDatabase( entity_role_templates,
            {
                ind: entity_role_templates.length,  // index of the entity roles 
                top_pull: 0.0115 * 1.71,
                bottom_pull: -0.0115 * 0.35,
                target_id: "instance_urfish",    // attribute of STAD that has the ID of a particle to follow 
                collide_with: 2,                // collide with bad
                forward_engine: 0.0042,
                backward_engine: -0.0015,       // how much pull back on the back for orienting
                grav_pull: 0.00012,          
                reserved_particles: [],          // reserved particle amount
                user_ctrl_scheme: 1,
                top_bottom_mass_ratio: 1,// multiply all the top forces by this to get even balanceer
                rotation_engine: 0.01, // turn force for left n right, and tilting up n down
                behaviour_type: 3,   // 0 = do not move ( ONLY APPLIES IF AI)
                                    // 1 = move towards your target_id ( ONLY APPLIES IF AI)
                                    // 2 = go to random location for movement( ONLY APPLIES IF AI)
                                    // 3 = go to random location on the ground (ONLY APPLIES IF AI)
            }
        );



    // 4 Evil Car runin u over role, stock target at certain elevation
    ALL_ENTITY_ROLES.CAREVIL2 = 
        createNewEntityRoleInDatabase( entity_role_templates,
            {
                ind: entity_role_templates.length,  // index of the entity roles 
                top_pull: 0.0115 * 1.11,
                bottom_pull: -0.0115 * 0.55,
                target_id: "instance_urfish",    // attribute of STAD that has the ID of a particle to follow 
                collide_with: 2,                // collide with both 
                forward_engine: 0.03,
                backward_engine: -0.01,       // how much pull back on the back for orienting
                grav_pull: 0.0007,          
                reserved_particles: [],          // reserved particle amount
                user_ctrl_scheme: 1,
                top_bottom_mass_ratio: 1,// multiply all the top forces by this to get even balanceer
                rotation_engine: 0.01, // turn force for left n right, and tilting up n down
                behaviour_type: 3,   // 0 = do not move ( ONLY APPLIES IF AI)
                                    // 1 = move towards your target_id ( ONLY APPLIES IF AI)
                                    // 2 = go to random location for movement( ONLY APPLIES IF AI)
                                    // 3 = go to random location on the ground (ONLY APPLIES IF AI)
            }
        );
        
        



    // 5
    ALL_ENTITY_ROLES.SWAMPNAT1 = 
        createNewEntityRoleInDatabase( entity_role_templates,
            {
                ind: entity_role_templates.length,  // index of the entity roles 
                top_pull: 0.0115 * 1,
                bottom_pull: -0.0115 * 2,
                target_id: "instance_truck2",   // attribute of STAD that has the ID of a particle to follow 
                collide_with: 2,                // collide with both 
                forward_engine: 0.005,
                backward_engine: -0.004,
                grav_pull: 0.00011,          
                reserved_particles: [],          // reserved particle amount
                user_ctrl_scheme: 1,
                top_bottom_mass_ratio: 1,// multiply all the top forces by this to get even balanceer
                rotation_engine: 0.01, // turn force for left n right, and tilting up n down
                behaviour_type: 1,   // 0 = do not move ( ONLY APPLIES IF AI)
                                    // 1 = move towards your target_id ( ONLY APPLIES IF AI)
                                    // 2 = go to random location for movement( ONLY APPLIES IF AI)
                                    // 3 = go to random location on the ground (ONLY APPLIES IF AI)
            }
        );
    


    // 6
    ALL_ENTITY_ROLES.HEADFISH1 = 
        createNewEntityRoleInDatabase( entity_role_templates,
            {
                ind: entity_role_templates.length,  // index of the entity roles 
                top_pull: 0.0115 * 0.05,
                bottom_pull: -0.0115 * 0.05,
                target_id: "instance_urfish",    // attribute of STAD that has the ID of a particle to follow 
                collide_with: 2,                // collide with good and bad (collide with both )
                forward_engine: 0.003,
                backward_engine: -0.001,
                grav_pull: 0,//0.00011,          
                reserved_particles: [],          // reserved particle amount
                user_ctrl_scheme: 2,
                top_bottom_mass_ratio: 1.3,// multiply all the top forces by this to get even balanceer
                rotation_engine: 0.01, // turn force for left n right, and tilting up n down
                behaviour_type: 2,   // 0 = do not move ( ONLY APPLIES IF AI)
                                    // 1 = move towards your target_id ( ONLY APPLIES IF AI)
                                    // 2 = go to random location for movement( ONLY APPLIES IF AI)
                                    // 3 = go to random location on the ground (ONLY APPLIES IF AI)
            }
        );
        
    // 6
    ALL_ENTITY_ROLES.STUDENTFISH1 = 
        createNewEntityRoleInDatabase( entity_role_templates,
            {
                ind: entity_role_templates.length,  // index of the entity roles 
                top_pull: 0.0115 * 0.05,
                bottom_pull: -0.0115 * 0.05,
                target_id: "instance_school_head1",    // attribute of STAD that has the ID of a particle to follow 
                collide_with: 2,                // collide with good and bad (collide with both )
                forward_engine: 0.003,
                backward_engine: -0.001,
                grav_pull: 0,//0.00011,          
                reserved_particles: [],          // reserved particle amount
                user_ctrl_scheme: 2,
                top_bottom_mass_ratio: 1.1,// multiply all the top forces by this to get even balanceer
                rotation_engine: 0.01, // turn force for left n right, and tilting up n down
                behaviour_type: 2,   // 0 = do not move ( ONLY APPLIES IF AI)
                                    // 1 = move towards your target_id ( ONLY APPLIES IF AI)
                                    // 2 = go to random location for movement( ONLY APPLIES IF AI)
                                    // 3 = go to random location on the ground (ONLY APPLIES IF AI)
            }
        );
    
    // 7
    ALL_ENTITY_ROLES.SEAWEED1 = 
        createNewEntityRoleInDatabase( entity_role_templates,
            {
                ind: entity_role_templates.length,  // index of the entity roles 
                top_pull: 0.0115 * 1.2,
                bottom_pull: -0.0115 * 2.6,
                target_id: "-nonen-",    // attribute of STAD that has the ID of a particle to follow 
                collide_with: 2,                // collide with good 
                forward_engine: 0.0,
                backward_engine: 0.0,
                grav_pull: 0.00024,          
                reserved_particles: [],          // reserved particle amount
                user_ctrl_scheme: 1,
                top_bottom_mass_ratio: 1,// multiply all the top forces by this to get even balanceer
                rotation_engine: 0.01, // turn force for left n right, and tilting up n down
                behaviour_type: 0,   // 0 = do not move ( ONLY APPLIES IF AI)
                                    // 1 = move towards your target_id ( ONLY APPLIES IF AI)
                                    // 2 = go to random location for movement( ONLY APPLIES IF AI)
                                    // 3 = go to random location on the ground (ONLY APPLIES IF AI)
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
                forward_engine: 0.0082,
                backward_engine: -0.0015,       // how much pull back on the back for orienting
                grav_pull: 0.00011,          
                reserved_particles: [],          // reserved particle amount
                user_ctrl_scheme: 2,
                top_bottom_mass_ratio: 1,// multiply all the top forces by this to get even balanceer
                rotation_engine: 0.01, // turn force for left n right, and tilting up n down
                behaviour_type: 1,   // 0 = do not move ( ONLY APPLIES IF AI)
                                    // 1 = move towards your target_id ( ONLY APPLIES IF AI)
                                    // 2 = go to random location for movement( ONLY APPLIES IF AI)
                                    // 3 = go to random location on the ground (ONLY APPLIES IF AI)
            }
        );

        
    // 9 Star destroyer
    ALL_ENTITY_ROLES.STARDESTROYER1 = 
        createNewEntityRoleInDatabase( entity_role_templates,
            {
                ind: entity_role_templates.length,  // index of the entity roles 
                top_pull: 0.0115 * 0.31,
                bottom_pull: -0.0115 * 0.3,
                target_id: "instance_urfish",    // attribute of STAD that has the ID of a particle to follow 
                collide_with: 0,                // collide with good
                forward_engine: 0.0082,
                backward_engine: -0.0015,       // how much pull back on the back for orienting
                grav_pull: 0.00021,          
                reserved_particles: [],          // reserved particle amount
                user_ctrl_scheme: 2,
                top_bottom_mass_ratio: 1,// multiply all the top forces by this to get even balanceer
                rotation_engine: 0.01, // turn force for left n right, and tilting up n down
                behaviour_type: 1,   // 0 = do not move ( ONLY APPLIES IF AI)
                                    // 1 = move towards your target_id ( ONLY APPLIES IF AI)
                                    // 2 = go to random location for movement( ONLY APPLIES IF AI)
                                    // 3 = go to random location on the ground (ONLY APPLIES IF AI)
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
                backward_engine: -0.0015,       // how much pull back on the back for orienting
                grav_pull: 0.0,          
                reserved_particles: [
                    {size: 1200, t: 15}  // all the particles start off as t:14, this 't' determines what kind it transforms into 
                ],
                user_ctrl_scheme: 2,
                top_bottom_mass_ratio: 1,// multiply all the top forces by this to get even balanceer
                rotation_engine: 0.01 // turn force for left n right, and tilting up n down
            }
        );
        
    // 11 Targetingrecitle
    ALL_ENTITY_ROLES.MISSILE1 = 
        createNewEntityRoleInDatabase( entity_role_templates,
            {
                ind: entity_role_templates.length,  // index of the entity roles 
                top_pull: 0.0115 * 0.0,
                bottom_pull: -0.0115 * 0.0,
                target_id: "instance_urfish",    // attribute of STAD that has the ID of a particle to follow 
                collide_with: 1,                // collide with bad
                forward_engine: 0.0,
                backward_engine: 0.0,
                grav_pull: 0.00004,          
                reserved_particles: [],          // reserved particle amount
                user_ctrl_scheme: 1,
                top_bottom_mass_ratio: 1,// multiply all the top forces by this to get even balanceer
                rotation_engine: 0.01 // turn force for left n right, and tilting up n down
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


    
    // Useful for keeping track of values to use for 
    var STAD = initNewEntityDictionary();

    
    var icspr = innerCircleSpawnRatio;
    var oneSideLength = STAD.BUCKET_PERIMETER * bucks_pacing;
    

    
    
    var middleSpawnPointX = oneSideLength/2;
    var middleSpawnPointY = oneSideLength/2;

    var startOfRandoSquareX =  (oneSideLength-(icspr*oneSideLength)) / 2;
    var startOfRandoSquareY =  (oneSideLength-(icspr*oneSideLength)) / 2;

    var spawnAreaLengthX = oneSideLength * icspr;
    var spawnAreaLengthY = oneSideLength * icspr;
    


    var totalParticleIndexTracker = {
        // particles, springs, db_red_only, cpu_redback
        val:0, exsprcnt: 0, totaldbs: 0, totalcpu: 0,

        MAX_good_guys: STAD.ENT_AMOUNT_EACH,      // GOTTA include these for calculations
        goodguys: 0,

        MAX_bad_guys: STAD.ENT_AMOUNT_EACH,
        badguys: 0,

        totalreadbacks: 0,  // hwo many different readback slots
        readbackslotsize: STAD.WRITE_SLOT_SIZE,  // how big is readback size

        reservedpartsize: STAD.RSRVED_PARTICLE_SIZE,  // reserved particles section size 

        weaponsind: 0,      // increases eveyrtime new weapon is added
        MAX_weapons_registered: STAD.MAX_WEAPONS,

        Considered_Weapons: [...STAD.consideredWeapons],
        currentlistofweaponsparticles: []// THE particle id's of the weapons (to be added to DB)
    };  
    
    
    // SCRATCH PAD THIS IS HOW U GET STUFF BACK TO THE CPU 
    var START_SCRATCH = 0;
    
    var SIZE_META = STAD.ENT_SCRATCH_PAD_SIZE + 15; 
    var totalIndexCount = 0 + SIZE_META; 

    //Looks like this:
    //[0] = main player entity x
    //[1] = main player entity y
    //[2] = main player entity z
    //[3] = lakitu cloud 1 x
    //[4] = lakitu cloud 1 y
    //[5] = lakitu cloud 1 z
    //[6] = lakitu cloud 2 x
    // . . . .




    
    // Collision chamber - > 256 different values  
    var START_COLLS = 0 + totalIndexCount;
    var collisionListSize = STAD.COLLISION_LIST; // up to 25 different entities can be in the same column
    var SIZE_COLS = collisionListSize * 2;// read and write list 
    var totalBucketsMemSpace = (STAD.BUCKET_PERIMETER*STAD.BUCKET_PERIMETER) * (SIZE_COLS);
    //                     # of all buckets                     size of each ledger
    totalIndexCount += totalBucketsMemSpace;

    // ^^^ this section in memory is going to be just 0's to start



    var START_PARTICLES = 0 + totalIndexCount;
    var maxParticles = STAD.MAX_PARTICLES;
    var PARTICLE_ATTRIBUTES = 15;
    var entityTemplateSize = 0 + PARTICLE_ATTRIBUTES*2; // RGB and then 10 different things that could be be accessed and changed
    var psize = 0 + entityTemplateSize;
    var SIZE_ENTS = entityTemplateSize;
    var totalEntMemSpace = (maxParticles) * (SIZE_ENTS);


    totalIndexCount += totalEntMemSpace;

    
    // Connect the springs per particle 
    //  -> and make the list connections
 
    var entityUpdateSweepCycle = 8; // takes 8 game ticks to go through all 
 
    // Values   // This is max like the particles
    var maxLists = STAD.MAX_SPRINGS;//16000;
    var START_LISTS = 0 + totalIndexCount;

    var SIZE_LISTS_entry_size = 3; 
    // spring connection B
    // spring stable dist
    // spring k value

    totalIndexCount += maxLists*SIZE_LISTS_entry_size;



 
    var MAX_COLLIDABLES = totalParticleIndexTracker.MAX_good_guys + totalParticleIndexTracker.MAX_bad_guys;
    var MAX_COLL_GOOD_GUYS = totalParticleIndexTracker.MAX_good_guys;       //totalParticleIndexTracker.goodguys=0
    var MAX_COLL_BAD_GUYS = totalParticleIndexTracker.MAX_bad_guys;         //totalParticleIndexTracker.badguys=0

    var START_DB = 0 + totalIndexCount;
    var theseNewDbEntries = [];
    var maxDbEntries = STAD.MAX_DBS;
    var dbEntrySize = 0 + 1; // One value for this bad boy 
    var SIZE_DBS = dbEntrySize;
    var totalDbMemSpace = (maxDbEntries) * (SIZE_DBS);
    // increase it:         totalParticleIndexTracker.totaldbs


    totalIndexCount += totalDbMemSpace;


    // Scratch pad in the total number of collidable entities:
    for(let c = 0;c < MAX_COLLIDABLES;c++){
        theseNewDbEntries.push(0);
        totalParticleIndexTracker.totaldbs++;
    }
 
    

    // Start of Db's for good/bad guys 
    //[0].... good guy 1 index PLUS 1 (+1) 
    //[1]....
    //[2]....
    //[3]...

    //[32]... bad guy 1 index PLUS 1 (+1)
    //[33]....


    
    // special weapons to loop through 
    var MAX_WEAPON_REGISTERS = totalParticleIndexTracker.MAX_weapons_registered;
    

    

    // First install the base particles:
    //-------------------------
    // Type 0 = collision buckets (STAD.BUCKET_PERIMETER*STAD.BUCKET_PERIMETER)
    // Type 1 = ent

    // Contains the buckets particles
    var newBucketParticles = []; //(totalbuckerts = 64*64)
    // t = 1
    STAD.thebucketsidk = addCollisionBucketParticles(
        0,0,0,
        newBucketParticles, 
        STAD.BUCKET_PERIMETER, bucks_pacing, totalParticleIndexTracker );


    var groundParticlesReservedForDeco = [];
    // t = 3
    // STAD.thegroundparts = addGroundDecoParticles(
    //     0,0,0,
    //     groundParticlesReservedForDeco, 
    //     STAD.BUCKET_PERIMETER, bucks_pacing, 8, totalParticleIndexTracker );


 
    // Contains all the collision enabled entities 
    var locationsOfTheseNewEntities = [];   //(maxEntities)

    
 

    var newpartsForMainCharGuyt = [];
    console.log('ALL_ENTITY_ROLES.CTRLFISH1.ind', ALL_ENTITY_ROLES.CTRLFISH1.ind);
    // Instance truckk
    STAD.instance_urfish = addVoxelModelApplyOrientersAndBindNearest(
        middleSpawnPointX, 6.0, middleSpawnPointY,
        newpartsForMainCharGuyt, theseNewDbEntries, getVoxelModel( "lilminnow1" ),//( "lilfish2"), "lilminnow1""biggertruck
        stdvoxeldensity, totalParticleIndexTracker,
        {
            debugrender: true,
            entityrole: ALL_ENTITY_ROLES.CTRLFISH1,        // set the center nucleus (t=13)'s meta7 to (0=undefied, 1 = car,, 2 = ...???)
            bindunits: 8.0,       //multiply factor of spacing for spring connection
            orientbind: 1.5,      //multiply factor for orienting control cataloguing
            allowedspringtypes: STAD.springAllowedTees,
            reserve_cpu_readbackspot: true,  // if true, reserve a spot in the scratch pad
            collision_orbs_mode: "good"     // all collisino orbs (t=5, r=255,g=120,b=120) which side do they go on.
        }
    );
    locationsOfTheseNewEntities = locationsOfTheseNewEntities.concat( newpartsForMainCharGuyt );



 
    
    var newpartsForTargetingReticl = [];
    console.log('ALL_ENTITY_ROLES.MISSILE1.ind', ALL_ENTITY_ROLES.MISSILE1.ind);
    // Instance truckk
    STAD.instance_missile = addVoxelModelApplyOrientersAndBindNearest(
        middleSpawnPointX - 6.0, 4.0, middleSpawnPointY + 7.0,// Behind the main guy
        newpartsForTargetingReticl, theseNewDbEntries, getVoxelModel("missile1"),
        minivoxeldensity, totalParticleIndexTracker,
        {
            debugrender: true,
            entityrole: ALL_ENTITY_ROLES.MISSILE1,     // set the center nucleus (t=13)'s meta7 to (0=undefied, 1 = car,, 2 = ...???)
            bindunits: 4.0,                                 // multiply factor of spacing for spring connection
            orientbind: 1.8,                                // multiply factor for orienting control cataloguing
            allowedspringtypes: STAD.springAllowedTees,     
            reserve_cpu_readbackspot: true,                 // if true, reserve a spot in the scratch pad
            collision_orbs_mode: "good"                      // all collisino orbs (t=5, r=255,g=120,b=120) which side do they go on
        }
    );
    locationsOfTheseNewEntities = locationsOfTheseNewEntities.concat( newpartsForTargetingReticl );

 
 

     
    //processEntities(locationsOfTheseNewEntities); 
    


    var newEntities_BATCH_2 = [];
    console.log('ALL_ENTITY_ROLES.CAREVIL2.ind', ALL_ENTITY_ROLES.CAREVIL2.ind);
    // Instance truckk
    STAD.instance_truck2 = addVoxelModelApplyOrientersAndBindNearest(
        middleSpawnPointX + 14.0, 13.0, middleSpawnPointY + 2.0,
        newEntities_BATCH_2, theseNewDbEntries, getVoxelModel("biggertruck"),
        stdvoxeldensity, totalParticleIndexTracker,
        {
            debugrender: true,
            entityrole: ALL_ENTITY_ROLES.CAREVIL2,   // set the center nucleus (t=13)'s meta7 to (0=undefied, 1 = car,, 2 = ...???)
            bindunits: 8.0,       //multiply factor of spacing for spring connection
            orientbind: 1.0,      //multiply factor for orienting control cataloguing
            allowedspringtypes: STAD.springAllowedTees,
            reserve_cpu_readbackspot: true,  // if true, reserve a spot in the scratch pad
            collision_orbs_mode: "bad"     // all collisino orbs (t=5, r=255,g=120,b=120) which side do they go on.
            // MAKE SURE THE 'entityrole' MATCHES THE Colision_orbs_mode
        }
    );

    locationsOfTheseNewEntities = locationsOfTheseNewEntities.concat( newEntities_BATCH_2 );
 

    var newParts_For_Lakitu_1 = [];
    console.log('ALL_ENTITY_ROLES.LAKITU.ind', ALL_ENTITY_ROLES.LAKITU.ind)
    // Instance truckk
    STAD.instance_lakitu_1 = addVoxelModelApplyOrientersAndBindNearest(
        middleSpawnPointX-2.0, 13.0, middleSpawnPointY-2.0,// Behind the main guy
        newParts_For_Lakitu_1, theseNewDbEntries, getVoxelModel("lakitucam1"),
        stdvoxeldensity, totalParticleIndexTracker,
        {
            debugrender: true,
            entityrole: ALL_ENTITY_ROLES.LAKITU,        // set the center nucleus (t=13)'s meta7 to (0=undefied, 1 = car,, 2 = ...???)
            bindunits: 6.0,                                 // multiply factor of spacing for spring connection
            orientbind: 0.8,                                // multiply factor for orienting control cataloguing
            allowedspringtypes: STAD.springAllowedTees,     
            reserve_cpu_readbackspot: true,                 // if true, reserve a spot in the scratch pad
            collision_orbs_mode: "good"                     // all collisino orbs (t=5, r=255,g=120,b=120) which side do they go on.
        }
    );
    locationsOfTheseNewEntities = locationsOfTheseNewEntities.concat( newParts_For_Lakitu_1 );

    
    var newParts_For_A_Blimp = [];
    console.log('ALL_ENTITY_ROLES.SWAMPNAT1.ind', ALL_ENTITY_ROLES.SWAMPNAT1.ind)
    // Instance truckk
    STAD.instance_swampnat = addVoxelModelApplyOrientersAndBindNearest(
        middleSpawnPointX-6.0, 15.0, middleSpawnPointY + 6.0,// Behind the main guy
        newParts_For_A_Blimp, theseNewDbEntries, getVoxelModel( "lilplecko1"),//"swampnat"),
        stdvoxeldensity, totalParticleIndexTracker,
        {
            debugrender: true,
            entityrole: ALL_ENTITY_ROLES.SWAMPNAT1,     // set the center nucleus (t=13)'s meta7 to (0=undefied, 1 = car,, 2 = ...???)
            bindunits: 6.0,                                 // multiply factor of spacing for spring connection
            orientbind: 2.5,                                // multiply factor for orienting control cataloguing
            allowedspringtypes: STAD.springAllowedTees,     
            reserve_cpu_readbackspot: true,                 // if true, reserve a spot in the scratch pad
            collision_orbs_mode: "bad"                      // all collisino orbs (t=5, r=255,g=120,b=120) which side do they go on.
        }
    );
    locationsOfTheseNewEntities = locationsOfTheseNewEntities.concat( newParts_For_A_Blimp );



    var newParts_For_A_lilfish = [];
    console.log('ALL_ENTITY_ROLES.HEADFISH1.ind', ALL_ENTITY_ROLES.HEADFISH1.ind)
    // Instance truckk
    STAD.instance_school_head1 = addVoxelModelApplyOrientersAndBindNearest(
        middleSpawnPointX-2.0, 15.0, middleSpawnPointY + 8.0,// Behind the main guy
        newParts_For_A_lilfish, theseNewDbEntries, getVoxelModel("lilminnow4"),//lilminnow2
        stdvoxeldensity, totalParticleIndexTracker,
        {
            debugrender: true,
            entityrole: ALL_ENTITY_ROLES.HEADFISH1,      // set the center nucleus (t=13)'s meta7 to (0=undefied, 1 = car,, 2 = ...???)
            bindunits: 6.0,                                 // multiply factor of spacing for spring connection
            orientbind: 2.5,                                // multiply factor for orienting control cataloguing
            allowedspringtypes: STAD.springAllowedTees,     
            reserve_cpu_readbackspot: true,                 // if true, reserve a spot in the scratch pad
            collision_orbs_mode: "bad"                      // all collisino orbs (t=5, r=255,g=120,b=120) which side do they go on.
        }
    );
    locationsOfTheseNewEntities = locationsOfTheseNewEntities.concat( newParts_For_A_lilfish );

    

    for(let sf = 0;sf < 4;sf++){
        var newParts_For_StudentFish = [];
        console.log('ALL_ENTITY_ROLES.STUDENTFISH1.ind', ALL_ENTITY_ROLES.STUDENTFISH1.ind)
        // Instance truckk
        //STAD.instance_school_head1 = 
        addVoxelModelApplyOrientersAndBindNearest(
            middleSpawnPointX-2.0, 7.0, middleSpawnPointY + 4.0  + sf*3,// Behind the main guy
            newParts_For_StudentFish, theseNewDbEntries, getVoxelModel("lilminnow3"),
            stdvoxeldensity, totalParticleIndexTracker,
            {
                debugrender: true,
                entityrole: ALL_ENTITY_ROLES.STUDENTFISH1,      // set the center nucleus (t=13)'s meta7 to (0=undefied, 1 = car,, 2 = ...???)
                bindunits: 6.0,                                 // multiply factor of spacing for spring connection
                orientbind: 2.5,                                // multiply factor for orienting control cataloguing
                allowedspringtypes: STAD.springAllowedTees,     
                reserve_cpu_readbackspot: true,                 // if true, reserve a spot in the scratch pad
                collision_orbs_mode: "bad"                      // all collisino orbs (t=5, r=255,g=120,b=120) which side do they go on.
            }
        );
        locationsOfTheseNewEntities = locationsOfTheseNewEntities.concat( newParts_For_StudentFish );
    }


    for(let sc = 0;sc < 18;sc++){
        let faunalist = [];
        console.log('ALL_ENTITY_ROLES.SEAWEED1.ind', ALL_ENTITY_ROLES.SEAWEED1.ind)
        // Instance truckk
        //STAD["instance_seaweedf"] = 
        addVoxelModelApplyOrientersAndBindNearest(
            startOfRandoSquareX + EZWG.SHA1.random()*spawnAreaLengthX ,
            EZWG.SHA1.random()*STAD.BUCKET_PERIMETER*bucks_pacing*0.1,
            startOfRandoSquareY + ( EZWG.SHA1.random()*spawnAreaLengthY ),
            faunalist, theseNewDbEntries, getVoxelModel("seaweed"),
            stdvoxeldensity, totalParticleIndexTracker,
            {
                debugrender: true,
                entityrole: ALL_ENTITY_ROLES.SEAWEED1,      // set the center nucleus (t=13)'s meta7 to (0=undefied, 1 = car,, 2 = ...???)
                bindunits: 7.0,                                 // multiply factor of spacing for spring connection
                orientbind: 1.5,                                // multiply factor for orienting control cataloguing
                allowedspringtypes: STAD.springAllowedTees,     
                reserve_cpu_readbackspot: true,                 // if true, reserve a spot in the scratch pad
                collision_orbs_mode: "bad"                      // all collisino orbs (t=5, r=255,g=120,b=120) which side do they go on.
            }
        );
        locationsOfTheseNewEntities = locationsOfTheseNewEntities.concat( faunalist );
    }

    

    for(let sc = 0;sc < 3;sc++){
        let faunalist = [];
        console.log('ALL_ENTITY_ROLES.DRIFT1.ind', ALL_ENTITY_ROLES.DRIFT1.ind)
        // Instance truckk
        //STAD["instance_seaweedf2"] = 
        addVoxelModelApplyOrientersAndBindNearest(
            startOfRandoSquareX + ( EZWG.SHA1.random()*spawnAreaLengthX ),
             EZWG.SHA1.random()*STAD.BUCKET_PERIMETER*bucks_pacing*0.2,
            startOfRandoSquareY + ( EZWG.SHA1.random()*spawnAreaLengthY ),
            faunalist, theseNewDbEntries, getVoxelModel("lilurchin1"),//"accurateorb"), 
            stdvoxeldensity, totalParticleIndexTracker,
            {
                debugrender: true,
                entityrole: ALL_ENTITY_ROLES.DRIFT1,      // set the center nucleus (t=13)'s meta7 to (0=undefied, 1 = car,, 2 = ...???)
                bindunits: 3.0,                                 // multiply factor of spacing for spring connection
                orientbind: 1.5,                                // multiply factor for orienting control cataloguing
                allowedspringtypes: STAD.springAllowedTees,     
                reserve_cpu_readbackspot: true,                 // if true, reserve a spot in the scratch pad
                collision_orbs_mode: "bad",                      // all collisino orbs (t=5, r=255,g=120,b=120) which side do they go on.
                paintjobs:[
                    {input:{r:126,g:103,b:103}, output:{r:50, g: 80, b: 90}},
                    {input:{r:41,g:32,b:99}, output:{r:120, g: 123, b: 42}}
                ]
            }
        );
        locationsOfTheseNewEntities = locationsOfTheseNewEntities.concat( faunalist );
    }


    
    var newPOintsMantaray = [];
    console.log('ALL_ENTITY_ROLES.MANTARAY1.ind', ALL_ENTITY_ROLES.MANTARAY1.ind)
    // Instance truckk
    STAD.instance_mantaray1 = addVoxelModelApplyOrientersAndBindNearest(
        middleSpawnPointX + 0.0, 6.0, middleSpawnPointY-6.0,// Behind the main guy
        newPOintsMantaray, theseNewDbEntries, getVoxelModel("mantaray1"),
        stdvoxeldensity, totalParticleIndexTracker,
        {
            debugrender: true,
            entityrole: ALL_ENTITY_ROLES.MANTARAY1,     // set the center nucleus (t=13)'s meta7 to (0=undefied, 1 = car,, 2 = ...???)
            bindunits: 4.0,                                 // multiply factor of spacing for spring connection
            orientbind: 2,                                  // multiply factor for orienting control cataloguing
            allowedspringtypes: STAD.springAllowedTees,     
            reserve_cpu_readbackspot: true,                 // if true, reserve a spot in the scratch pad
            collision_orbs_mode: "bad"                      // all collisino orbs (t=5, r=255,g=120,b=120) which side do they go on.
        }
    );
    locationsOfTheseNewEntities = locationsOfTheseNewEntities.concat( newPOintsMantaray );

    
    var newPointsSTarDestroyer = [];
    console.log('ALL_ENTITY_ROLES.STARDESTROYER.ind', ALL_ENTITY_ROLES.STARDESTROYER1.ind)
    // Instance truckk
    STAD.instance_stardestroyer1 = addVoxelModelApplyOrientersAndBindNearest(
        middleSpawnPointX-2.0, 12.0, middleSpawnPointY + 11.0,// Behind the main guy
        newPointsSTarDestroyer, theseNewDbEntries, getVoxelModel("stardestroyer1"),
        stdvoxeldensity, totalParticleIndexTracker,
        {
            debugrender: true,
            entityrole: ALL_ENTITY_ROLES.STARDESTROYER1,// set the center nucleus (t=13)'s meta7 to (0=undefied, 1 = car,, 2 = ...???)
            bindunits: 4.0,                                 // multiply factor of spacing for spring connection
            orientbind: 2.5,                                // multiply factor for orienting control cataloguing
            allowedspringtypes: STAD.springAllowedTees,     
            reserve_cpu_readbackspot: true,                 // if true, reserve a spot in the scratch pad
            collision_orbs_mode: "bad"                      // all collisino orbs (t=5, r=255,g=120,b=120) which side do they go on.
        }
    );
    locationsOfTheseNewEntities = locationsOfTheseNewEntities.concat( newPointsSTarDestroyer );



    var newpartsThudnercloud = [];
    console.log('ALL_ENTITY_ROLES.THUNDERCLOUD1.ind', ALL_ENTITY_ROLES.THUNDERCLOUD1.ind);
    // Instance truckk
    STAD.instance_thundercloud = addVoxelModelApplyOrientersAndBindNearest(
        middleSpawnPointX-6.0, 8.0, middleSpawnPointY-4.0,// Behind the main guy
        newpartsThudnercloud, theseNewDbEntries, getVoxelModel("thundercloud1"),
        stdvoxeldensity, totalParticleIndexTracker,
        {
            debugrender: true,
            entityrole: ALL_ENTITY_ROLES.THUNDERCLOUD1,     // set the center nucleus (t=13)'s meta7 to (0=undefied, 1 = car,, 2 = ...???)
            bindunits: 4.0,                                 // multiply factor of spacing for spring connection
            orientbind: 1.8,                                // multiply factor for orienting control cataloguing
            allowedspringtypes: STAD.springAllowedTees,     
            reserve_cpu_readbackspot: true,                 // if true, reserve a spot in the scratch pad
            collision_orbs_mode: "bad"                      // all collisino orbs (t=5, r=255,g=120,b=120) which side do they go on
        }
    );
    locationsOfTheseNewEntities = locationsOfTheseNewEntities.concat( newpartsThudnercloud );


    var carpetedRain = [];
    // carpetParticleHelper_InactiveGold( 5 * bucks_pacing, 4.0, 5 * bucks_pacing, // top left start location (x, and z increases)
    //     200, 0.13*bucks_pacing, // how many and the spacing 
    //     carpetedRain, totalParticleIndexTracker // objects that get changed in this function
    // );
    carpetParticleHelper_Water( 5 * bucks_pacing, 4.0, 5 * bucks_pacing, // top left start location (x, and z increases)
        200, 0.13*bucks_pacing, // how many and the spacing 
        carpetedRain, totalParticleIndexTracker // objects that get changed in this function
    );
    locationsOfTheseNewEntities = locationsOfTheseNewEntities.concat( carpetedRain );

    



    var START_OF_WEAPONS = totalParticleIndexTracker.totaldbs + 0;
    let alltheweaponslisted= [];
    console.log('Listing all', totalParticleIndexTracker.currentlistofweaponsparticles.length, 'registered weapons')
    for(let c = 0;c < totalParticleIndexTracker.currentlistofweaponsparticles.length;c++){
        theseNewDbEntries.push( totalParticleIndexTracker.currentlistofweaponsparticles[c] );
        totalParticleIndexTracker.totaldbs++;
        console.log(c,':->listing new weapon:', totalParticleIndexTracker.currentlistofweaponsparticles[c] )
    }

    console.log('total weapons:', totalParticleIndexTracker.weaponsind)
    



    
    // IF these numbers are off dont bother w the next step:

    if( totalParticleIndexTracker.val > maxParticles-2 ){
        console.log("ERR too BIG");
        throw new Error("idk what this is: "+ totalParticleIndexTracker.val + " / " +  maxParticles + "  - 2");
    }



    // Instance box boy
    // STAD.instance_boxboy = addVoxelModelApplyOrientersAndBindNearest(
    //     -2.0, 4.0, 3.0,
    //     locationsOfTheseNewEntities, theseNewDbEntries,
    //     getVoxelModel("normalbox"), stdvoxeldensity*1.5, totalParticleIndexTracker,
    //     {
    //         debugrender: true, 
    //         bindunits: 6

    //     }
    // );




    var START_OF_ENT_ROLES_IN_DB = 0 + totalParticleIndexTracker.totaldbs;

    for(let ff = 0;ff < entity_role_templates.length;ff++){
        theseNewDbEntries[totalParticleIndexTracker.totaldbs + 0] = entity_role_templates[ff].top_pull;
        theseNewDbEntries[totalParticleIndexTracker.totaldbs + 1] = entity_role_templates[ff].bottom_pull;
        theseNewDbEntries[totalParticleIndexTracker.totaldbs + 2] = (STAD[ ""+entity_role_templates[ff].target_id ]) ? (STAD[ ""+entity_role_templates[ff].target_id ].start + 1) : (0);
        theseNewDbEntries[totalParticleIndexTracker.totaldbs + 3] = entity_role_templates[ff].collide_with;
        theseNewDbEntries[totalParticleIndexTracker.totaldbs + 4] = entity_role_templates[ff].forward_engine;
        theseNewDbEntries[totalParticleIndexTracker.totaldbs + 5] = entity_role_templates[ff].backward_engine;
        theseNewDbEntries[totalParticleIndexTracker.totaldbs + 6] = entity_role_templates[ff].grav_pull;
        theseNewDbEntries[totalParticleIndexTracker.totaldbs + 7] = entity_role_templates[ff].user_ctrl_scheme;
        theseNewDbEntries[totalParticleIndexTracker.totaldbs + 8] = entity_role_templates[ff].top_bottom_mass_ratio;
        theseNewDbEntries[totalParticleIndexTracker.totaldbs + 9] = entity_role_templates[ff].rotation_engine;

        theseNewDbEntries[totalParticleIndexTracker.totaldbs + 10] = isNaN(entity_role_templates[ff].behaviour_type)?0:entity_role_templates[ff].behaviour_type;
        theseNewDbEntries[totalParticleIndexTracker.totaldbs + 11] = isNaN(entity_role_templates[ff].max_sight_range)?0:entity_role_templates[ff].max_sight_range;
        theseNewDbEntries[totalParticleIndexTracker.totaldbs + 12] = isNaN(entity_role_templates[ff].idle_activity)?0:entity_role_templates[ff].idle_activity;
        theseNewDbEntries[totalParticleIndexTracker.totaldbs + 13] = isNaN(entity_role_templates[ff].max_attack_range)?0:entity_role_templates[ff].max_attack_range;

        // This is the DB RN
        // console.log(theseNewDbEntries[totalParticleIndexTracker.totaldbs + 0]);
        // console.log(theseNewDbEntries[totalParticleIndexTracker.totaldbs + 1]);
        // console.log(theseNewDbEntries[totalParticleIndexTracker.totaldbs + 2]);
        // console.log(theseNewDbEntries[totalParticleIndexTracker.totaldbs + 3]);
        // console.log(theseNewDbEntries[totalParticleIndexTracker.totaldbs + 4]);
        // console.log(theseNewDbEntries[totalParticleIndexTracker.totaldbs + 5]);
        totalParticleIndexTracker.totaldbs += ENT_ROLES_SIZE;
    }



 
 
    // AT THE END OF THE POINTS ARRAY, add all the things together 
    var TOTAL_PARTICLE_COUNT = newBucketParticles.length + groundParticlesReservedForDeco.length + locationsOfTheseNewEntities.length;
 
    var listersMemSpace = maxLists*SIZE_LISTS_entry_size; 


    //totalIndexCount += listersMemSpace;

    console.log("=======================================================FINALBUFFER==========================")
    console.log('bucket space', totalBucketsMemSpace);

    console.log('GOOD   /   EVIL');
    console.log(totalParticleIndexTracker.goodguys + '  /   ' + totalParticleIndexTracker.badguys)

    // CHECK PARTICLES ARE SMALL ENOUGH
    if( TOTAL_PARTICLE_COUNT >= maxParticles-101){
        console.log('ERRR particles too big', TOTAL_PARTICLE_COUNT)
        throw new Error('bbaddd');
    }
    else{
        console.log('particles: used', TOTAL_PARTICLE_COUNT, 'of the', maxParticles);
        console.log('particle space', totalEntMemSpace);
    }

    // CHECK SPRINGS ARE SMOL ENOUGGF
    if( totalParticleIndexTracker.exsprcnt >= maxLists ){
        console.log('ERRR lists too big', totalParticleIndexTracker.exsprcnt, '(max', maxLists)
        throw new Error('bbaddd lists size');
    }
    else{
        console.log('sprngs: used', totalParticleIndexTracker.exsprcnt, 'of the', maxLists);
        console.log('lists space', listersMemSpace);
    }

    console.log('totalDbMemSpace', totalDbMemSpace);

    // Check the DB entries
    if( totalParticleIndexTracker.totaldbs >= maxDbEntries-14 ){// arbitrary buffer
        console.log('ERRR dbs too big', totalParticleIndexTracker.totaldbs, '(max', maxDbEntries)
        throw new Error('bbaddd db size');
    }
    else{
        console.log('db entries: used', totalParticleIndexTracker.totaldbs, 'of the', maxDbEntries);
        console.log('dp space', "????");
    }

    // ADD MUSIC SLOTS LOOOL
    
    var START_SFX = totalParticleIndexTracker.totalcpu;// + STAD.MUSIC_SLOTS*STAD.MUSIC_SLT_SIZE;
    for(let dd = 0;dd < STAD.MUSIC_SLOTS*STAD.MUSIC_SLT_SIZE;dd++){

    }

    // Check the scratch pad is not exceeded
    if( totalParticleIndexTracker.totalcpu >= STAD.ENT_SCRATCH_PAD_SIZE - 13 ){   // arbitrary abuffer
        console.log('ERRR cpu scratch pad too big', totalParticleIndexTracker.totalcpu, '(max', STAD.ENT_SCRATCH_PAD_SIZE)
        throw new Error('bbaddd scratchpad size');
    }
    else{
        console.log('scratch pad spots reserved', totalParticleIndexTracker.totalcpu, 'of the', STAD.ENT_SCRATCH_PAD_SIZE); 
    }
    
    //                                              // bucket space         max parts                       springs                         extra lists n
    var RAW_POINTS  = new Float32Array( totalBucketsMemSpace + (maxParticles * SIZE_ENTS) + (maxLists * SIZE_LISTS_entry_size) + (maxDbEntries * SIZE_DBS));

    for(let i = 0;i < RAW_POINTS.length;i++){
        // All the values for the buckets
        if( i < START_PARTICLES){
            RAW_POINTS[i] = 0;
        }
        else{
            RAW_POINTS[i] = 0;
        }
    }


    

    // -------------------------------------------------------
    // Spread out springs in order
    // looking at entities first
    // -------------------------------------------------------

 
    let springIndTracker = 0;
    console.log('START_LISTS is now', START_LISTS);

    for (let i = 0; i < locationsOfTheseNewEntities.length; i++) {
        for (let j = 0; j < locationsOfTheseNewEntities[i].springList.length; j++) {
            let pt = locationsOfTheseNewEntities[i].springList[j];
            RAW_POINTS[START_LISTS + (springIndTracker*SIZE_LISTS_entry_size) + 0] = Math.floor(pt.to);
            RAW_POINTS[START_LISTS + (springIndTracker*SIZE_LISTS_entry_size) + 1] = pt.rest;
            RAW_POINTS[START_LISTS + (springIndTracker*SIZE_LISTS_entry_size) + 2] = pt.strength;

            if( j === 0){
                locationsOfTheseNewEntities[i].meta1 = springIndTracker+1;// add one so you know it's active, then when using this value in the shader one is simply subtracted off
                locationsOfTheseNewEntities[i].meta1p =springIndTracker+1;// add one so you know it's active, then when using this value in the shader one is simply subtracted off
                locationsOfTheseNewEntities[i].meta2 = locationsOfTheseNewEntities[i].springList.length;
                locationsOfTheseNewEntities[i].meta2p =locationsOfTheseNewEntities[i].springList.length; 
            }

            springIndTracker += 1;//SIZE_LISTS_entry_size;
        }

        
        // INSTALL the collision ball IDs
        if( locationsOfTheseNewEntities[i].t === 2 || 
            locationsOfTheseNewEntities[i].t === 4 ||
            (locationsOfTheseNewEntities[i].t >= 6 && locationsOfTheseNewEntities[i].t <= 12 ) ){
            
            locationsOfTheseNewEntities[i].meta7 = locationsOfTheseNewEntities[i].currclosestcollball;
            locationsOfTheseNewEntities[i].meta7p = locationsOfTheseNewEntities[i].currclosestcollball;

            // console.log('ok one found at ', i)
            // console.log(locationsOfTheseNewEntities[i].sectionIndexOneDBEntry)
        }
        
        // if(locationsOfTheseNewEntities[i].t === 6){
        //     console.log('ok one found at ', i)
        //     console.log(locationsOfTheseNewEntities[i].sectionIndexOneDBEntry)
        // }

        locationsOfTheseNewEntities[i].meta3 = locationsOfTheseNewEntities[i].sectionIndexOneDBEntry;
        locationsOfTheseNewEntities[i].meta3p = locationsOfTheseNewEntities[i].sectionIndexOneDBEntry;

        locationsOfTheseNewEntities[i].meta4 = locationsOfTheseNewEntities[i].desiredR;
        locationsOfTheseNewEntities[i].meta4p = locationsOfTheseNewEntities[i].desiredR;

        locationsOfTheseNewEntities[i].meta5 = locationsOfTheseNewEntities[i].desiredG;
        locationsOfTheseNewEntities[i].meta5p = locationsOfTheseNewEntities[i].desiredG;
        
        locationsOfTheseNewEntities[i].meta6 = locationsOfTheseNewEntities[i].desiredB;
        locationsOfTheseNewEntities[i].meta6p = locationsOfTheseNewEntities[i].desiredB;


    }




    var finalConcatedPointArray = newBucketParticles.concat(groundParticlesReservedForDeco.concat(locationsOfTheseNewEntities));

    // -------------------------------------------------------
    // 5) Pack final data into RAW_POINTS
    // -------------------------------------------------------
    for (let i = 0; i < finalConcatedPointArray.length; i++) {

 
        let pt = finalConcatedPointArray[i];
         
        RAW_POINTS[START_PARTICLES + i*psize + 0] = pt.t;
        RAW_POINTS[START_PARTICLES + i*psize + 1] = pt.x;
        RAW_POINTS[START_PARTICLES + i*psize + 2] = pt.y;
        RAW_POINTS[START_PARTICLES + i*psize + 3] = pt.z;
        RAW_POINTS[START_PARTICLES + i*psize + 4] = pt.vx;
        RAW_POINTS[START_PARTICLES + i*psize + 5] = pt.vy;
        RAW_POINTS[START_PARTICLES + i*psize + 6] = pt.vz;
        RAW_POINTS[START_PARTICLES + i*psize + 7] = pt.meta1;
        RAW_POINTS[START_PARTICLES + i*psize + 8] = pt.meta2;
        RAW_POINTS[START_PARTICLES + i*psize + 9] = pt.meta3;
        RAW_POINTS[START_PARTICLES + i*psize + 10] = pt.meta4;
        RAW_POINTS[START_PARTICLES + i*psize + 11] = pt.meta5;
        RAW_POINTS[START_PARTICLES + i*psize + 12] = pt.meta6;
        RAW_POINTS[START_PARTICLES + i*psize + 13] = pt.meta7;
        RAW_POINTS[START_PARTICLES + i*psize + 14] = pt.meta8;
        RAW_POINTS[START_PARTICLES + i*psize + 15] = pt.tp;
        RAW_POINTS[START_PARTICLES + i*psize + 16] = pt.xp;
        RAW_POINTS[START_PARTICLES + i*psize + 17] = pt.yp;
        RAW_POINTS[START_PARTICLES + i*psize + 18] = pt.zp;
        RAW_POINTS[START_PARTICLES + i*psize + 19] = pt.vxp;
        RAW_POINTS[START_PARTICLES + i*psize + 20] = pt.vyp;
        RAW_POINTS[START_PARTICLES + i*psize + 21] = pt.vzp;
        RAW_POINTS[START_PARTICLES + i*psize + 22] = pt.meta1p;
        RAW_POINTS[START_PARTICLES + i*psize + 23] = pt.meta2p;
        RAW_POINTS[START_PARTICLES + i*psize + 24] = pt.meta3p;
        RAW_POINTS[START_PARTICLES + i*psize + 25] = pt.meta4p;
        RAW_POINTS[START_PARTICLES + i*psize + 26] = pt.meta5p;
        RAW_POINTS[START_PARTICLES + i*psize + 27] = pt.meta6p;
        RAW_POINTS[START_PARTICLES + i*psize + 28] = pt.meta7p;
        RAW_POINTS[START_PARTICLES + i*psize + 29] = pt.meta8p;

        // let unusedspringslots = 0; 
        // for (let b = 0; b < numsprings; b++) {
        //     if( pt.sprs[b] < 1 ){
        //         unusedspringslots++;
        //         allDeactiveSprings++;
        //     }
        //     else{
        //         allActiveSprings++;
        //     }
        //     RAW_POINTS[i*psize + 10 + b*2]     = pt.sprs[b];
        //     RAW_POINTS[i*psize + 10 + b*2 + 1] = pt.sdists[b];
        // } 
        // console.log(i, 'unusedspringslots', unusedspringslots);
    }

    
    // Check what wen twront potneatl
    for(let h = 0;h < theseNewDbEntries.length;h++){
        if(isNaN(theseNewDbEntries[h])){
            console.log('failed isNaN CHeck at ', h)
            throw new Error('Somethgin FOUL added to db')
        }
    }
    

    console.log("theseNewDbEntries");
    console.log(theseNewDbEntries);

    // ADd all trhe DB entries
    for (let i = 0; i < theseNewDbEntries.length; i++) {
        RAW_POINTS[START_DB + i] = theseNewDbEntries[i];
    }


    // Testing area
    // console.log('SPRINGS START AT: ', START_LISTS)
    // console.log('looking at god damn springs')
    // for(let h = 0;h < 32;h++){
    //     console.log(h, ':',RAW_POINTS[START_LISTS + h]);
    //     // let to = RAW_POINTS[START_LISTS + (h*SIZE_LISTS_entry_size) + 0];
    //     // let rest = RAW_POINTS[START_LISTS + (h*SIZE_LISTS_entry_size) + 1];
    //     // let strneght = RAW_POINTS[START_LISTS + (h*SIZE_LISTS_entry_size) + 2];
    //     // console.log(h, '---', to, rest, strneght)
    // }
 
    let spreadout = 'ett == ' + STAD.springAllowedTees[0]+'u';
    for(let b = 1;b < STAD.springAllowedTees.length;b++){
        spreadout += ' || ett == ' + STAD.springAllowedTees[b]+'u';
    }
    spreadout += '';

    
    let specphysspreadt = 'ett == ' + STAD.particleSpecialPhysics[0]+'u';
    for(let b = 1;b < STAD.particleSpecialPhysics.length;b++){
        specphysspreadt += ' || ett == ' + STAD.particleSpecialPhysics[b]+'u';
    }
    specphysspreadt += '';
    
    
    //console.log('all live:', allActiveSprings, ' |  all dead:', allDeactiveSprings)

    return {
        totalParticleCount: maxParticles,
        oneParticleSize:    entityTemplateSize,
        bucketsPerimeter:   STAD.BUCKET_PERIMETER,   //64 
        allBucketParticles: STAD.BUCKET_PERIMETER*STAD.BUCKET_PERIMETER,
        collisionListSize,  // 25 entries i/o (so *2 it)
        totalStructures:    1,
        RAW_POINTS,
        START_SCRATCH,
        START_COLLS,
        START_PARTICLES,
        PARTICLE_ATTRIBUTES,
        START_LISTS,
        SIZE_LISTS_entry_size,
        entityUpdateSweepCycle,
        STD_GRAV: STAD.STD_GRAV,
        START_DB,
        MAX_COLLIDABLES,
        MAX_COLL_GOOD_GUYS,
        MAX_COLL_BAD_GUYS,
        allowedTeesInSprings: spreadout,
        KEY_PROTAGONIST: STAD.instance_urfish.nucleus,
        SCALE_SPACING_CONSTANT: spacing,
        BUCKET_SPACING: bucks_pacing,
        INNER_CIRCLE: innerCircleSpawnRatio,// how deep into the middle the spawning and stuff occurs

        START_OF_SPAWN_X: startOfRandoSquareX,
        START_OF_SPAWN_Y: startOfRandoSquareY,
        SPAWN_SIZE_X: spawnAreaLengthX,
        SPAWN_SIZE_Y: spawnAreaLengthY,

        ENT_SCRATCH_PAD_SIZE: STAD.ENT_SCRATCH_PAD_SIZE,
        currentgood: totalParticleIndexTracker.goodguys,
        currentbad: totalParticleIndexTracker.badguys,
        ENT_ROLES_SIZE,
        START_OF_ENT_ROLES_IN_DB,
        TOTAL_READBACKS: totalParticleIndexTracker.totalreadbacks,
        WRITE_SLOT_SIZE: STAD.WRITE_SLOT_SIZE,
        allowedSpecParticlePhys: specphysspreadt,
        RES_PART_SIZE: STAD.RSRVED_PARTICLE_SIZE,
        START_SFX,
        TOTAL_SFXS: STAD.MUSIC_SLOTS,
        SIZE_SFX_SLOT: STAD.MUSIC_SLT_SIZE,
        TOTAL_CPU_BUFFER_SIZE: totalParticleIndexTracker.totalreadbacks,
        WEAPONS_REGISTERED: totalParticleIndexTracker.weaponsind,
        START_OF_WEAPONS
    };
}
