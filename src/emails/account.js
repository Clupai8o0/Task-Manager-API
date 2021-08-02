//? sendGrid.com
const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

//* send email
const sendWelcomeEmail = (email, name) => {
	sgMail.send({
		to: email,
		from: "clupaio4@gmail.com", //* in future create a custom domain
		subject: "Thanks for joining in!",
		text: `${name} hope you enjoy your stay!!`,
		html: "<strong>This is a bold text</strong>",
	});
};

const sendCancelEmail = (email, name) => {
	sgMail.send({
		to: email,
		from: "clupaio4@gmail.com",
		subject: "Goodbye",
		text: `I'm sorry to hear about your cancel :< \nIf there was anyway we could've done better than please let us know :)`,
	});
};

module.exports = {
	sendWelcomeEmail,
	sendCancelEmail,
};
