

// All the functions for building the environment first.


var GLOBV = {
    ENT_ROLE: {         // THIS VALUE assigned to roles on the m7 of t=13 entities (NUCLEUS TYPE)
        UNIDENTIFIED:   0,      // idk nothing
        FORWARD_CAR:    1,      // a car
        LAKITU_CLOUD:   2,      // camera trained on the coordinates of the first scratch pad 
        ENEMY_CAR:      3,      // bad car
 
    }
}
 

function processEntities(locsOfetheseentites) {
    const tCounts = {}; // To keep track of counts for each unique 't'
    let mismatchFound = false; // Flag to track mismatches

    // Iterate through the array
    locsOfetheseentites.forEach((entity, index) => {
        if (entity.tp !== entity.t) {
            console.error(`Error: Mismatch at index ${index}, tp: ${entity.tp}, t: ${entity.t}`);
            mismatchFound = true;
        }

        // Count occurrences of each unique 't'
        tCounts[entity.t] = (tCounts[entity.t] || 0) + 1;
    });

    // Print out the statistics for 't'
    console.log('Statistics for unique values of t:');
    for (const [key, count] of Object.entries(tCounts)) {
        console.log(`t = ${key}: ${count}`);
    }

    // If there was a mismatch, throw an error
    if (mismatchFound) {
        throw new Error('Mismatch between tp and t detected in the array!');
    }
}


function packThreeBytesToF32(r, g, b) {
    // Normalize each value to a range between 0 and 1
    return (r / 255.0) + (g / 255.0) / 256.0 + (b / 255.0) / 65536.0;
}
function getModeOrBlend(colorArray) {
    if (!Array.isArray(colorArray) || colorArray.length === 0) {
        // Return a default value or handle the empty case
        return { r: 0, g: 0, b: 0 }; // Default to black
    }

    const rCounts = {}, gCounts = {}, bCounts = {};
    let rSum = 0, gSum = 0, bSum = 0;

    colorArray.forEach(({ r, g, b }) => {
        rCounts[r] = (rCounts[r] || 0) + 1;
        gCounts[g] = (gCounts[g] || 0) + 1;
        bCounts[b] = (bCounts[b] || 0) + 1;

        rSum += r;
        gSum += g;
        bSum += b;
    });

    const getMode = (counts) => {
        let maxCount = 0;
        let modeValue = null;

        for (const [key, value] of Object.entries(counts)) {
            const numericKey = Number(key);
            if (value > maxCount) {
                maxCount = value;
                modeValue = numericKey;
            }
        }
        return modeValue;
    };

    const modeR = getMode(rCounts);
    const modeG = getMode(gCounts);
    const modeB = getMode(bCounts);

    const areAllSame = colorArray.every(({ r, g, b }) =>
        r === modeR && g === modeG && b === modeB
    );

    if (areAllSame) {
        const blendR = Math.round(rSum / colorArray.length);
        const blendG = Math.round(gSum / colorArray.length);
        const blendB = Math.round(bSum / colorArray.length);
        return { r: blendR, g: blendG, b: blendB };
    }

    return { r: modeR, g: modeG, b: modeB };
}


// const packedF32 = packThreeBytesToF32(r, g, b);

function createParticle( xxx, yyy, zzz, idd ){
    var vxx = 0;// * (EZWG.SHA1.random()*0.003 - 0.0015);
    var vyy = 0;// * (EZWG.SHA1.random()*0.003 - 0.0015);
    var vzz = 0;// * (EZWG.SHA1.random()*0.003 - 0.0015);
    let nuPoint = {
        id: idd,

        t: 0,  // type or whatever 

        x: xxx,
        y: yyy,
        z: zzz,

        vx: vxx,
        vy: vyy,
        vz: vzz,

        meta1: 0,
        meta2: 0,
        meta3: 0,
        meta4: 0,
        meta5: 0,
        meta6: 0,
        meta7: 0,
        meta8: 0,


        // Alternate values to safely write-to
        tp: 0,  //////////////////////////////////
        //
        //          *NOTE ....
        //              
        //                      . types determine how to interpret the meta1,2,3 variables
        //
        //                          
        // Type 0 = no update
        // Type 1 = collision bucket (STAD.BUCKET_PERIMETER*STAD.BUCKET_PERIMETER)
        // Type 2 = normal spring-havers
        // Type 3 = ground, i guess idk what this is going to be for
        // Type 4 = deactivated spring
        // Type 5 = coll wrapper
        // Type 6 = player controlled front
        // Type 7 = player controlled back
        // Type 8 = player controlled top
        // Type 9 = player controlled bottom
        // Type 10 = player controlled left
        // Type 11 = player controlled right
        // Type 12 = player controlled middle
        // Type 13 = a nucleus (db goes to the entity entry) (ONLY ONE OF THESE PER ENTITY - in the very center)
        // Type 14 = dormant particle - glue yourself to your designated home teal particle IF it's greater than 0
        // Type 15 = water particle fr -  just fall normally except when you are below a certain altitude
        // Type 16 = gold particle waiting - just
        // Type 17 = active gold particle
        // Type 18 = Marker Decoration particle (target reticle)
        // Type 19 = Explosion (Weapon) (All Particles)
        // Type 20 = Laser (Weapon) (All Particles)
        // Type 21 = Air floating particle (usually part of a reserved particle weapons system) (from 19 and 20?)
            //m1:   Spr loc ind
            //m2:   Sprz size
            //m3:   the teal block id   (Type 13: entity ind in the db(+1'd))     <- -- | (also,t14,t15,t16,t17,t18,t19,t20,t21<-tealblock)
            //m4:   desired col R           t20 x direction laser|   <- *gets changed (if springs get deactivaed) |t19=id target(+1'd)   
            //m5:   desired col G           t20 y direction laser   |                                               t19=explos radius   
            //m6:   desired col B      t20 z direction laser |   (Type 19=0 = off. 1 = armed and traveling) 
            //m7:       (t2,4,6-12)CollBallClosestProblemID | (t5) RADIUS of the collision thing
            //          Type13=EntityRole  | (t14)TypeOfParticleToTurnInto...  t15, t16, t17, t18, t19, t20, t21 = CounterTimerUpwards
            //m8:       (t5: index 1'd closest other coll ball particle )  | (type 12/13:)  scratchpad ind (+1'd)
            //          (t14 & t15 t16,t17,t18,t19, t20, t21)?the reserve particle group (0,1,2,3 ...)  on this entity role...    ??>Nothing = 
            //                                                                          |
            //                                                                          |
            //                                                                          |
            // * NOTE: Type13, m3, is the index in the read only db to get metainfo<--- |
            //         [0-6], particle ids for the orienter, (0 if none) (index 1'd)    |
            //          [7], cpu scratch location (0 if none)        (index 1'd)        |
            //          [8], how many reserved particle sections there are for this role
            //          [9], this is the index in the DB where the index in the particles
            //          [10],this is how large the size of this reserved particle section is (how many particle indeices)
            //          [11],this is the type to turn into (not used?)... YET 
            //          [12]..,. same as [9]... Etc....


        // Special t's types attached to entity:
            // 19 = [0] = the R, is the id target, the G is the explos radisu, B = ?
            //      [1-19] = the surrounding flashing capsule
            //      [20-199] = the smolk particles
            //      [200-399] = the blast wave :}}}
        // 'Entity role' - used to determine

        xp: xxx,
        yp: yyy,
        zp: zzz,
        
        vxp: vxx,
        vyp: vyy,
        vzp: vzz,

        meta1p: 0,
        meta2p: 0,
        meta3p: 0,
        meta4p: 0,
        meta5p: 0,
        meta6p: 0,
        meta7p: 0,
        meta8p: 0,


        //  NOT INCLUDED ZONE - - - - eeverything beneath this 
        // is stuff that's like not included in the database entry, but in the 

        springList: [],  //<- NOT INCLUDED in the final buffer write, it's just for cataloging the springs to make the spring buffer in the correct order
        sectionIndexOneDBEntry: 0,    //<- where to go for meta info?,,,,// IF greater than

        toBeMeta4IndexOned: 0,     // <- usually used for counter stuff?

            // desired colors to maybe switch to later... IF you are allowed to change types (2, to 13.. (that))
        desiredR: 0,
        desiredG: 0,
        desiredB: 0,

        currclosestcollball: 0,
        closestballdist: 999999,


    };
    return nuPoint;
}

