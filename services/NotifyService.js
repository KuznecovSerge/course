"use strict";
const nodemailer = require("nodemailer");
const sgMail = require('@sendgrid/mail');
const mailConfig = require("../config/mail.json");
const {
    notification
} = require("../models/index");
const db = require("../models/index");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

module.exports = {
  /**
   * * Создать уведомление
	 * @param {Object} модель содержит параметры entityId, referenceId, typeId, userId, message
   */
  CreateNotify(model) {
    return notification.create(model);
  },

	/**
   * * Получить список уведомлений
   */
  GetAllNotifications(model) {
    return notification.findAll(model);
	},
	
	/**
   * * Получить количество уведомлений
   */
  GetCountNotifications(whereModel) {
    return notification.count({
      where: whereModel
    });
	},
	
	/**
   * * Получить уведомление
   */
  GetOneNotification(model) {
    return notification.findOne(model);
	},

	/**
   * * Отправить email автору
	 * @param {String} email почта автора
	 * @param {String} message сообщение для автора
   */
  async SendMessageToAuthor(sender, recipient, message, files) {
		
		// на время разработки сообщения отправляются на адрес !отправителя!
    const emailTo = sender.email;  // recipient.email
    
    const attachments = files.map(file => {
      return { 
        filename: file.originalname,
        content: file.buffer.toString("base64"),
        disposition: "attachment" }
    });

    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    const msg = {
      to: emailTo,
      from: mailConfig.from,
      subject: 'Оповещение от сервиса Курсор - Вопрос от пользователя',
      html: `<h1>Вам пришло новое сообщение</h1> <br/> 
      Пользователь <strong>${sender.firstName} ${sender.lastName}</strong> задал вопрос: <br/>
      <br/>
      ${message} <br/>
      <br/>
      Для ответа автору, отправьте письмо по адресу: ${sender.email}`,
      attachments: attachments
    };
    
    return sgMail.send(msg);

    // const transporter = nodemailer.createTransport({
    //   ...mailConfig.transport,
    //   logger: ILogger
    // });

    // const attachments = files.map(file => {
    //   return { filename: file.originalname, content: file.buffer }
    // });

    return transporter.sendMail({
      from: mailConfig.from,
      to: emailTo,
      subject: "Оповещение от сервиса Курсор - Вопрос от пользователя",
			html: `<h1>Вам пришло новое сообщение</h1> <br/> 
				Пользователь <strong>${sender.firstName} ${sender.lastName}</strong> задал вопрос: <br/>
				<br/>
				${message} <br/>
				<br/>
        Для ответа автору, отправьте письмо по адресу: ${sender.email}`,
      attachments: attachments
    });

  },


  /**
   * * Отправить письмо для верификации email 
	 * @param {String} email почта пользователя
	 * @param {String} url адрес для подтверждения
   */
  async sendEmailVerification(emailTo, url) {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    const msg = {
      to: emailTo,
      from: mailConfig.from,
      subject: 'Курсор - подтвердите Ваш адрес электронной почты',
      html: `
        Подтвердите указанный Вами адрес электронной почты, <br/> 
        перейдя по ссылке: <a href="${url}">${url}</a>`,
    };
    return sgMail.send(msg);
  },


  /**
   * * Отправить письмо для смены пароля 
	 * @param {String} email почта пользователя
	 * @param {String} url адрес для смены пароля
   */
  async sendEmailResetPassword(emailTo, url) {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    const msg = {
      to: emailTo,
      from: mailConfig.from,
      subject: 'Курсор - восстановление пароля',
      html: `
        Вы запросили восстановление пароля.<br/>
        Если вы не делали запрос - просто проигнорируйте это сообщение. <br/>
        <br/>
        Для сброса пароля перейдите по ссылке: <a href="${url}">${url}</a>`,
    };
    return sgMail.send(msg);
  }

};
