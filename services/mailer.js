const nm = require("nodemailer");
const ses = require("nodemailer-ses-transport");
const hbs = require("nodemailer-express-handlebars");

const transporter = nm.createTransport(
    ses(
        {
            accessKeyId: process.env.AWS_ACCESS_KEY,
            secretAccessKey: process.env.AWS_SECRET_KEY
        }
    )
);

const handlebarOptions = {
    viewEngine:
    {
        extName: ".handlebars",
        partialsDir: "./templates/",
        layoutsDir: "./templates/",
        defaultLayout: ""
    },
    viewPath: "./templates/",
    extName: ".handlebars"
};

transporter.use("compile", hbs(handlebarOptions));

function SendMail(
    toAddress, // E-Mail to send to
    subject, //E-Mail subject line
    templateFile, // Name of file BEFORE .handlebars
    paramaterObject // Object containing paramaters to place inside email
)
{
    let MailOptions = {
        from: "StorySquad <support@storysquad.app>",
        to: toAddress,
        subject: subject,
        context: paramaterObject,
        template: templateFile
    };

    return new Promise(function (resolve, reject)
    {
        transporter.sendMail(MailOptions, (err, info) =>
        {
            if (err)
                resolve(false);
            else
                resolve(info);
        });
    });
}

module.exports = {
    SendMail
};