function createSpring( to, rest, strength ){
    let nuSpr = {
        to,         // THE PARTICLE ID (multiplied by partSize layer)
        rest,       // REST DISTANCE TO THIS MASS
        strength    // how storng
    };
    return nuSpr;
}

// Calculated once in a while
function createNewEntityRoleInDatabase( rolesObjects, entryJson ){
  
    rolesObjects.push( entryJson );

    return entryJson;
}


// Decide if there's room or if the new dist can replace a larger one
function goodToAddNewCon(thePoint, theDist) {
    // If there's an empty slot, return true immediately
    for (let i = 0; i < thePoint.sprs.length; i++) {
        if (thePoint.sprs[i] === 0) {
            return true;
        }
    }
    // Otherwise, see if the new dist is smaller than some existing largest
    let largestDist = -1.0;
    for (let i = 0; i < thePoint.sprs.length; i++) {
        if (thePoint.sdists[i] > largestDist) {
            largestDist = thePoint.sdists[i];
        }
    }
    return (theDist < largestDist);
}

// Actually add (or replace) a spring connection in one mass' array
function addNewCon(thePoint, theIndex, theDist) {
    // 1) Try empty slot
    for (let i = 0; i < thePoint.sprs.length; i++) {
        if (thePoint.sprs[i] === 0) {
            thePoint.sprs[i]  = theIndex + 1;  // store 1-based ID
            thePoint.sdists[i] = theDist;
            return true;
        }
    }
    // 2) Replace largest distance if new one is smaller
    let largestDist  = thePoint.sdists[0];
    let largestIndex = 0;
    for (let i = 1; i < thePoint.sprs.length; i++) {
        if (thePoint.sdists[i] > largestDist) {
            largestDist  = thePoint.sdists[i];
            largestIndex = i;
        }
    }
    if (theDist < largestDist) {
        thePoint.sprs[largestIndex]  = theIndex + 1;
        thePoint.sdists[largestIndex] = theDist;
        return true;
    }
    return false;
}






function addCollisionBucketParticles( x, y, z, theseEntities, numOfBuckets, spacingss, totParticleIndTrackr ){


    let thisSize = 0;
    let startofthis = 0 + totParticleIndTrackr.val;

    //let numOfBuckets

    // All the collision bucket function calls
    for (let i = 0; i < numOfBuckets*numOfBuckets; i++) {
        // Grid-based placement
        let rrx = i % numOfBuckets;
        let rrz = Math.floor(i / numOfBuckets);

        let xPos = rrx * spacingss;
        let yPos = 0;//rry * spacing;
        let zPos = rrz * spacingss;

        let nuPoint = createParticle( xPos, yPos, zPos, totParticleIndTrackr.val );
        nuPoint.t = 1;
        nuPoint.tp = 1;
        theseEntities.push( nuPoint );
        totParticleIndTrackr.val++;
        thisSize++;
    }


    return {start: startofthis, size: thisSize };
}


function addGroundDecoParticles( x, y, z, theseEntities, numOfBuckets, spacingss, sidelgnethgparts, totParticleIndTrackr ){


    let thisSize = 0;
    let startofthis = 0 + totParticleIndTrackr.val;
    

    // All the collision bucket function calls
    for (let ix = 0; ix < numOfBuckets; ix++) {
        for (let iy = 0; iy < numOfBuckets; iy++) {
            
            for (let jx = 0; jx < sidelgnethgparts; jx++) {
                for (let jy = 0; jy < sidelgnethgparts; jy++) {
  
        
                let xPos = (ix * spacingss) + jx*(1*(spacingss/sidelgnethgparts))
                let yPos = 0;//rry * spacing;
                let zPos = (iy * spacingss) + jy*(1*(spacingss/sidelgnethgparts))
        
                let nuPoint = createParticle( xPos, yPos, zPos, totParticleIndTrackr.val );
                nuPoint.t = 3;
                nuPoint.tp = 3;
                theseEntities.push( nuPoint );
                totParticleIndTrackr.val++;
                thisSize++;

 
                }
            }
        }
    }


    return {start: startofthis, size: thisSize };
}

