const AssistantV1 = require('watson-developer-cloud/assistant/v1');
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

app.post('/conversation/', (req, res) => {
  const { text, context = {} } = req.body;

  const params = {
      input: { text },
      workspace_id: process.env.WORKSPACE_ID,
      context,
  };

  assistant.message(params, (err, response) => {
      if(err) { 
          res.status(500).json(err);
      } else if(response.output.nodes_visited && response.output.nodes_visited[0] == "Em outros casos") {
          const reqDiscovery = {
            environment_id: process.env.ENVIRONMENT_ID,
            collection_id: process.env.COLLECTION_ID,
            natural_language_query: params.input,
          }; // JSON de requisição no Discovery
          
          return new Promise((resolve, reject) => {
              discovery.query(reqDiscovery, (err, resp) => {
                  if(err) {
                      reject(err);
                  } else {
                      resolve(resp);
                      console.log(resp);
                  }
              });

              return new Promise((resolve, reject) => {
                  let resp = [];
                  let docFound = false;
                  async.eachSeries(resultadoDiscovery.results, (result, cb) => {
                      // so considera valores acima de 25%            
                      if(result.result_metadata.score > 0.25){
                          docFound = true;
                          resp.push(result.text);
                      }
                      cb();
                  }, (err) => {
                      //caso tenha encontrado algum documento com score > 60%
                      if(docFound)
                          resolve(resp[0]);
                      else 
                          resolve('Nada encontrado...')
                  });
              })
          });
                     
          console.log(resposta);        
          // Adiciona o resultado do discovery no resultado do Assistant
          response.output.text = response.output.text.concat(resposta);
          res.json(response);
          console.log(resposta);
          
      } else {
          res.json(response);
      }

  });
});

app.listen(port, () => console.log(`Server start. Running on port: ${port}`));