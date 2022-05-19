const monday = require('monday-sdk-js')();
const { upload } = require('./monday-uploader');
const http = require('http');
const https = require('https');
const logger = require('./logger');

async function processSave(body, user, params) {
    // check permissions

    let dlUrl = body.url;
    // if null throw

    logger.debug("Downloading file", { url: dlUrl })
    let stream = await downloadFile(dlUrl);
    
    // check filetype and change if needed
    let newId = await upload(stream, params.filename, user, params.itemId);

    let jsonChange = JSON.stringify({
        removed_file:
        {
            fileType: "ASSET",
            assetId: params.docId,
        },
        updated_file: 
        {
            fileType: "ASSET",
            assetId: newId,
            previousAssetId: params.docId,
            name: params.filename,
            isImage: false,
            isVersion: true,
            //createdAt: 1651736852266,
            //createdBy: user.id.toString()
        }
        }).replace(/"/g,'\\"');
    let updateQuery =
    `
        mutation {
            change_column_value (board_id: ${params.boardId}, item_id: ${params.itemId}, column_id: "files", value: "${jsonChange}") {
                id
            }
        }
    `;

    logger.debug("Updating file version", { updateQuery: updateQuery });
    let changeResult = await monday.api(updateQuery, { token: user.token });
}

async function downloadFile(url) {
    return new Promise((resolve, reject) => {
        let func = url.startsWith("https") ? https : http;
        func.get(url, async res => {
            resolve(res);
        });
    });
}

module.exports = {
    processSave: processSave
};