function addTheSprings_orie( locationsOfTheseNewEntities, spacingss, totParticleIndTrackr ){
    
    // S P R I N G S + + + + + + (with the orienter particle id's being listed as the first two spacing)
    
    for(let i = 0;i < locationsOfTheseNewEntities.length;i++){// && false

        let springsForThisEnt = []; 
        for(let j = 0;j < locationsOfTheseNewEntities.length;j++){ 

            if(  i !== j && locationsOfTheseNewEntities[i].t === 2 && locationsOfTheseNewEntities[j].t === 2 ){

                let xx = locationsOfTheseNewEntities[j].x - locationsOfTheseNewEntities[i].x;
                let yy = locationsOfTheseNewEntities[j].y - locationsOfTheseNewEntities[i].y;
                let zz = locationsOfTheseNewEntities[j].z - locationsOfTheseNewEntities[i].z;
                let distem = Math.sqrt( xx*xx + yy*yy + zz*zz );

                if( (distem >= 0.00001) && (distem <= spacingss) ){
                    let nuspring = createSpring( locationsOfTheseNewEntities[j].id, distem, 1 );
                    springsForThisEnt.push( nuspring );
                    locationsOfTheseNewEntities[i].springList.push(nuspring);
                    totParticleIndTrackr.exsprcnt++;
                }
            }
        }

 
         
    }

    return springsForThisEnt.length;
}
function addTheSprings_std( locationsOfTheseNewEntities, spacingss, unitforvoxelspacing, orientcontrolradius, 
    centerNucleausParticle, indOfTealParticle, allowspringtypes, totParticleIndTrackr, listOfOrienterParticles, listOfCollisionParticles ){
    
    // S P R I N G S + + + + + +

    let totalSprsn = 0;

    // ONe time triggers
    var lop = [];
    if( listOfOrienterParticles ){
        lop = listOfOrienterParticles; 
    }

    var colp = [];// for the coolisino particles
    colp = listOfCollisionParticles;
    // MODE AVERAGE COLOURING PART 1/3
    let formodecoloring = Array.from({ length:  lop.length }, () => []);
    var orientds = [];
    
    for(let i = 0;i < lop.length;i++){

        orientds.push({
            x: locationsOfTheseNewEntities[lop[i]].x,
            y: locationsOfTheseNewEntities[lop[i]].y,
            z: locationsOfTheseNewEntities[lop[i]].z,
        });     //let distem = Math.sqrt( xx*xx + yy*yy + zz*zz );

        //formodecoloring.push( [] );// lists of {r:233, g: 233, b: 98}

    }

    let collisionmodecoloring = Array.from({ length:  colp.length }, () => []);
    for(let i = 0;i < colp.length;i++){

    }


    // ^^^ APPLY THESE
    let meta_val_highest_spring_count = 0;
    
    for(let i = 0;i < locationsOfTheseNewEntities.length;i++){

        let springsForThisEnt = [];
        for(let j = 0;j < locationsOfTheseNewEntities.length;j++){


            let isspringtype =  false;   // CHECK FOR ALLOWED SPROIGUNS
            let isspringtype2 = false;

            for(let u = 0;u < allowspringtypes.length;u++){
                if(allowspringtypes[u] === locationsOfTheseNewEntities[i].t){
                    isspringtype = true;
                }
                if(allowspringtypes[u] === locationsOfTheseNewEntities[j].t){
                    isspringtype2 = true;
                }
            }



            if( isspringtype && isspringtype2 ){

                let xx = locationsOfTheseNewEntities[j].x - locationsOfTheseNewEntities[i].x;
                let yy = locationsOfTheseNewEntities[j].y - locationsOfTheseNewEntities[i].y;
                let zz = locationsOfTheseNewEntities[j].z - locationsOfTheseNewEntities[i].z;
                let distem = Math.sqrt( xx*xx + yy*yy + zz*zz );

                            // # # # # # THIS IS WHERE THE SPRINGS ARE ADDED - < CTRL+F

                if( i !== j ){
                    if( (distem >= 0.00001) && (distem <= spacingss) ){
                        let nuspring = createSpring( locationsOfTheseNewEntities[j].id, distem, 1 );
                        springsForThisEnt.push( nuspring );
                        locationsOfTheseNewEntities[i].springList.push(nuspring);
                        totParticleIndTrackr.exsprcnt++;
                    }
                    else if( distem >= 0.00001 && distem <= unitforvoxelspacing){


                    }
                }
                

            }


            // If it's the nucleus, go crazy and shotgun a bunch

        }// ^^^ going through all 'j' entities


        if( springsForThisEnt.length > meta_val_highest_spring_count){
            meta_val_highest_spring_count = springsForThisEnt.length;
        }






        if( i !== indOfTealParticle ){
            locationsOfTheseNewEntities[i].sectionIndexOneDBEntry = centerNucleausParticle;
        }




        // MODE AVERAGE COLOURING PART 2/3
        let isoriginalorienter = false;
        for(let u = 0;u < orientds.length;u++){
            isoriginalorienter = isoriginalorienter || (lop[u] === i);
        }

        // Go through all the orienting particles and see if this new guy is close enough to be added 
        for(let u = 0;u < orientds.length;u++){
 
                    
            let xxx = locationsOfTheseNewEntities[i].x - orientds[u].x;
            let yyy = locationsOfTheseNewEntities[i].y - orientds[u].y;
            let zzz = locationsOfTheseNewEntities[i].z - orientds[u].z;
            let disttm = Math.sqrt( xxx*xxx + yyy*yyy + zzz*zzz );


            if( disttm <= orientcontrolradius ){
                        //  un toughed so far
                if(locationsOfTheseNewEntities[i].t === 2 || locationsOfTheseNewEntities[i].t === (6+u) ){ // normal spring ready to receive t update? OR an orienter yourself
                    locationsOfTheseNewEntities[i].t = 6 + u;
                    locationsOfTheseNewEntities[i].tp = 6 + u;
                    // KEEP THE MIDDLE ONE INTACT LMAO>>>
                    // Teal points to the spot in entity space? (because the t13 meta3 is the index to the db with the meta info)
                    if( i !== indOfTealParticle){
                        locationsOfTheseNewEntities[i].sectionIndexOneDBEntry = centerNucleausParticle;
                    }
                    
                }
            }
            // For colour checking
            if( disttm < unitforvoxelspacing * 2.75 ){ // the cubed diagonal
                if(locationsOfTheseNewEntities[i].t === 2 || (locationsOfTheseNewEntities[i].t === (6+u) && !isoriginalorienter ) ){// OR the spread out controller val, IF its not the original one

                    if (!formodecoloring[u]) {
                        formodecoloring[u] = [];
                    }

                    formodecoloring[u].push({
                        r: locationsOfTheseNewEntities[i].desiredR,
                        g: locationsOfTheseNewEntities[i].desiredG,
                        b: locationsOfTheseNewEntities[i].desiredB
                    })
                }
            }
        }


        // Go through all the  coliding particles and see if close enough to badded 
        for(let u = 0;u < collisionmodecoloring.length;u++){
            let xxx = locationsOfTheseNewEntities[i].x - locationsOfTheseNewEntities[listOfCollisionParticles[u]].x;
            let yyy = locationsOfTheseNewEntities[i].y - locationsOfTheseNewEntities[listOfCollisionParticles[u]].y;
            let zzz = locationsOfTheseNewEntities[i].z - locationsOfTheseNewEntities[listOfCollisionParticles[u]].z;
            let disttm = Math.sqrt( xxx*xxx + yyy*yyy + zzz*zzz );

            // For colour checking
            if( disttm < unitforvoxelspacing * 2.75 ){ // the cubed diagonal
                if(locationsOfTheseNewEntities[i].t === 2 && !isoriginalorienter){

                    if (!collisionmodecoloring[u]) {
                        collisionmodecoloring[u] = [];
                    }

                    collisionmodecoloring[u].push( {
                        r: locationsOfTheseNewEntities[i].desiredR,
                        g: locationsOfTheseNewEntities[i].desiredG,
                        b: locationsOfTheseNewEntities[i].desiredB
                    } );
                }
            }
        }

 
 
        totalSprsn += locationsOfTheseNewEntities[i].springList.length;

    }   // ^^^ going through all 'i' enttiesi







    // REFINE to MODE- color :) :) :)  
    for(let i = 0;i < locationsOfTheseNewEntities.length;i++){
        // Go through all the orienting particles and see if this new guy is smol enough to be added 
        for(let u = 0;u < orientds.length;u++){
            
            let xxx = locationsOfTheseNewEntities[i].x - orientds[u].x;
            let yyy = locationsOfTheseNewEntities[i].y - orientds[u].y;
            let zzz = locationsOfTheseNewEntities[i].z - orientds[u].z;
            let disttm = Math.sqrt( xxx*xxx + yyy*yyy + zzz*zzz ); 

            // For colour checking
            if( disttm>0.0001 && disttm < unitforvoxelspacing * 2.75 ){ // the cubed diagonal
                if(locationsOfTheseNewEntities[i].t === 2){
                    formodecoloring[u].push({
                        r: locationsOfTheseNewEntities[i].desiredR,
                        g: locationsOfTheseNewEntities[i].desiredG,
                        b: locationsOfTheseNewEntities[i].desiredB
                    })
                }
            }
        }
    }

    // MODE AVERAGE COLOURING PART 3/3
    for(let u = 0;u < formodecoloring.length;u++){
        let camodcol = getModeOrBlend( formodecoloring[u] );// camo coloured 
        //  console.log(camodcol)
        locationsOfTheseNewEntities[lop[u]].desiredR = camodcol.r;
        locationsOfTheseNewEntities[lop[u]].desiredG = camodcol.g;
        locationsOfTheseNewEntities[lop[u]].desiredB = camodcol.b;
    }

    for(let u = 0;u < collisionmodecoloring.length;u++){
        let camodcol = getModeOrBlend( collisionmodecoloring[u] );// camo coloured 
        //  console.log(camodcol)
        locationsOfTheseNewEntities[listOfCollisionParticles[u]].desiredR = camodcol.r;
        locationsOfTheseNewEntities[listOfCollisionParticles[u]].desiredG = camodcol.g;
        locationsOfTheseNewEntities[listOfCollisionParticles[u]].desiredB = camodcol.b;
    }

    // Set the nucleus to its own special certified king center
    locationsOfTheseNewEntities[indOfTealParticle].t = 13;
    locationsOfTheseNewEntities[indOfTealParticle].tp= 13;  // .sectionIndexOneDBEntry  still points to good entity in db

    // console.log('nucleus spring count: ', locationsOfTheseNewEntities[indOfTealParticle].springList.length);
    // console.log(  locationsOfTheseNewEntities[indOfTealParticle].springList ); 
    // console.log('Total new particles:', locationsOfTheseNewEntities.length);
    // console.log('Total new springs:::', totalSprsn); 
    // for(let i = 0;i < locationsOfTheseNewEntities.length;i++){ 
    //     if( locationsOfTheseNewEntities[i].t === 8 ){
    //         console.log('total front one 8 now')
    //     }
    //     if( locationsOfTheseNewEntities[i].t === 12 ){
    //         console.log('11111112222222222')
    //     } 
    // }


    console.log('HIGHEST SPRING COUNT FOR ONE PARTICLE: ', meta_val_highest_spring_count );


}

