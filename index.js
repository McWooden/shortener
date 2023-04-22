require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const shortid = require('shortid')
app.use(bodyParser.urlencoded({extended: false}))
// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));
// schema
const uriSchema = new mongoose.Schema({
  original_url: String,
  short_url: String
});

const URI = mongoose.model('URI', uriSchema);
// root
app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.post('/api/shorturl', async (req, res) => {
  let bodyUrl = req.body.url
  console.log(bodyUrl)
  let itSave, already
  const urlRegex = /^(https?|ftp):\/\/(-\.)?([^\s/?.#-]+\.?)+(\/[^\s]*)?$/
  if (!urlRegex.test(bodyUrl)) return res.json({ error: 'invalid url' })
  try {
    already = await URI.findOne({original_url: bodyUrl})
    return res.json({original_url: already['original_url'],short_url: already['short_url']})
  } catch (error) {}
  let uri = new URI({
    original_url: bodyUrl,
    short_url: shortid.generate()
  })
  try {
    itSave = await uri.save()
    return res.json({original_url: uri['original_url'],short_url: uri['short_url']})
  } catch (error) {
    return res.json({error: 'tidak bisa di save, kembali lagi nanti', message: error})
  }
})

app.get('/api/shorturl/:any', async (req, res) => {
  let siuuu
  try {
    siuuu = await URI.findOne({short_url: req.params.any})
    res.redirect(siuuu.original_url)
  } catch (error) {
    res.json({error: 'cannot find ' + req.params.any})
  }
})
app.get('/api/clear/shorturl',  async (req, res) => {
  let deleteAll
  try {
    deleteAll = await URI.deleteMany({})
    return res.json({success: 'done'})
  } catch (error) {
    return res.json({error: 'Error delete many'})
  }
})

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true }).then(() => {
  app.listen(port, () => {
    console.log(`Listening on port ${port} and connected to db`)
  })
}).catch(err => {
  console.error(err)
})
