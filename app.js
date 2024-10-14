const express = require('express');
const app = express();
const dotenv = require("dotenv");
dotenv.config({
  path: `.env.${process.env.NODE_ENV}`
})

app.get('/', (req, res) => {
  res.send('Merhaba Dünya!');
});

const PORT = process.env.PORT || 3000;

if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`Server ${PORT} üzerinden çalışıyor.`);
  });
}

module.exports = app;
