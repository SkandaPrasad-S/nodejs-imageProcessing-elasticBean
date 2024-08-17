import express from 'express';
import bodyParser from 'body-parser';
import { filterImageFromURL, deleteLocalFiles } from './util/util.js';
import fetch from 'node-fetch'; // Ensure you have this package installed

async function checkImage(url) {
  try {
    const res = await fetch(url);

    // Check if the response is okay (status code 200-299)
    if (!res.ok) {
      throw new Error(`Failed to fetch the image. Status: ${res.status}`);
    }

    const buff = await res.blob();

    // Check if the content type is an image
    if (!buff.type.startsWith('image/')) {
      throw new Error(`The URL does not point to an image. Content type: ${buff.type}`);
    }

    return true;
  } catch (error) {
    console.error('Error in checkImage:', error.message);
    return false;
  }
}

// Init the Express application
const app = express();

// Set the network port
const port = process.env.PORT || 8082;

// Use the body parser middleware for post requests
app.use(bodyParser.json());

app.get("/filteredimage", async (req, res) => {
  const { image_url } = req.query;

  // 1. Validate the image_url query
  if (!image_url) {
    return res.status(400).send({ message: 'Image URL is required' });
  }
  const is_image = await checkImage(image_url);

  if (!is_image) {
    return res.status(422).send({ message: 'Invalid Image URL' });
  }

  console.log("This image is validated")
  try {
    // 2. Call filterImageFromURL(image_url) to filter the image
    const filteredPath = await filterImageFromURL(image_url);
    console.log(filteredPath)

    // 3. Send the resulting file in the response
    res.status(200).sendFile(filteredPath, () => {
      // 4. Delete any files on the server after the response is finished
      deleteLocalFiles([filteredPath]);
    });
  } catch (error) {
    console.error('Error in filtering image:', error);
    return res.status(500).send({ message: 'Unable to process the image due to', error });
  }
});

app.get("/", async (req, res) => {
  res.send("try GET /filteredimage?image_url={{}}");
});

// Start the Server
app.listen(port, () => {
  console.log(`server running http://localhost:${port}`);
  console.log(`press CTRL+C to stop server`);
});
