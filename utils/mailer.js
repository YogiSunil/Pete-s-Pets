const FormData = require('form-data');
const Mailgun = require('mailgun.js');

const mailgun = new Mailgun(FormData);
const mg = mailgun.client({
    username: 'api',
    key: process.env.MAILGUN_API_KEY
});

module.exports.sendMail = (user, req, res) => {
  const domain = process.env.EMAIL_DOMAIN;
  
  const messageData = {
    from: `Pete's Pet Emporium <noreply@${domain}>`,
    to: user.email,
    subject: 'Pet Purchase Confirmation',
    html: `
      <h2>🐾 Pet Purchase Confirmation</h2>
      <p>Congratulations on your new pet, ${user.petName}!</p>
      <p>You paid $${user.amount}</p>
      <p>Purchase Date: ${user.purchaseDate}</p>
      <p>Thank you for choosing Pete's Pet Emporium!</p>
    `
  };

  mg.messages.create(domain, messageData)
    .then(msg => {
      console.log('✅ Email sent successfully:', msg);
      res.redirect(`/pets/${req.params.id}?purchased=true&email=sent`);
    })
    .catch(err => {
      console.log('❌ Email sending failed:', err);
      res.redirect(`/pets/${req.params.id}?purchased=true&email=error`);
    });
};