module.exports = {
  'secret': 'R_RocketChallenge',
  'database': 'mongodb://bojang:rrcode1@code-challenge-shard-00-00-qthjy.mongodb.net:27017,code-challenge-shard-00-01-qthjy.mongodb.net:27017,code-challenge-shard-00-02-qthjy.mongodb.net:27017/rrcode?ssl=true&replicaSet=code-challenge-shard-0&authSource=admin',
  'port': process.env.PORT || 3000
}