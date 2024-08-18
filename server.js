import express from 'express';
import bodyParser from 'body-parser';
import { filterImageFromURL, deleteLocalFiles } from './util/util.js';
import axios from 'axios';

async function checkImage(url) {
  try {
    const response = await axios.get(url, {
      responseType: 'arraybuffer'
    });
    
    const contentType = response.headers['content-type'];
    if (!contentType.startsWith('image/')) {
      throw new Error(`The URL does not point to an image. Content type: ${contentType}`);
    }
    
    return true;
  } catch (error) {
    console.error('Error in checkImage:', error.message);
    return false;
  }
}

const app = express();
const port = process.env.PORT || 8082;
app.use(bodyParser.json());

app.get("/filteredimage", async (req, res) => {
  const { image_url } = req.query;

  if (!image_url) {
    return res.status(400).send({ message: 'Image URL is required' });
  }

  const is_image = await checkImage(image_url);
  if (!is_image) {
    return res.status(422).send({ message: 'Invalid Image URL' });
  }

  console.log("This image is validated");

  try {
    const filteredPath = await filterImageFromURL(image_url);
    console.log("Filtered image path:", filteredPath);

    res.status(200).sendFile(filteredPath, (err) => {
      if (err) {
        console.error("Error sending file:", err);
      }
      deleteLocalFiles([filteredPath]);
    });
  } catch (error) {
    console.error('Error in filtering image:', error);
    return res.status(500).send({ 
      message: 'Unable to process the image',
      error: error.message,
      stack: error.stack
    });
  }
});

app.get("/", async (req, res) => {
  res.send("try GET /filteredimage?image_url={{}}");
});

app.listen(port, () => {
  console.log(`server running http://localhost:${port}`);
  console.log(`press CTRL+C to stop server`);
});