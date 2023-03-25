// Image Endpoint

const Clarifai = require('clarifai');
const { config } = require('dotenv');

config();

// const returnClarifaiRequestOptions = (imageUrl) => {
//   // Your PAT (Personal Access Token) can be found in the portal under Authentification
//   const PAT = process.env.PAT;
//   // Specify the correct user_id/app_id pairings
//   // Since you're making inferences outside your app's scope
//   const USER_ID = process.env.USER_ID;
//   const APP_ID = process.env.APP_ID;
//   // Change these to whatever model and image URL you want to use
//   // const MODEL_ID = process.env.MODEL_ID;
//   // const MODEL_VERSION_ID = process.env.MODEL_VERSION;
//   const IMAGE_URL = 'imageUrl';

//   const raw = JSON.stringify({
//     "user_app_id": {
//       "user_id": USER_ID,
//       "app_id": APP_ID
//     },
//     "inputs": [
//       {
//         "data": {
//           "image": {
//             "url": IMAGE_URL
//           }
//         }
//       }
//     ]
//   });

//   const requestOptions = {
//         method: 'POST',
//         headers: {
//             'Accept': 'application/json',
//             'Authorization': 'Key ' + PAT
//         },
//         body: raw
//     };

//   return requestOptions
// }

// Clarifai And Andrei Way
// fetch("https://api.clarifai.com/v2/models/" + 'face-detection' + "/outputs", returnClarifaiRequestOptions(this.state.imageUrl))

const app = new Clarifai.App({
  apiKey: process.env.API_KEY
});

const handleApiCall = (req, res) => {
  app.models.predict(
    {
    id: process.env.MODEL_ID,
    name: process.env.MODEL_NAME,
    version: process.env.MODEL_VERSION,
    type: process.env.MODEL_TYPE,
  }, req.body.input)
  .then(data => {
    res.json(data)
  })
  .catch(err => res.status(400).json('unable to work with API'))
}
  

const handleImage = (req, res, db) => {

	const { id } = req.body;

	db('users').where('id', '=', id)
	.increment('entries', 1)
	.returning('entries')
	.then(entries => {
		// console.log(entries)
		res.json(entries[0].entries)
	})
	.catch(err => res.status(400).json('Unable to get entries'))

}

module.exports  = {
    handleImage: handleImage,
    handleApiCall: handleApiCall
}


