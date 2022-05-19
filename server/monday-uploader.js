const fetch = require('node-fetch');
const FormData = require('form-data');
const logger = require('./logger');

const url = "https://api.monday.com/v2/file";

async function upload(stream, filename, user, itemId) { // add try and handle errors
    let query =
        `
            mutation ($file: File!) {
                add_file_to_column (item_id: ${itemId}, column_id: "files", file: $file) {
                    id
                }
            }
        `;

    let formData = new FormData();
    formData.append("query", query, { contentType: "application/json" });
    formData.append("variables[file]", stream, { contentType: "application/octet-stream", filename: filename });

    let options = {
        method: 'post',
        headers: formData.getHeaders(),
        body: formData,
    };
    options.headers.Authorization = user.token;

    logger.debug("Uploading file to monday", { req: {
        method: 'post',
        headers: options.headers,
        query: query
    }});

    let response = await fetch(url, options);
    let json = await response.json(); // should check if json contains any errors

    logger.debug("Uploaded file to monday", { json: json });

    return json.data.add_file_to_column.id;
}

module.exports = {
    upload: upload
};