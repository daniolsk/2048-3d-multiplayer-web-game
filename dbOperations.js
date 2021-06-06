const Score = require('./models/Score');

const saveScore = (scoreObj, res) => {
    let newScore = new Score({
        nick: scoreObj.nick,
        date: new Date(),
        score: scoreObj.score
    });

    newScore.save().then(() => {
        res.send(JSON.stringify({message: "Score saved!"}));
    }).catch(err => console.log(err));
}

const getBestScores = (res) => {
    Score.find({})
        .sort({ messages: -1 })
        .limit(10)
        .then(scores => {
            res.send(JSON.stringify({scores: scores}));
        });
}

module.exports = { saveScore, getBestScores };