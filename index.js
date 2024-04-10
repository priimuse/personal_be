const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;

//heroku app at 
//https://immense-sands-12203-f6a7846ce7c0.herokuapp.com/
//$5/month :(
//https://devcenter.heroku.com/articles/getting-started-with-nodejs?singlepage=true#set-up


function keyValidator(testKeys, masterKeys){
	let failing = false;
	for (let i = 0; i < masterKeys.length; i++) {
		if (!testKeys.includes(masterKeys[i])) failing = true;
	}
	for (let i = 0; i < testKeys.length; i++) {
		if (!masterKeys.includes(testKeys[i])) failing = true;
	}
	return failing;
}

function GetAuthToken(){
	return process.env.OPENAI_AUTH_TOKEN;
}

app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
	console.log("__dirname is:", __dirname);
	res.send('Hello World!');
});

//curl -X POST --data "{\"prompt\": \"What is the most commonly used word in dialogue for the movie Pulp Fiction?\"}" -H "Content-type: application/json" http://localhost:5000/simplePrompt
app.post('/simplePrompt', (req, res) => {
	console.log("request body: ", req.body);
	let fail = keyValidator(Object.keys(req.body), ["prompt"]);
	if (fail) {
		console.log("missing or unexpected request data.  leaving early.");
		res.send(`Error! ${req.body}`);
		return;
	}

	let prompt = req.body.prompt.toString();
	axios({
		method: 'post',
		url: 'https://api.openai.com/v1/chat/completions',
		responseType: 'json', 
		data: {
			model: "gpt-3.5-turbo",
			messages: [
			           {role: "user", content: prompt}
			]
		},
		headers: {
			"Content-type": "application/json",
			"Authorization": "Bearer " + GetAuthToken()
		}
	})
	.then((response) => {
		let resp = response.data?.choices[0]?.message?.content;
		console.log("  prompt of:", prompt);
		console.log("response of:", resp);
		res.send(resp)
	})
	.catch((err) => {
		res.send(`Error! ${err}`);
	})
});

//curl -X POST --data "{\"prompt\": \"A happy face sun melting all the ice cream.\"}" -H "Content-type: application/json" http://localhost:5000/simpleImagePrompt
app.post('/simpleImagePrompt', (req, res) => {
	console.log("request body: ", req.body);
	let fail = keyValidator(Object.keys(req.body), ["prompt"]);
	if (fail) {
		console.log("missing or unexpected request data.  leaving early.");
		res.send(`Error! ${req.body}`);
		return;
	}

	let prompt = req.body.prompt.toString();
	axios({
		method: 'post',
		url: 'https://api.openai.com/v1/images/generations',
		responseType: 'json',
		data: {
			model: "dall-e-3",
			prompt: prompt,
			n: 1,
			size: "1024x1024",
			response_format: "b64_json"
		},
		headers: {
			"Content-Type": "application/json",
			"Authorization": "Bearer " + GetAuthToken()
		}
	})
	.then((response) => {
		console.log("image generation SUCCESS!");
		res.send(response.data.data[0].b64_json);
	})
	.catch((err) => {
		res.send(`Error! ${err}`);
	})
})

app.listen(port, () => {
	console.log(`Now listening on port ${port}`);
})