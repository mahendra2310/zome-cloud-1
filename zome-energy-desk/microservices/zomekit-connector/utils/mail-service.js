const nodemailer = require('nodemailer');

module.exports = async ({ email, subject, html }) => {
    try {
        const transport = nodemailer.createTransport({
            host: "smtp.zoho.in",
            port: 465,
            secure: true,
            auth: {
                user: process.env.EMAIL,
                pass: process.env.EMAIL_PWD,
            },
        });
        let mailOptions = {
            from: process.env.EMAIL,
            cc: [process.env.EMAIL],
            to: email ? email : [],
            subject: subject,
            html: html ? html : "",
        }
       return transport.sendMail(mailOptions, (err, result) => {
            if (err) {
                console.log("er =", err);
                return ({ status: 0, message: err });
            }
            console.log("mail result err =", err);
            console.log("mail result =", result);
         return result
        });
    } catch (error) {
        console.log("Error in sendMail");
        return error;
    }
}