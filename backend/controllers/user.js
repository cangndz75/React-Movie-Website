const jwt = require("jsonwebtoken");
const User = require("../models/user");
const EmailVerificationToken = require("../models/emailVerificationToken");
const { isValidObjectId } = require("mongoose");
const { generateOTP, generateMailTransporter } = require("../utils/mail");
const { sendError, generateRandomByte } = require("../utils/helper");
const PasswordResetToken = require("../models/passwordResetToken");

exports.create = async (req, res) => {
  const { name, email, password } = req.body;

  const oldUser = await User.findOne({ email });

  if (oldUser) return sendError(res, "Bu E-mail zaten kullanılıyor!");

  const newUser = new User({ name, email, password });
  await newUser.save();

  let OTP = generateOTP();

  const newEmailVerificationToken = new EmailVerificationToken({
    owner: newUser._id,
    token: OTP,
  });

  await newEmailVerificationToken.save();


  var transport = generateMailTransporter();

  transport.sendMail({
    from: "verification@gunduzfilm.com",
    to: newUser.email,
    subject: "Email Verification",
    html: `
      <p>You verification OTP</p>
      <h1>${OTP}</h1>
    `,
  });

  res.status(201).json({
    user: {
      id: newUser._id,
      name: newUser.name,
      email: newUser.email,
    },
  });
};

exports.verifyEmail = async (req, res) => {
  const { userId, OTP } = req.body;

  if (!isValidObjectId(userId)) return sendError(res, "Geçersiz kullanıcı!");

  const user = await User.findById(userId);
  if (!user) return sendError(res, "Kullanıcı bulunamadı!", 404);

  if (user.isVerified) return sendError(res, "Kullanıcı zaten doğrulandı!");

  const token = await EmailVerificationToken.findOne({ owner: userId });
  if (!token) return sendError(res, "Token bulunamadı!");

  const isMatched = await token.compareToken(OTP);
  if (!isMatched) return sendError(res, "Lütfen geçerli bir OTP gönderin!");

  user.isVerified = true;
  await user.save();

  await EmailVerificationToken.findByIdAndDelete(token._id);

  var transport = generateMailTransporter();

  transport.sendMail({
    from: "verification@gunduzfilm.com",
    to: user.email,
    subject: "Gündüz Film",
    html: "<h1>Hoşgeldiniz.</h1>",
  });

  const jwtToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
  res.json({
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      token: jwtToken,
      isVerified: user.isVerified,
      role: user.role,
    },
    message: "E-mail doğrulandı!",
  });
};

exports.resendEmailVerificationToken = async (req, res) => {
  const { userId } = req.body;

  const user = await User.findById(userId);
  if (!user) return sendError(res, "Kullanıcı bulunamadı!");

  if (user.isVerified)
    return sendError(res, "Bu e-mail zaten kullanılıyor!");

  const alreadyHasToken = await EmailVerificationToken.findOne({
    owner: userId,
  });
  if (alreadyHasToken)
    return sendError(
      res,
      "1 saat sonra tekrar istek yollayın!"
    );

  let OTP = generateOTP();

  const newEmailVerificationToken = new EmailVerificationToken({
    owner: user._id,
    token: OTP,
  });

  await newEmailVerificationToken.save();


  var transport = generateMailTransporter();

  transport.sendMail({
    from: "verification@gunduzfilm.com",
    to: user.email,
    subject: "Email Doğrulama",
    html: `
      <p>Doğrulama OTP: </p>
      <h1>${OTP}</h1>
    `,
  });

  res.json({
    message: "OTP E-mail adresinize gönderildi!",
  });
};

exports.forgetPassword = async (req, res) => {
  const { email } = req.body;

  if (!email) return sendError(res, "E-mail boş bırakılamaz!");

  const user = await User.findOne({ email });
  if (!user) return sendError(res, "Kullanıcı bulunamadı", 404);

  const alreadyHasToken = await PasswordResetToken.findOne({ owner: user._id });
  if (alreadyHasToken)
    return sendError(
      res,
      "1 saat sonra tekrar istek yollayın!"
    );

  const token = await generateRandomByte();
  const newPasswordResetToken = await PasswordResetToken({
    owner: user._id,
    token,
  });
  await newPasswordResetToken.save();

  const resetPasswordUrl = `http://localhost:3000/auth/reset-password?token=${token}&id=${user._id}`;

  const transport = generateMailTransporter();

  transport.sendMail({
    from: "security@gunduzfilm.com",
    to: user.email,
    subject: "Şifre Yenileme Linki",
    html: `
      <p>Şifrenizi değiştirmek için tıklayın.</p>
      <a href='${resetPasswordUrl}'>Şifreyi değiştir</a>
    `,
  });

  res.json({ message: "Link E-mail adresinize gönderildi!" });
};

exports.sendResetPasswordTokenStatus = (req, res) => {
  res.json({ valid: true });
};

exports.resetPassword = async (req, res) => {
  const { newPassword, userId } = req.body;

  const user = await User.findById(userId);
  const matched = await user.comparePassword(newPassword);
  if (matched)
    return sendError(
      res,
      "Eski şifre ile yeni şifre farklı olmalıdır!"
    );

  user.password = newPassword;
  await user.save();

  await PasswordResetToken.findByIdAndDelete(req.resetToken._id);

  const transport = generateMailTransporter();

  transport.sendMail({
    from: "security@gunduzfilm.com",
    to: user.email,
    subject: "Şifre Yenileme Başarılı",
    html: `
      <p>Yeni şifrenizi kullanabilirsiniz.</p>

    `,
  });

  res.json({
    message: "Şifreniz değiştirildi!",
  });
};

exports.signIn = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) return sendError(res, "E-mail ve şifre uyuşmuyor!");

  const matched = await user.comparePassword(password);
  if (!matched) return sendError(res, "E-mail ve şifre uyuşmuyor!");

  const { _id, name, role, isVerified } = user;

  const jwtToken = jwt.sign({ userId: _id }, process.env.JWT_SECRET);

  res.json({
    user: { id: _id, name, email, role, token: jwtToken, isVerified },
  });
};