function addTheShrinkWrap_std( locationsOfTheseNewEntities, spacingval, collShrinkWrapInds, totParticleIndTrackr ){
    // S H R I N K  W R A P P E D ========
    let theRadius = 10.0 * spacingval;   // Starting radius for coverage of each collision

    let activelyReducing = true;
    let radiusStepAmount = 0.3 * spacingval;

    let collballshrinks = 0;
    while( activelyReducing ){
        collballshrinks++;

        // Go through the first one
        let bitincludedcount = (new Array(locationsOfTheseNewEntities.length)).fill(0);
        for(let n = 0;n < collShrinkWrapInds.length;n++){

            let shrinkWrapBall = locationsOfTheseNewEntities[ collShrinkWrapInds[n] ];
            // Location of these new entities
            for(let i = 0;i < locationsOfTheseNewEntities.length;i++){
                let xx = shrinkWrapBall.x - locationsOfTheseNewEntities[i].x;
                let yy = shrinkWrapBall.y - locationsOfTheseNewEntities[i].y;
                let zz = shrinkWrapBall.z - locationsOfTheseNewEntities[i].z;
                let distanceOfThing = Math.sqrt( xx*xx + yy*yy + zz*zz );

                if( (theRadius) > distanceOfThing ){
                    bitincludedcount[i] = 1;    //set flag
                }

                if( distanceOfThing < locationsOfTheseNewEntities[i].closestballdist ){
                    locationsOfTheseNewEntities[i].closestballdist = distanceOfThing;
                    locationsOfTheseNewEntities[i].currclosestcollball = shrinkWrapBall.id + 1;
                }
            }




        }




        // Tally up how many were included
        let bitsincluded = 0;
        for(let n = 0;n < bitincludedcount.length;n++){
            bitsincluded += bitincludedcount[n];
        }
        if(bitsincluded === bitincludedcount.length){
            // All particles are included :)
            activelyReducing = true;    // continue reducing
            theRadius -= radiusStepAmount;
        }
        else{
            // At least one particle is missing, go through and identify the problem node
            activelyReducing = false;
        }
    }

    //console.log('Had to try:', collballshrinks, 'different radi')

    // now theRadius is the min value it's gotta be (If all the collision balls are gonna)

    // SHOULD ALL BE t=5's 
    for(let n = 0;n < collShrinkWrapInds.length;n++){
        let collball = locationsOfTheseNewEntities[ collShrinkWrapInds[n] ];

        collball.meta7 = theRadius*1;
        collball.meta7p = theRadius*1;

        if( collball.t === 2 || 
            collball.t === 4 ||
            (collball.t >= 6 && collball.t <= 12 ) ){
                throw new Error("wrong kind of 't' for this meta7, " + collball.t + " these should only be 5's");
            }
    }

}



function addCubeOmegaCubeAndBindNearest( x, y, z, locationsOfTheseNewEntities, numOfMassesIsh, spacingss, totParticleIndTrackr ){


    let thisSize = 0;
    let startofthis = 0 + totParticleIndTrackr.val;
    let firstInd = -1;//just use this as the teal
    // All the controller entities that could possibly
    // be indexed in the collision buckets
    for (let i = 0; i < numOfMassesIsh; i++) {

        let cubewidth = 10;
        let cubeheight = 10;

        // Grid-based placement   /
        let rrx = i % cubewidth;//
        let rry = Math.floor((i / cubewidth) % cubeheight);
        let rrz = Math.floor(i / (cubewidth * cubeheight));
 


        let biggerSPacig = spacingss;
        let xPos = 1.0 + rrx * biggerSPacig;
        let yPos = 1.0 + (rry * biggerSPacig) + spacingss*0.0;
        let zPos = 1.0 + rrz * biggerSPacig;
        xPos += x;
        yPos += y;
        zPos += z;
        let nuPoint = createParticle( xPos, yPos, zPos, totParticleIndTrackr.val );
        nuPoint.t = 2;

        
        nuPoint.meta1 = 0;  // Usually the location of the springs list
        nuPoint.meta1p= 0;
        nuPoint.meta2 = 0;  // Usually the size of the springs list
        nuPoint.meta2p= 0;
        nuPoint.meta3=  0;   // If to delete all this round
        nuPoint.meta3p= 0;
        nuPoint.meta4=  0;   // If to delete all this round
        nuPoint.meta4p= 0;

        locationsOfTheseNewEntities.push( nuPoint );
        if(i === 0){firstInd = locationsOfTheseNewEntities.length-1;}
        totParticleIndTrackr.val++;
        thisSize++;
        
 
    }

    // TODO giv ethis
    //td( locationsOfTheseNewEntities, firstParticleInd, lastParticleInd, spacingss, orientcontrolradius, centerNucleausParticle, indOfTealParticle, allowspringtypes, totParticleIndTrackr ){
    addTheSprings_std(locationsOfTheseNewEntities, spacingss * 4.1, spacingss * 1, spacingss, locationsOfTheseNewEntities[firstInd].id, firstInd, 2.0, [2,5], totParticleIndTrackr, null, []);

    return {start: startofthis, size: thisSize };


}


