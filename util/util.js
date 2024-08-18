import fs from "fs";
import Jimp from "jimp";
import axios from "axios";

export async function filterImageFromURL(inputURL) {
  return new Promise(async (resolve, reject) => {
    try {
      // Fetch the image data using axios
      const response = await axios.get(inputURL, {
        responseType: 'arraybuffer'
      });

      // Create a buffer from the response data
      const buffer = Buffer.from(response.data, 'binary');

      // Read the image using Jimp
      const photo = await Jimp.read(buffer);

      const outpath = "/tmp/filtered." + Math.floor(Math.random() * 2000) + ".jpg";
      await photo
        .resize(256, 256) // resize
        .quality(60) // set JPEG quality
        .greyscale() // set greyscale
        .write(outpath, (img) => {
          resolve(outpath);
        });
    } catch (error) {
      console.error("Error in filterImageFromURL:", error);
      reject(error);
    }
  });
}

// The deleteLocalFiles function remains the same
export async function deleteLocalFiles(files) {
  for (let file of files) {
    fs.unlinkSync(file);
  }
}