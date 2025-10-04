// mailer.js - Modern Mailgun.js implementation

const FormData = require('form-data');
const Mailgun = require('mailgun.js');
const fs = require('fs');
const handlebars = require('handlebars');
const path = require('path');

// Initialize Mailgun client - using environment variables for security
const mailgun = new Mailgun(FormData);
const mg = mailgun.client({
    username: 'api',
    key: process.env.MAILGUN_API_KEY, // Always use environment variable
    // url: "https://api.eu.mailgun.net" // Uncomment if using EU domain
});

// Security check - ensure API key is loaded
if (!process.env.MAILGUN_API_KEY) {
    console.error('❌ MAILGUN_API_KEY not found in environment variables!');
    console.error('Please add your Mailgun API key to the .env file');
}

if (!process.env.EMAIL_DOMAIN) {
    console.error('❌ EMAIL_DOMAIN not found in environment variables!');
    console.error('Please add your Mailgun domain to the .env file');
}

// Function to render email template
const renderEmailTemplate = (templateData) => {
    try {
        // Read the email template file
        const templatePath = path.join(__dirname, '../email.handlebars');
        const templateSource = fs.readFileSync(templatePath, 'utf8');
        
        // Compile the template
        const template = handlebars.compile(templateSource);
        
        // Render with data
        return template(templateData);
    } catch (error) {
        console.log('❌ Template rendering error:', error);
        // Fallback to simple HTML
        return `
            <html>
                <body>
                    <h2>🐾 Pet Purchase Confirmation</h2>
                    <p>Congratulations on your new pet, ${templateData.petName}!</p>
                    <p>You paid $${templateData.amount}</p>
                    <p>Purchase Date: ${templateData.purchaseDate}</p>
                    <p>Thank you for choosing Pete's Pet Emporium!</p>
                </body>
            </html>
        `;
    }
};

// Modern Mailgun send function
async function sendSimpleMessage(user, req, res) {
    try {
        console.log('📧 Sending email to:', user.email);
        
        // Render the email HTML
        const emailHtml = renderEmailTemplate(user);
        
        const data = await mg.messages.create(process.env.EMAIL_DOMAIN, {
            from: `Pete's Pet Emporium <postmaster@${process.env.EMAIL_DOMAIN}>`,
            to: [user.email],
            subject: "🐾 Pet Purchase Confirmation - Welcome to the Family!",
            html: emailHtml,
            text: `Congratulations ${user.petName ? 'on your new pet ' + user.petName : ''}! You paid $${user.amount}. Thank you for choosing Pete's Pet Emporium!`
        });

        console.log('✅ Email sent successfully:', data.id);
        res.redirect(`/pets/${req.params.id}?purchased=true&email=sent`);
        
    } catch (error) {
        console.log('❌ Email sending error:', error);
        res.redirect(`/pets/${req.params.id}?purchased=true&email=error`);
    }
}

// Export the send mail function
module.exports.sendMail = sendSimpleMessage;