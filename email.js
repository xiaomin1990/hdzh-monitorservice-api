
const nodemailer = require('nodemailer');

// create reusable transporter object using the default SMTP transport
let transporter = nodemailer.createTransport({
    host: 'smtp.yeah.net',
    port: 25,
    secure: false, // true for 465, false for other ports
    auth: {
        user: "", // generated ethereal user
        pass: ""  // generated ethereal password
    }
});



function send(to, subject, contenthtml) {
    // setup email data with unicode symbols
    let mailOptions = {
        from: '', // sender address
        to: to, // list of receivers
        subject: subject, // Subject line
        html: contenthtml
    };

    // send mail with defined transport object
    transporter.sendMail(mailOptions, (error, info) => {
        console.log('sendMail:', error);
        if (error) {
            return console.log(error);
        }
        console.log('Message sent: %s', info.messageId);
        // Preview only available when sending through an Ethereal account
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));

        // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@blurdybloop.com>
        // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
    });
}

function sleep(d) {
    for (var t = Date.now(); Date.now() - t <= d;);
}

const fs = require('fs');
var emailpath = "/Users/dbman/Documents/email/emails.txt";
var str = fs.readFileSync(emailpath, "utf8");
var emails = str.split("\r\n");

var htmlpath = "/Users/dbman/Documents/email/content.htm";
var contenthtml = fs.readFileSync(htmlpath, "utf8");

//console.log(contenthtml);

setInterval(function () {
    var to = emails.shift();
    console.log(to);
    send(to, "CISCO stocklist,Beijing DLXC 2017-09-12", contenthtml);
}, 10000)

