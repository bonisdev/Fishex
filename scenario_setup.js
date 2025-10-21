


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
        STD_BUBL:               -0.00012,    // float upwards

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
                                19],  // explosion 1 weapon
                                //20 ],  NOT ALLOWED SPRINGS, the spr id  slot is used for if its armed or not // laser 1 weapon

                                //21], // ehh probs not necessary for the air drifert particle
                                //22], // also probns not necessary for the bubble collection
        
        // Important for special physics on particles i guess
        particleSpecialPhysics: [ 14, // dormant particle

                                15,   // water particle
                                16,   // dormant gold
                                17,   // active gold
                                18, // decoration imprints used as like temprary model hodlers for stuff
                                19, //explosion 1
                                20,// laser 1 weapon

                                21 ,// air drifter particle decoration usually to t19, and t20 weapons
                                22 ],// bubbles that drift upwards

        consideredWeapons:      [ 19, // explosion 1 weapon
                                20 ],//laser 1 weapon

        inOrderEnts:                [],

        // thebucketsidk:              null,
        // thegroundparts:             null,
        // instance_mega_cube_1:       null,
        // instance_mega_cube_2:       null,

        // instance_urfish:            null,

        // instance_beachball1:        null,

        // instance_plecko1:           null,

        // instance_playfulfish1:      null,
        // instance_playfulfish2:      null,

        SPECIAL_COLOUR_INSTRUCTIONS_SIZE: 4,    // r,g,b and MODE
    }
}




