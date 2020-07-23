const db = require('../../data/dbConfig.js');

module.exports = {
    getTopThree,
    getFinalScores,
    rankIt,
    addIP,
    getWinner,
    get,
};



async function getTopThree(){
    return await db("topThree")
    .join('users', 'topThree.user_id', 'users.id')
    .join('submissions', 'submissions.id', 'topThree.story_id')
    .orderBy('topThree.id', 'desc').limit(3)
    .select(
        'topThree.id as id',
        'submissions.userId',
        'users.username',
        'submissions.image',
        'submissions.pages',
    )
}

async function get(){
    return await db("topThree").orderBy('id', 'desc').limit(3)
}
async function getFinalScores(){
    //return 3 ids

    const topThree = await db("topThree")
    //O(3)
    let allRanks = topThree.map( el => {

        let one = db("ranking").where("topThreeId", el.id ).count({ rank: 1 })
        let two = db("ranking").where("topThreeId", el.id ).count({ rank: 2 })
        let three = db("ranking").where("topThreeId", el.id ).count({ rank: 3 })
        
        const allNums = Promise.all([one, two, three])

        let totalScore = ((allNums[0]*3) + (allNums[1]*2) + (allNums[2]))
        return {
            ...el,
            score: totalScore
        }
        
    })

    return allRanks
};

async function rankIt(topThreeId, rank){
    return await db("ranking").insert({ rank }).where({ topThreeId });
};

async function addIP(newIP){
    const today = moment().format("MMM Do YY");
    return await db("votersIP").insert({ ip: newIP, date_voted: today })
}

async function getWinner(winnerId){
    return await db("topThree")
    .where({ topThreeId: winnderId })
    .join("users", "topThree.user_id", "users.id")
    .first()
}