function reserveSomeParticlesHelper( xx, yy, zz, nucleusParticleId, listofnuparts, particlesToReserve, typeoparticle, 
    totParticleIndTrackr, reservedGroup, smkParticleReserv ){
        
    // Reserve water
    let startofthis = 0 + totParticleIndTrackr.val;

    let smolkpartile = isNaN(smkParticleReserv) ? typeoparticle : smkParticleReserv;

    for( let r = 0;r < particlesToReserve;r++){

        let xxx = 0;//Math.random() * 18;
        let yyy = 0;//5 + Math.random() * 2;
        let zzz = 0;//Math.random() * 18;

        let nuPoint = createParticle( xx + xxx, yy + yyy, zz + zzz, totParticleIndTrackr.val );



        nuPoint.t = 14;
        nuPoint.tp = 14; // this is water now

        //typeoparticle ??? <- where to store this 

        //nuPoint.meta1 = would be spring loc 
        //nuPoint.meta2 = would be 
        // using springList if u were gonna use springs on dis 

        
        // USE THIS VARIABLE because it gets set tin
        nuPoint.sectionIndexOneDBEntry = nucleusParticleId;// meta3

        nuPoint.desiredR = 200;//meta4  these values are NOT reset 
        nuPoint.desiredG = 255;//meta5
        nuPoint.desiredB = 255;//meta6

        if( r > 0 ){ 
            // if it's not the tip of the thing that has the logic,  
            // it's like the meat of the particles (the smoke pluum)
            nuPoint.meta7 = smolkpartile;
            nuPoint.meta7p = smolkpartile;
        }
        else{
            // What to turn into if this dormant particle is activated
            nuPoint.meta7 = typeoparticle;
            nuPoint.meta7p = typeoparticle;
        }

        // The index (0,1,2,3 ...) of the reserve group on this entity role
        nuPoint.meta8 = reservedGroup+1;
        nuPoint.meta8p = reservedGroup+1;   // ADD one


        listofnuparts.push( nuPoint );

        totParticleIndTrackr.val++;
    }
    
    return {start: startofthis, size: particlesToReserve };

}


function carpetParticleHelper_InactiveGold( xx, yy, zz, perim, spcin, listofnuparts, totParticleIndTrackr ){
    // Reserve water
    let startofthis = 0 + totParticleIndTrackr.val;

    for( let rx = 0;rx < perim;rx++){
        for( let ry = 0;ry < perim;ry++){

            let xxx = rx*spcin;//Math.random() * 18;
            let yyy = 0;//5 + Math.random() * 2;
            let zzz = ry*spcin;//Math.random() * 18;

            let nuPoint = createParticle( xx + xxx, yy + yyy, zz + zzz, totParticleIndTrackr.val );



            nuPoint.t = 16;
            nuPoint.tp = 16; // this is inactive gold

            //typeoparticle ??? <- where to store this 

            //nuPoint.meta1 = would be spring loc 
            //nuPoint.meta2 = would be 
            // using springList if u were gonna use springs on dis 

            
            // USE THIS VARIABLE because it gets set where the springs are converted into the buffer
            nuPoint.sectionIndexOneDBEntry = 0;//nucleusParticleId;// meta3
            // ^ NOTHING in this case, not connected to any other thing

            nuPoint.desiredR = 195;//meta4  these values are NOT reset 
            nuPoint.desiredG = 195;//meta5
            nuPoint.desiredB = 255;//meta6

            // COunter timer (increments 1, every frame)
            nuPoint.meta7 = 0;
            nuPoint.meta7p = 0;

            // t15 this is nothing, yet
            nuPoint.meta8 = 0;
            nuPoint.meta8p = 0; 


            listofnuparts.push( nuPoint );

            totParticleIndTrackr.val++;
        }
    }
    
    return {start: startofthis, size: perim*perim };

}

function calculateSpiralCoordinates(index, radius) {
    // The golden angle in radians (approximately 360° / ϕ^2)
    const goldenAngle = 2.39996323;

    // Ensure index is treated as a number
    const idx = Number(index);

    // Calculate the angle and distance from the center
    const angle = idx * goldenAngle;
    const distance = radius * Math.sqrt(idx);

    // Compute x and y coordinates
    const x = Math.cos(angle) * distance;
    const y = Math.sin(angle) * distance;

    return { x, y };
}

function carpetParticleHelper_BottomMud( xx, yy, zz, thewidth, theheight, perim, listofnuparts, totParticleIndTrackr, randobj ){

    let basebrown = [139,69,19];
    let browns = [];
    for(let h = 0;h < 56;h++){
        browns.push([
            basebrown[0] + Math.floor(randobj.random()*34) - 17,
            basebrown[1] + Math.floor(randobj.random()*12) - 6,
            basebrown[2] + Math.floor(randobj.random()*5) - 2,
        ])
    }

    // Reserve water
    let startofthis = 0 + totParticleIndTrackr.val;

    let spcin = thewidth/perim;

    let trakc = 0;

    for( let rx = 0;rx < perim;rx++){
        for( let ry = 0;ry < perim;ry++){
            trakc++;

            let cor = calculateSpiralCoordinates( trakc, 0.06, )

            let xxx =  cor.x;//rx*spcin - thewidth/2; 
            let yyy = 0;//5 + Math.random() * 2;
            let zzz = cor.y;//ry*spcin - theheight/2; 

            let nuPoint = createParticle( xx + xxx, yy + yyy, zz + zzz, totParticleIndTrackr.val );



            nuPoint.t = 15;
            nuPoint.tp = 15; // this is water now

            //typeoparticle ??? <- where to store this 

            //nuPoint.meta1 = would be spring loc 
            //nuPoint.meta2 = would be 
            // using springList if u were gonna use springs on dis 

            
            // USE THIS VARIABLE because it gets set where the springs are converted into the buffer
            nuPoint.sectionIndexOneDBEntry = 0;//nucleusParticleId;// meta3
            // ^ NOTHING in this case, not connected to any other thing

            nuPoint.desiredR = browns[trakc%browns.length][0];//195;//meta4  these values are NOT reset 
            nuPoint.desiredG = browns[trakc%browns.length][1];//195;//meta5
            nuPoint.desiredB = browns[trakc%browns.length][2];//255;//meta6

            // COunter timer (increments 1, every frame)
            nuPoint.meta7 = 0;
            nuPoint.meta7p = 0;

            // t15 this is nothing, yet
            nuPoint.meta8 = 0;
            nuPoint.meta8p = 0; 


            listofnuparts.push( nuPoint );

            totParticleIndTrackr.val++;
        }
    }
    
    return {start: startofthis, size: perim*perim };

}


