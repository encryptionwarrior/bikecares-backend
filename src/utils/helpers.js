import express from "express";
import logger from "../logger/winston.logger.js";
import fs from "fs"


export const removeLocalFile = (localPath) => {
    fs.unlink(localPath, (err) => {
        if(err) logger.error("Error while removing local files: ", err);
        else {
            logger.info("Removed local: ", localPath)
        }
    })
}

export const getStaticFilePath = (req, fileName) => {
  return `${req.protocol}://${req.get("host")}/image/${fileName}`
}

export const getLocalPath = (fileName) => {
  return `public/images/${fileName}`
}

export const removeUnusedMulterImageFilesOnError = (req) => {
    try {
      const multerFile = req.file; // Now properly typed
      const multerFiles = req.files; // Now properly typed
  
      if (multerFile) {
        removeLocalFile(multerFile.path);
      }
  
      if (multerFiles) {
        if (Array.isArray(multerFiles)) {
          // If `req.files` is an array
          multerFiles.forEach((fileObject) => {
            removeLocalFile(fileObject.path);
          });
        } else {
          // If `req.files` is an object with fields
          Object.values(multerFiles).forEach((fileFields) => {
            fileFields.forEach((fileObject) => {
              removeLocalFile(fileObject.path);
            });
          });
        }
      }
    } catch (error) {
      logger.error("Error while removing image files: ", error);
    }
  };