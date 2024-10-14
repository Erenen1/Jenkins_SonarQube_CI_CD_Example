const express = require('express');
const redis = require('redis');
const { Sequelize, DataTypes } = require('sequelize');
require("dotenv").config({
  path: `.env.${process.env.NODE_ENV}`
})

let User;
let redisClient;

connectPostreSQL();
connectRedis();

const app = express();
app.use(express.json());

app.post('/users', async (req, res) => {
  const { name, age } = req.body;
  try {
    const newUser = await User.create({ name, age });

    await redisClient.set(`user:${newUser.id}`, JSON.stringify(newUser));
    res.status(200).json(newUser);
  } catch (err) {
    console.error(err.message);
    res.status(500).send(err.message);
  }
});

app.get('/users/:id', async (req, res) => {
  const userId = req.params.id;
  try {
    let user = await redisClient.get(`user:${userId}`);
    if (!user) {
      user = await User.findByPk(userId);

      if (!user) {
        return res.status(404).send('User not found');
      }

      await redisClient.set(`user:${userId}`, JSON.stringify(user));
      res.status(200).json(user);
    }
    res.json(JSON.parse(user));

  } catch (error) {
    console.log(error);
    res.status(500).json("Server error");
  }

});

const PORT = process.env.PORT || 3000;

if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}



function connectPostreSQL() {
  const sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
  });

  User = sequelize.define('users', {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    age: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  }, {
    tableName: 'users',
    timestamps: false,
  });

  sequelize.authenticate()
    .then(() => {
      console.log('Connected to PostgreSQL');

      return sequelize.sync();
    })
    .then(() => {
      console.log('Table synchronized');
    })
    .catch((err) => {
      console.error('Unable to connect to the database or sync the table:', err);
    });
}

async function connectRedis() {
  console.log(`redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`);
  redisClient = redis.createClient({
    url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`
  });
  redisClient.on('connect', () => {
    console.log('Redis baglantisi basarili.');
  });
  await redisClient.connect();
}