function addVoxelModelApplyOrientersAndBindNearest( x, y, z, locationsOfTheseNewEntities, theDbRn, voxelObj, voxelspacings, totParticleIndTrackr, rendm ){


    // Meta stats:
    var orienterParticleIds = [     // orient for the meta 
        0,  // Front
        0,  // Back
        0,  // Top
        0,  // Bottom
        0,  // Left
        0,   // Right
        0,  // CENTER
    ];
    var orpartids = [-1,-1,-1,-1,-1,-1,-1];// the inds inside

    var firstParticleInd = -1;
    var lastParticleInd = -1;

    var collShrinkWraps = [];       // the ids of the particles to shrink wrap from
                                    // also these get added to the entity registry
    var collShrinkWrapInds = [];    // for the indices

    
    var centerNucleausParticle = 0; // (the teal colour: 0, 255, 255)
    var indOfTealParticle = -1;     // ind of teal colour in the 

    


    let debugshow = rendm.debugrender?true:false;
    let detailcube = isNaN(rendm.detailcube)?1:Math.floor(rendm.detailcube);
    let bindunits = isNaN(rendm.bindunits)?5:rendm.bindunits;
    let orientinunits = isNaN(rendm.orientbind)?2:rendm.orientbind;

    let paintjobs = rendm.paintjobs?rendm.paintjobs:[];

    // If gonna need to reserve a scratch pad spot and return it
    let reserveAReadbackSlot = rendm.reserve_cpu_readbackspot?true:false;

    // which side to add the collision stuff in:
    let collisionorbsside = rendm.collision_orbs_mode==="bad"?1:0;// defualt is good 

    let entity_role = isNaN(rendm.entityrole.ind)?0:rendm.entityrole.ind;   // 0 is none, 1 is car, 2 is.. enemy?

        let weapon_registration_slots = []; // this grows and gets returned
    let reserved_particles = rendm.entityrole.reserved_particles;// must always be legit
    if( isNaN( reserved_particles.length) ){ throw new Error("incorrecrt reserd_particles length???");}

    let dbInds_ToCircleBackTo = new Array( reserved_particles.length );// keep track of the locations 
                                                            // in the DB to change to store the indices where the reserved particles 
    
    //rendm.allowedspringtypes 

    let min_xmetrix = 99999;
    let max_xmetrix = -99999;
    let min_ymetrix = 99999;
    let max_ymetrix = -99999;
    let min_zmetrix = 99999;
    let max_zmetrix = -99999; 
    for (let i = 0; i < voxelObj.particles.length; i++) {
        min_xmetrix = Math.min(min_xmetrix, voxelObj.particles[i].x);
        max_xmetrix = Math.max(max_xmetrix, voxelObj.particles[i].x);
        min_ymetrix = Math.min(min_ymetrix, voxelObj.particles[i].y);
        max_ymetrix = Math.max(max_ymetrix, voxelObj.particles[i].y);
        min_zmetrix = Math.min(min_zmetrix, voxelObj.particles[i].z);
        max_zmetrix = Math.max(max_zmetrix, voxelObj.particles[i].z);
    }

    let shiftspacex = (min_xmetrix + max_xmetrix) / 2;
    let shiftspacey = (min_ymetrix + max_ymetrix) / 2;
    let shiftspacez = (min_zmetrix + max_zmetrix) / 2;
 
    let detspacgin = voxelspacings / detailcube

    let thisSize = 0;
    let startofthis = 0 + totParticleIndTrackr.val;

    // All the controller entities that could possibly
    // be indexed in the collision buckets
    for (let i = 0; i < voxelObj.particles.length; i++) {
        let xPos = (voxelObj.particles[i].x - shiftspacex) * voxelspacings;
        let yPos = (voxelObj.particles[i].z - shiftspacey) * voxelspacings;
        let zPos = (voxelObj.particles[i].y - shiftspacez) * voxelspacings;
        xPos += x ;
        yPos += y ;
        zPos += z ;
        let nuPoint = createParticle( xPos, yPos, zPos, totParticleIndTrackr.val );
        nuPoint.t = 2;
        nuPoint.tp = 2;

        /// Used for tracking + faster searching
        if(i===0){
            firstParticleInd = totParticleIndTrackr.val;
        }
        else if(i===voxelObj.particles.length-1){
            lastParticleInd = totParticleIndTrackr.val;
        }

        
        // nuPoint.meta1 = 0;  // Usually the location of the springs list
        // nuPoint.meta1p= 0;
        // nuPoint.meta2 = 0;  // Usually the size of the springs list
        // nuPoint.meta2p= 0;
        // nuPoint.meta3=  0;   // if it's a teal block..... and what's the location in db space.
        // nuPoint.meta3p= 0;
        // DOESNT EVEN MATTER BECAUSE IT GETS OVERRIDEN

        locationsOfTheseNewEntities.push( nuPoint );


        // PAINT JOB INTERMISSION
        // Classify the collision shrink wrap locations
        if( voxelObj.particles[i].r === 255 && voxelObj.particles[i].g === 120 && voxelObj.particles[i].b === 120 ){
            locationsOfTheseNewEntities[ locationsOfTheseNewEntities.length-1 ].t = 5;
            locationsOfTheseNewEntities[ locationsOfTheseNewEntities.length-1 ].tp = 5;
            collShrinkWraps.push(totParticleIndTrackr.val);
            collShrinkWrapInds.push(locationsOfTheseNewEntities.length - 1);

            // ADD THE COLLIDERS AS REFERENCES

            // * NOTE: ONLY put these t=5's in here
            if( collisionorbsside === 0) { // GOOD SIDE
                theDbRn[0 + totParticleIndTrackr.goodguys] = 
                    locationsOfTheseNewEntities[ locationsOfTheseNewEntities.length-1 ].id + 1; 
                totParticleIndTrackr.goodguys++;
            }
            else if ( collisionorbsside === 1 ){ // BAD SIDE
                theDbRn[0 + totParticleIndTrackr.MAX_good_guys + totParticleIndTrackr.badguys] = 
                    locationsOfTheseNewEntities[ locationsOfTheseNewEntities.length-1 ].id + 1;
                totParticleIndTrackr.badguys++;
            }
                
        }
        
        // Nucleus Center Particle
        else if( voxelObj.particles[i].r === 0 && voxelObj.particles[i].g === 255 && voxelObj.particles[i].b === 255 ){
            centerNucleausParticle = totParticleIndTrackr.val + 1;// (PLUS ONED HERE, CARRIES THROUGHOUT THE WHOLE THING)
            indOfTealParticle = locationsOfTheseNewEntities.length - 1;// get the last point u added
            
            // Engineering double check
            if( !(orpartids[6] < 0) ) throw new Error('more than 1 of this orienter block: ' + orpartids[6]);

            //totParticleIndTrackr.totaldbs
            orienterParticleIds[6] = totParticleIndTrackr.val + 1;
            orpartids[6] = locationsOfTheseNewEntities.length - 1;// get the last point u added
            locationsOfTheseNewEntities[ locationsOfTheseNewEntities.length-1 ].t = 12;  // THE CEBNTER INITIAL SETTER FOR THE FRONT
            locationsOfTheseNewEntities[ locationsOfTheseNewEntities.length-1 ].tp = 12;  // THE CEBNTER INITIAL SETTER FOR THE FRONT
        }

        // Front
        else if( voxelObj.particles[i].r === 0 && voxelObj.particles[i].g === 255 && voxelObj.particles[i].b === 0 ){
            orienterParticleIds[0] = totParticleIndTrackr.val + 1;
            
            // Engineering double check
            if( !(orpartids[0] < 0) ) throw new Error('more than 1 of this orienter block: ' + orpartids[0]);
            orpartids[0] = locationsOfTheseNewEntities.length - 1;// get the last point u added
            locationsOfTheseNewEntities[ locationsOfTheseNewEntities.length-1 ].t = 6;  // THE FIRST INITIAL SETTER FOR THE FRONT
            locationsOfTheseNewEntities[ locationsOfTheseNewEntities.length-1 ].tp = 6;  // THE FIRST INITIAL SETTER FOR THE FRONT
        }
        // Back
        else if( voxelObj.particles[i].r === 255 && voxelObj.particles[i].g === 0 && voxelObj.particles[i].b === 0 ){
            orienterParticleIds[1] = totParticleIndTrackr.val + 1;
            
            // Engineering double check
            if( !(orpartids[1] < 0) ) throw new Error('more than 1 of this orienter block: ' + orpartids[1]);
            orpartids[1] = locationsOfTheseNewEntities.length - 1;// get the last point u added
            locationsOfTheseNewEntities[ locationsOfTheseNewEntities.length-1 ].t = 7;  // THE FIRST INITIAL SETTER FOR THE BACK
            locationsOfTheseNewEntities[ locationsOfTheseNewEntities.length-1 ].tp = 7;  // THE FIRST INITIAL SETTER FOR THE BACK
        }
        // Top
        else if( voxelObj.particles[i].r === 0 && voxelObj.particles[i].g === 0 && voxelObj.particles[i].b === 255 ){
            orienterParticleIds[2] = totParticleIndTrackr.val + 1;
            
            // Engineering double check
            if( !(orpartids[2] < 0) ) throw new Error('more than 1 of this orienter block: ' + orpartids[2]);
            orpartids[2] = locationsOfTheseNewEntities.length - 1;// get the last point u added
            locationsOfTheseNewEntities[ locationsOfTheseNewEntities.length-1 ].t = 8;  // THE FIRST INITIAL SETTER FOR THE TOP
            locationsOfTheseNewEntities[ locationsOfTheseNewEntities.length-1 ].tp = 8;  // THE FIRST INITIAL SETTER FOR THE TOP
        }
        // Bottom
        else if( voxelObj.particles[i].r === 255 && voxelObj.particles[i].g === 255 && voxelObj.particles[i].b === 0 ){
            orienterParticleIds[3] = totParticleIndTrackr.val + 1;
            
            // Engineering double check
            if( !(orpartids[3] < 0) ) throw new Error('more than 1 of this orienter block: ' + orpartids[3]);
            orpartids[3] = locationsOfTheseNewEntities.length - 1;// get the last point u added
            locationsOfTheseNewEntities[ locationsOfTheseNewEntities.length-1 ].t = 9;  // THE FIRST INITIAL SETTER FOR THE BOTTOM
            locationsOfTheseNewEntities[ locationsOfTheseNewEntities.length-1 ].tp = 9;  // THE FIRST INITIAL SETTER FOR THE BOTTOM
        }
        // Left
        else if( voxelObj.particles[i].r === 255 && voxelObj.particles[i].g === 0 && voxelObj.particles[i].b === 255 ){
            orienterParticleIds[4] = totParticleIndTrackr.val + 1;
            
            // Engineering double check
            if( !(orpartids[4] < 0) ) throw new Error('more than 1 of this orienter block: ' + orpartids[4]);
            orpartids[4] = locationsOfTheseNewEntities.length - 1;// get the last point u added
            locationsOfTheseNewEntities[ locationsOfTheseNewEntities.length-1 ].t = 10;  // THE FIRST INITIAL SETTER FOR THE LEFT
            locationsOfTheseNewEntities[ locationsOfTheseNewEntities.length-1 ].tp = 10;  // THE FIRST INITIAL SETTER FOR THE LEFT
        }
        // Right
        else if( voxelObj.particles[i].r === 255 && voxelObj.particles[i].g === 127 && voxelObj.particles[i].b === 0 ){
            orienterParticleIds[5] = totParticleIndTrackr.val + 1;
            
            // Engineering double check
            if( !(orpartids[5] < 0) ) throw new Error('more than 1 of this orienter block: ' + orpartids[5]);
            orpartids[5] = locationsOfTheseNewEntities.length - 1;// get the last point u added
            locationsOfTheseNewEntities[ locationsOfTheseNewEntities.length-1 ].t = 11;  // THE FIRST INITIAL SETTER FOR THE RIGHT
            locationsOfTheseNewEntities[ locationsOfTheseNewEntities.length-1 ].tp = 11;  // THE FIRST INITIAL SETTER FOR THE RIGHT
        } 
        // Classify them - the paint job begins
        else{
            // Standard primary colour/material/texture 
            // Dark Pewter
            if( voxelObj.particles[i].r === 101 && voxelObj.particles[i].g === 99 && voxelObj.particles[i].b === 109 ){

            }
        }


        var apintoveriden = -1;
        for(let pj = 0;pj < paintjobs.length;pj++){
            if( paintjobs[pj].input.r === voxelObj.particles[i].r && paintjobs[pj].input.g === voxelObj.particles[i].g && paintjobs[pj].input.b === voxelObj.particles[i].b){
                apintoveriden = pj;
                pj = paintjobs.length;
            }
        }

        if( apintoveriden > -1 ){
            
            nuPoint.desiredR = paintjobs[apintoveriden].output.r;
            nuPoint.desiredG = paintjobs[apintoveriden].output.g;
            nuPoint.desiredB = paintjobs[apintoveriden].output.b;
        }
        else{

            // Nu point's rgb from Goxel
            nuPoint.desiredR = voxelObj.particles[i].r;
            nuPoint.desiredG = voxelObj.particles[i].g;
            nuPoint.desiredB = voxelObj.particles[i].b; 
        }
    
        
        
        // Increment now
        totParticleIndTrackr.val++;
        thisSize++;
 
    }


    
    // ERROR CATCHER not all the key critical orienting particles were found
    for(let q = 0;q < orienterParticleIds.length;q++){
        if( orienterParticleIds[q] < 1 ){
            throw new Error("oritner praticle:" + q + " is missing");
        }
    }


    var scratchpad_exactStartIndex = -1;   //-1 means no  - - - - SKETCH PAD GETS MADE

    // IF THERE was teal marker, WRITE a new entry, 
    if( centerNucleausParticle > 0 && indOfTealParticle > -1){

        // The index in the DB is set and (+1'd) for the meta 3
        locationsOfTheseNewEntities[ indOfTealParticle ].sectionIndexOneDBEntry = totParticleIndTrackr.totaldbs + 1;
        
        // The entity type of the thing, (FOR nucleus thisis meta 7)  (META 7 for colision sphere (t=5) are the RADIUS )
        locationsOfTheseNewEntities[ indOfTealParticle ].meta7 =    entity_role;
        locationsOfTheseNewEntities[ indOfTealParticle ].meta7p =   entity_role;


        // So now it's all set up - record the scratch pad location 
        if( reserveAReadbackSlot ){
            totParticleIndTrackr.totalreadbacks++;
            scratchpad_exactStartIndex = totParticleIndTrackr.totalcpu;//                       <-----          |           storing this... for unknown reason
            locationsOfTheseNewEntities[ indOfTealParticle ].meta8 = scratchpad_exactStartIndex + 1;//          |
            locationsOfTheseNewEntities[ indOfTealParticle ].meta8p = scratchpad_exactStartIndex + 1;//         |
        //                                                                                                      |
        }//                                                                                                     |
        //                                                                                                      |
        //                                                                                                      |
        // Also allocate the DB memory write down whatever... lol            //                                 |
        // WRIT.push(,  REMEMBER TO SUBTRACT ONE WHEN EXTREACTING            //                                 |
        theDbRn[totParticleIndTrackr.totaldbs + 0] = orienterParticleIds[0]; //                                 |
        theDbRn[totParticleIndTrackr.totaldbs + 1] = orienterParticleIds[1]; //                                 |
        theDbRn[totParticleIndTrackr.totaldbs + 2] = orienterParticleIds[2]; //                                 |
        theDbRn[totParticleIndTrackr.totaldbs + 3] = orienterParticleIds[3]; //                                 |
        theDbRn[totParticleIndTrackr.totaldbs + 4] = orienterParticleIds[4]; //                                 |
        theDbRn[totParticleIndTrackr.totaldbs + 5] = orienterParticleIds[5]; //                                 |
        theDbRn[totParticleIndTrackr.totaldbs + 6] = orienterParticleIds[6]; //                                 |
                                                                    //                                          |
        if( reserveAReadbackSlot ){//                                                                           |
            theDbRn[totParticleIndTrackr.totaldbs + 7] = totParticleIndTrackr.totalcpu + 1;//    <---           |       // to know where to write its coordinates to
            totParticleIndTrackr.totalcpu += totParticleIndTrackr.readbackslotsize // add 4 locations
        }
        else{
            theDbRn[totParticleIndTrackr.totaldbs + 7] = 0; //nothin dont do it (see the "metaeight > 0f" in the compute.wgsl)
        }

        theDbRn[totParticleIndTrackr.totaldbs + 8] = reserved_particles.length; // Store how many different reserved particles SECTIONS for this role
        
        // Create the repository indexer at the front i guess omggg
        for(let ss = 0;ss < reserved_particles.length;ss++){

        }

        // NOTE * * * this is ___>>>>
        // totParticleIndTrackr.reservedpartsize   always 3

        // DONUT CHANGe< - ADD MORE INFO SLOTS - depending on the role - stored on the teal particle (t13)
        for(let ss = 0;ss < reserved_particles.length;ss++){


            dbInds_ToCircleBackTo[ss] = totParticleIndTrackr.totaldbs + 9 + (ss*totParticleIndTrackr.reservedpartsize) + 0;// store the index of the DB that needs to be updated after all the silly things
            // ^^^ THIS => EQUALS THAT -> \/
            theDbRn[totParticleIndTrackr.totaldbs + 9 + (ss*totParticleIndTrackr.reservedpartsize) + 0] = 0;// becomes the starting index in the particle array to access
            theDbRn[totParticleIndTrackr.totaldbs + 9 + (ss*totParticleIndTrackr.reservedpartsize) + 1] = reserved_particles[ss].size;
            theDbRn[totParticleIndTrackr.totaldbs + 9 + (ss*totParticleIndTrackr.reservedpartsize) + 2] = reserved_particles[ss].t;

        }


        // This is the DB RN
        totParticleIndTrackr.totaldbs += 9 + (totParticleIndTrackr.reservedpartsize*reserved_particles.length);
    }

    else{
        throw new Error("WHAttt there's no nuclear particle? (TEAL o,255,255)")
    }



    // Calculate the radius used for all the collision balls here
    addTheShrinkWrap_std(locationsOfTheseNewEntities, voxelspacings, collShrinkWrapInds, totParticleIndTrackr);

    for(let u = 0;u < collShrinkWrapInds.length;u++){
        //locationsOfTheseNewEntities[ collShrinkWrapInds[u] ].sectionIndexOneDBEntry = 0.3;// the RADIUS somehow?!

        // THIS part gonna be seprate dshortly not all teal cubesa re good guys..
        //[ 0 + totParticleIndTrackr.MAX_good_guys + totParticleIndTrackr.badguys ]


        // theDbRn[0 + totParticleIndTrackr.goodguys] = locationsOfTheseNewEntities[ collShrinkWrapInds[u] ].id; 
        // totParticleIndTrackr.goodguys++;
    }



    // voxelspacings /= detailcube;// scale the connection size 

    // centerNucleausParticle the id of the center particle

    addTheSprings_std(locationsOfTheseNewEntities, voxelspacings*bindunits, voxelspacings, voxelspacings*orientinunits, 
        centerNucleausParticle, indOfTealParticle, rendm.allowedspringtypes, 
        totParticleIndTrackr, 
        orpartids,//orienterParticleIds <- these are just the particle ids not their location in inded like orpartids is 
        collShrinkWrapInds// list of collision balls becuase the pain job needs to be done on them too 
    );


    

    // Now add these particle reservations in?

    for(let cc = 0;cc < reserved_particles.length;cc++){

        let startAndSize = reserveSomeParticlesHelper( x, y, z, centerNucleausParticle,
            locationsOfTheseNewEntities, reserved_particles[cc].size, reserved_particles[cc].t,
            totParticleIndTrackr, cc,
            reserved_particles[cc].smk
        );
        theDbRn[ dbInds_ToCircleBackTo[cc] ] = startAndSize.start;  // finally set the db so that the role can access these 

        // Check to see if considered a weapon
        for(let ll = 0;ll < totParticleIndTrackr.Considered_Weapons.length;ll++){
            if( reserved_particles[cc].t === totParticleIndTrackr.Considered_Weapons[ll] ){// is the desired type of particle a WEAPON
                weapon_registration_slots.push( startAndSize.start );// now this is the weapon 
                ll = totParticleIndTrackr.Considered_Weapons.length;
                // if( reserved_particles[cc].size !== 1 ){
                //     throw new Error("if a reserved particle is of type WEAPON then u can only have size 1");
                // }
            }
        }


    }


    // Check what wen twront potneatl
    for(let h = 0;h < theDbRn.length;h++){
        if(isNaN(theDbRn[h])){
            console.log('failed at ', h)
            throw new Error('what da heck invaldie numb in db rn')
        }
    }
    
    // console.log("centerNucleausParticle");
    // console.log(centerNucleausParticle);
    // console.log("orienterParticleIds");
    // console.log(orienterParticleIds);
    // console.log("collShrinkWraps");
    // console.log(collShrinkWraps);

    totParticleIndTrackr.currentlistofweaponsparticles =
        totParticleIndTrackr.currentlistofweaponsparticles.concat( weapon_registration_slots );
    totParticleIndTrackr.weaponsind = totParticleIndTrackr.weaponsind + weapon_registration_slots.length;
                                                                                    // array
    return {start: startofthis, size: thisSize, nucleus: centerNucleausParticle-1, scratchPadIndex1dLocation: scratchpad_exactStartIndex, newWeaponParticleInds: weapon_registration_slots };


}
function getVoxelModel(nameval){
    for(let b = 0;b < voxelData.length;b++){
        if(voxelData[b].name === nameval){
            return voxelData[b];
        }
    }
    return null;
}

function loadInBlob1Model(std, name){

}


function addNewParticle(){

}

