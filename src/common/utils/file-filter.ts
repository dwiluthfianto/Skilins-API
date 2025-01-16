export const fileEbookFilter = (req, file, callback) => {
  const allowedMimeTypes = {
    thumbnail: ['image/jpeg', 'image/png'],
    file_url: ['application/pdf'],
  };

  const isValid = allowedMimeTypes[file.fieldname]?.includes(file.mimetype);

  if (!isValid) {
    return callback(
      new Error(`Invalid file type for ${file.fieldname}`),
      false,
    );
  }
  callback(null, true);
};

export const limits = {
  fileSize: 8 * 1024 * 1024,
};
