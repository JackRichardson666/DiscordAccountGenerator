let imaps = require('imap-simple');
const simpleParser = require('mailparser').simpleParser;
const _ = require('lodash');
const fs = require(`fs`)

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

module.exports = {
    getVerLink: function(str,csrf) {
        return new Promise((resolve, reject) => {
            mail.getMessage(str, csrf, function(e, b) {
                if (e) return resolve({success: false,error:e}) ;
                resolve({success: true,message: `https://click.discord.com/` + b.split(`https://click.discord.com/`)[2].split("\"")[0]});
            })
        })
    },

    pickmail: function() {
        const read = JSON.parse(fs.readFileSync(`./mails.json`,`utf-8`));
        const name = Object.keys(read)[Math.floor(Math.random() * Object.keys(read).length)];
        const pass = read[name];
        return {name: name,pass: pass};
    },

    getmessage: function(mail,password) {
        return new Promise((resolve, reject) => {
            const config = {imap: {user: mail+"@gmail.com",password: password,host: 'imap.gmail.com',port: 993,tls: true,authTimeout: 3000}};

            imaps.connect(config).then(function (connection) {
                return connection.openBox('INBOX').then(function () {
                    const searchCriteria = ['UNSEEN'];
                    const fetchOptions = {bodies: ['HEADER', 'TEXT', ''],markSeen: true};;
                    return connection.search(searchCriteria, fetchOptions).then(function (messages) {
                        messages.forEach(function (item) {
                            const all = _.find(item.parts, { "which": "" })
                            const id = item.attributes.uid;
                            const idHeader = "Imap-Id: "+id+"\r\n";
                            simpleParser(idHeader+all.body, (err, mail) => {
                                if(mail.subject.search(`Discord`) > -1){const krut = mail.html.split(`Подтвердить e-mail`)[0].slice(-2000).match(/http[^ ]+/g)[0].slice(0,-1);resolve(krut)}
                            });
                        });
                    });
                });
            });
        })
    }
}