function returnAllStructures( customScenarioObject ) {




    var seedtouse = '' + generatedSeed;
    EZWG.SHA1.seed(seedtouse);

    // Useful for keeping track of values to use for 
    var STAD = initNewEntityDictionary();
    
    var spacing = 0.3;     // Spacing between the particles inside the cube structure
    STAD.spacing = spacing;

    var stdvoxeldensity = 0.09;
    STAD.stdvoxeldensity = stdvoxeldensity;

    var titevoxeldensity = 0.075;
    STAD.titevoxeldensity = titevoxeldensity;

    var minivoxeldensity = 0.03;
    STAD.minivoxeldensity = minivoxeldensity;

    var bucks_pacing = 1.0;// Spacing between grid entities
    STAD.bucks_pacing = bucks_pacing;

    var innerCircleSpawnRatio = 0.15;// how much of the radiuso nthe sinse
    STAD.innerCircleSpawnRatio = innerCircleSpawnRatio;



    // Extra voxel sizing paramters
    STAD.largervoxeldensity = STAD.stdvoxeldensity * 1.4;// for larger spacing of voxels to fill the extra spacin
    STAD.larger_voxel_sizer = 1.62;// (for mega worm and larger buildings)


    var COLLISION_ORB_TYPE_GOOD = 0;
    var COLLISION_ORB_TYPE_BAD = 0;

    var BEHAVIOUR_TYPES = {
        JUST_CHILL: 0,      // 0 = do not move ( ONLY APPLIES IF AI)
        MOVE_TOWRDS: 1,     // 1 = move towards your target_id ( ONLY APPLIES IF AI)
        RANDOM_3D: 2,       // 2 = go to random location for movement( ONLY APPLIES IF AI)
        RANDOM_GROUND: 3,   // 3 = go to random location on the ground (ONLY APPLIES IF AI)
        INTELLIGENT_CTRL: 4,        // 4 = determined by what the user selected
        RANDOM_BOMBARDER: 5     // 5 = only applies if AI stay up and bomb random targets w LASER
    };




    // How many f32's an ent role takes up
    // this number expands the more complicated roles get
    var ENT_ROLES_SIZE = 18;
    STAD.ENT_ROLES_SIZE = ENT_ROLES_SIZE;


    // CUSTOM OBJECT INFO
    var SCENARIO_TYPE = customScenarioObject ? customScenarioObject.type : "";
    // ^ always "soloarcade" i think

    // Starter number for the scenario object
    var SCENARIO_STARTER_NUMBER = customScenarioObject ? customScenarioObject.starting : -1;




    // ____    _   _   _____   _____   _____   ____  
    // | __ )  | | | | |  ___| |  ___| | ____| |  _ \ 
    // |  _ \  | | | | | |_    | |_    |  _|   | |_) |
    // | |_) | | |_| | |  _|   |  _|   | |___  |  _ < 
    // |____/   \___/  |_|     |_|     |_____| |_| \_\
                                                   
    //  ____    _____   _____   ___   ____            
    // / ___|  | ____| |_   _| |_ _| |  _ \           
    // \___ \  |  _|     | |    | |  | |_) |          
    //  ___) | | |___    | |    | |  |  __/           
    // |____/  |_____|   |_|   |___| |_|              
                                                   









    
    var icspr = innerCircleSpawnRatio;
    STAD.icspr = icspr;
    var oneSideLength = STAD.BUCKET_PERIMETER * bucks_pacing;
    STAD.oneSideLength = oneSideLength;

    
    
    var middleSpawnPointX = oneSideLength/2;
    STAD.middleSpawnPointX = middleSpawnPointX;
    var middleSpawnPointY = oneSideLength/2;
    STAD.middleSpawnPointY = middleSpawnPointY;

    var startOfRandoSquareX =  (oneSideLength-(icspr*oneSideLength)) / 2;
    STAD.startOfRandoSquareX = startOfRandoSquareX;
    var startOfRandoSquareY =  (oneSideLength-(icspr*oneSideLength)) / 2;
    STAD.startOfRandoSquareY = startOfRandoSquareY;

    var spawnAreaLengthX = oneSideLength * icspr;
    STAD.spawnAreaLengthX = spawnAreaLengthX;
    var spawnAreaLengthY = oneSideLength * icspr;
    STAD.spawnAreaLengthY = spawnAreaLengthY;
    


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
        currentlistofweaponsparticles: [],// THE particle id's of the weapons (to be added to DB)

        allTheTealParticles: [],// store all the guys <- NOT USED!!!!!!!??????????


        currentlistofspecialparticlemovements: [],// THE rgb colours of the identifying (to be added to DB)
        specialparticlemovementssize: STAD.SPECIAL_COLOUR_INSTRUCTIONS_SIZE // size 4 r,g,b  and mode


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


        






    //  ____     ____   _____   _   _             
    // / ___|   / ___| | ____| | \ | |            
    // \___ \  | |     |  _|   |  \| |            
    //  ___) | | |___  | |___  | |\  |            
    // |____/   \____| |_____| |_| \_|            
                                               
    //     _      ____    ___    ___              
    //    / \    |  _ \  |_ _|  / _ \             
    //   / _ \   | |_) |  | |  | | | |            
    //  / ___ \  |  _ <   | |  | |_| |            
    // /_/   \_\ |_| \_\ |___|  \___/             
                                               
    //      ____    _____   _   _   _____   _____ 
    //     / ___|  |_   _| | | | | |  ___| |  ___|
    //     \___ \    | |   | | | | | |_    | |_   
    //      ___) |   | |   | |_| | |  _|   |  _|  
    //     |____/    |_|    \___/  |_|     |_|    
                                               
                                               
              

    // DONTUT CHANGE - ADD RESERVED PARTICLES for EntitYRoles - add reserved here

    // Ok now build out the database
    // For each new type add it on here:
    var entity_role_templates = [];     // JUST A LINEAR INDEXING OF ALL THE ENTITY ROLES                                 
                                               
        
 
    // Contains all the collision enabled entities 
    var locationsOfTheseNewEntities = [];   //(maxEntities)

     
    // Title screen                           
    if( !customScenarioObject ){
        console.log(' TITLE SCREEN ==============================================');
        STAD.locationsOfTheseNewEntities = 
            SS_titleScreenSetter( locationsOfTheseNewEntities, theseNewDbEntries, totalParticleIndexTracker, entity_role_templates, STAD );


    }
    // Spec game
    else{
        console.log(' GAME SCENARIO LOAD =============================================')
        console.log( JSON.stringify(customScenarioObject));

        // Create a player object and tie it to da thing
        INTELLIGENTLY_CONTROLLED = [
            {tealind: -1, human: true}   // the entity youre contorlling teal ind (as the CPU details it)
        ];

        // Set this client to the only controller slot avaialble
        THIS_CLIENT_CONTROL_IND = 0;

        // Spongebob city scape
        if( customScenarioObject.starting === 0 || customScenarioObject.starting === 1 ){
            STAD.locationsOfTheseNewEntities = 
                startSpongeCity( customScenarioObject, locationsOfTheseNewEntities, theseNewDbEntries, totalParticleIndexTracker, entity_role_templates, STAD );
        }
        // Spoongebob surgery
        else if(customScenarioObject.starting === 2){
            STAD.locationsOfTheseNewEntities = 
                startBumblebeeSim( customScenarioObject, locationsOfTheseNewEntities, theseNewDbEntries, totalParticleIndexTracker, entity_role_templates, STAD );
        }


        // STAD.locationsOfTheseNewEntities = 
        //     startRogueLike( locationsOfTheseNewEntities, theseNewDbEntries, totalParticleIndexTracker, entity_role_templates, STAD );


    }

    
















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


    
    var START_OF_ALL_TEAL_PARTICLES = 0 + totalParticleIndexTracker.totaldbs;

    for(let teaa = 0;teaa < totalParticleIndexTracker.allTheTealParticles.length;teaa++){
        theseNewDbEntries[totalParticleIndexTracker.totaldbs + 0] = totalParticleIndexTracker.allTheTealParticles[teaa];
        totalParticleIndexTracker.totaldbs += 1;
    }



    
    var START_OF_SPECIAL_PARTICLES = 0 + totalParticleIndexTracker.totaldbs;
    
    // Add the custom custom_movement_rules
    let cust_rules_to_add = [];
    var uncompressedInd = 0;
    for(let ff = 0;ff < entity_role_templates.length;ff++){

        let stacksOfColoursAndModes = entity_role_templates[ff].custom_movement_rules ? entity_role_templates[ff].custom_movement_rules: [];
        //cust_rules_to_add.push( totalParticleIndexTracker.totaldbs );
        cust_rules_to_add.push( uncompressedInd )

        for(let hh = 0;hh < stacksOfColoursAndModes.length;hh++){

            theseNewDbEntries[totalParticleIndexTracker.totaldbs + 0] = stacksOfColoursAndModes[hh].identifying_colour.r;
            theseNewDbEntries[totalParticleIndexTracker.totaldbs + 1] = stacksOfColoursAndModes[hh].identifying_colour.g;
            theseNewDbEntries[totalParticleIndexTracker.totaldbs + 2] = stacksOfColoursAndModes[hh].identifying_colour.b;
            theseNewDbEntries[totalParticleIndexTracker.totaldbs + 3] = stacksOfColoursAndModes[hh].mode;

            totalParticleIndexTracker.totaldbs += STAD.SPECIAL_COLOUR_INSTRUCTIONS_SIZE;
            uncompressedInd++;
        }
        

    }





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

        theseNewDbEntries[totalParticleIndexTracker.totaldbs + 10] = isNaN(entity_role_templates[ff].behaviour_type)    ?0:entity_role_templates[ff].behaviour_type;
        theseNewDbEntries[totalParticleIndexTracker.totaldbs + 11] = isNaN(entity_role_templates[ff].max_sight_range)   ?0:entity_role_templates[ff].max_sight_range;
        theseNewDbEntries[totalParticleIndexTracker.totaldbs + 12] = isNaN(entity_role_templates[ff].idle_activity)     ?0:entity_role_templates[ff].idle_activity;
        theseNewDbEntries[totalParticleIndexTracker.totaldbs + 13] = isNaN(entity_role_templates[ff].max_attack_range)  ?0:entity_role_templates[ff].max_attack_range;

        theseNewDbEntries[totalParticleIndexTracker.totaldbs + 14] = isNaN(entity_role_templates[ff].voxel_sizer)?1.0:entity_role_templates[ff].voxel_sizer;

        theseNewDbEntries[totalParticleIndexTracker.totaldbs + 15] = entity_role_templates[ff].custom_movement_rules ? entity_role_templates[ff].custom_movement_rules.length : 0;
        theseNewDbEntries[totalParticleIndexTracker.totaldbs + 16] = cust_rules_to_add[ff];

        theseNewDbEntries[totalParticleIndexTracker.totaldbs + 17] =  isNaN(cust_rules_to_add[ff].wants_entity_role) ? -1: cust_rules_to_add[ff].wants_entity_role;

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
    var TOTAL_PARTICLE_COUNT = newBucketParticles.length +  STAD.locationsOfTheseNewEntities.length;
 
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

    for (let i = 0; i < STAD.locationsOfTheseNewEntities.length; i++) {
        for (let j = 0; j < STAD.locationsOfTheseNewEntities[i].springList.length; j++) {
            let pt = STAD.locationsOfTheseNewEntities[i].springList[j];
            RAW_POINTS[START_LISTS + (springIndTracker*SIZE_LISTS_entry_size) + 0] = Math.floor(pt.to);
            RAW_POINTS[START_LISTS + (springIndTracker*SIZE_LISTS_entry_size) + 1] = pt.rest;
            RAW_POINTS[START_LISTS + (springIndTracker*SIZE_LISTS_entry_size) + 2] = pt.strength;

            if( j === 0){
                STAD.locationsOfTheseNewEntities[i].meta1 = springIndTracker+1;// add one so you know it's active, then when using this value in the shader one is simply subtracted off
                STAD.locationsOfTheseNewEntities[i].meta1p =springIndTracker+1;// add one so you know it's active, then when using this value in the shader one is simply subtracted off
                STAD.locationsOfTheseNewEntities[i].meta2 = STAD.locationsOfTheseNewEntities[i].springList.length;
                STAD.locationsOfTheseNewEntities[i].meta2p =STAD.locationsOfTheseNewEntities[i].springList.length; 
            }

            springIndTracker += 1;//SIZE_LISTS_entry_size;
        }

        
        // INSTALL the collision ball IDs
        if( STAD.locationsOfTheseNewEntities[i].t === 2 || 
            STAD.locationsOfTheseNewEntities[i].t === 4 ||
            (STAD.locationsOfTheseNewEntities[i].t >= 6 && STAD.locationsOfTheseNewEntities[i].t <= 12 ) ){
            
            STAD.locationsOfTheseNewEntities[i].meta7 = STAD.locationsOfTheseNewEntities[i].currclosestcollball;
            STAD.locationsOfTheseNewEntities[i].meta7p = STAD.locationsOfTheseNewEntities[i].currclosestcollball;

            // console.log('ok one found at ', i)
            // console.log(STAD.locationsOfTheseNewEntities[i].sectionIndexOneDBEntry)
        }
        
        // if(STAD.locationsOfTheseNewEntities[i].t === 6){
        //     console.log('ok one found at ', i)
        //     console.log(STAD.locationsOfTheseNewEntities[i].sectionIndexOneDBEntry)
        // }

        STAD.locationsOfTheseNewEntities[i].meta3 = STAD.locationsOfTheseNewEntities[i].sectionIndexOneDBEntry;
        STAD.locationsOfTheseNewEntities[i].meta3p = STAD.locationsOfTheseNewEntities[i].sectionIndexOneDBEntry;

        STAD.locationsOfTheseNewEntities[i].meta4 = STAD.locationsOfTheseNewEntities[i].desiredR;
        STAD.locationsOfTheseNewEntities[i].meta4p = STAD.locationsOfTheseNewEntities[i].desiredR;

        STAD.locationsOfTheseNewEntities[i].meta5 = STAD.locationsOfTheseNewEntities[i].desiredG;
        STAD.locationsOfTheseNewEntities[i].meta5p = STAD.locationsOfTheseNewEntities[i].desiredG;
        
        STAD.locationsOfTheseNewEntities[i].meta6 = STAD.locationsOfTheseNewEntities[i].desiredB;
        STAD.locationsOfTheseNewEntities[i].meta6p = STAD.locationsOfTheseNewEntities[i].desiredB;


    }




    var finalConcatedPointArray = newBucketParticles.concat( STAD.locationsOfTheseNewEntities );

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

    if(!STAD.bottomMudMeta){
        STAD.bottomMudMeta = {start: 0, size: 0};
    }

    return {
        totalParticleCount: maxParticles,
        oneParticleSize:    entityTemplateSize,
        bucketsPerimeter:   STAD.BUCKET_PERIMETER,   //64 
        allBucketParticles: STAD.BUCKET_PERIMETER*STAD.BUCKET_PERIMETER,
        collisionListSize,  // 25 entries i/o (so *2 it)
        collisionFidelity: 4,// every 4 steps it gets through checking all the coll5's
        RAW_POINTS,
        START_SCRATCH,
        START_COLLS,
        START_PARTICLES,
        PARTICLE_ATTRIBUTES,
        START_LISTS,
        SIZE_LISTS_entry_size,
        entityUpdateSweepCycle,
        STD_GRAV: STAD.STD_GRAV,
        STD_BUBL: STAD.STD_BUBL,
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

        MIDDLE_SPAWN_X: middleSpawnPointX,
        MIDDLE_SPAWN_Y: middleSpawnPointY,

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
        START_OF_WEAPONS,

        MUD_START: STAD.bottomMudMeta.start,
        MUD_SIZE: STAD.bottomMudMeta.size,

        SCENARIO_TYPE,  //"soloarcade"

        SCENARIO_STARTER_NUMBER, // can be -1 if title screen or 0,1,2,3,4,5,6,7

        START_OF_SPECIAL_PARTICLES,    // start of db ind where the values are
        SPECIAL_COLOUR_INSTRUCTIONS_SIZE: STAD.SPECIAL_COLOUR_INSTRUCTIONS_SIZE,

        START_OF_ALL_TEAL_PARTICLES,
        TOTAL_TEAL_PARTICLES: totalParticleIndexTracker.allTheTealParticles.length,
    };
}
