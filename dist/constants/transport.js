import nodemailer from "nodemailer";
import dotenv from "dotenv";
import path from "path";
import hbs, {} from "nodemailer-express-handlebars";
dotenv.config();
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});
const handlebarOptions = {
    viewEngine: {
        extName: ".hbs",
        partialsDir: path.resolve("./templetes"),
        defaultLayout: false,
    },
    viewPath: path.resolve("./templates"),
    extName: ".hbs",
};
transporter.use("compile", hbs(handlebarOptions));
export async function sendEmail(email, data) {
    const messageOptions = {
        from: `"Tiko" <${process.env.SMTP_USER}>`,
        to: email,
        subject: "Welcome to Tiko!",
        template: "invite",
        context: data,
    };
    return await transporter.sendMail(messageOptions);
}
