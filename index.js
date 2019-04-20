const AssistantV1 = require('watson-developer-cloud/assistant/v1');
const Discovery = require('watson-developer-cloud/discovery/v1');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(bodyParser.json());
app.use(cors());

const port = process.env.PORT || 8080;

//Instanciar o novo assistant
const assistant = new AssistantV1({
  iam_apikey: process.env.API_KEY,
  url: 'https://gateway.watsonplatform.net/assistant/api/',
  version: '2018-02-16',
});

const discovery = new Discovery({
  version: '2018-08-01',
  iam_apikey: process.env.API_KEY_DISCOVERY
});

const async = require('async');

app.post('/conversation/', (req, res) => {
  const input = {
      text: req.body.input
  }
  const context = req.body.context;

  const params = {
    workspace_id: process.env.WORKSPACE_ID,
    context: context || {},
    input: input || {}
  };

  assistant.message(params, (err, response) => {
      if(err) { 
          res.status(500).json(err);
      } else {
          res.json(response);
      }

  });
});

app.listen(port, () => console.log(`Server start. Running on port: ${port}`));