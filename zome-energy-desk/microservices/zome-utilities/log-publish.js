const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const {exec} = require('child_process');

const schedule = require('node-schedule');
const AWS = require('aws-sdk');
const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
    region: process.env.REGION
});

function logPublisher(){
    // find all *.log file from all director and copy to log-publish folder
    exec('find ../ -name "log"', (err, stdout, stderr) => {
        stdout.split('\n').forEach((file, i) => {
            if (file.length > 0) {
                exec(`cp -r ${file} ./log-publish/${file.split('/')[1]}-${Date.now()}`, (err, stdout, stderr) => {
                    if (err) {
                        console.log(err);
                    }
                    // exec(`rm ${file}/*`, (err, stdout, stderr) => {})
                })
    
                if (i === stdout.split('\n').length - 2) {
                    let zipFile = `log-publish-${Date.now()}.zip`;
                    exec(`zip -r ${zipFile} log-publish`, async(err, stdout, stderr) => {
                        if (err) {
                            console.log(err);
                        }
                        exec(`rm -r ./log-publish/*`, (err, stdout, stderr) => {
                            if (err) {
                                console.log(err);
                            }
                        })
                        // Upload log-publish-*.zip to S3 bucket using aws-sdk
                        let uploadZip = await s3.upload({
                            Bucket: process.env.LOGS_BUCKET,
                            Key: zipFile,
                            Body: fs.createReadStream(zipFile),
                            // ACL: 'public-read'
                        }).promise();
                        console.log(uploadZip);
                        if (uploadZip.Location) {
                            console.log(`Logs published to ${uploadZip.Location}`);
                            exec(`rm ${zipFile}`, (err, stdout, stderr) => {})
                        }
                        
                    })
                }
            }
        })
    })
}


// schedule the job for every day at 12:00
const job = schedule.scheduleJob('11 10 * * *', async() => {
    await logPublisher();
});


