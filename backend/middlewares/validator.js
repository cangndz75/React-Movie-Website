const { check, validationResult } = require("express-validator");
const { isValidObjectId } = require("mongoose");
const genres = require("../utils/genres");

exports.userValidtor = [
  check("name").trim().not().isEmpty().withMessage("Ad soyad boş bırakılamaz!"),
  check("email").normalizeEmail().isEmail().withMessage("Geçersiz e-mail!"),
  check("password")
    .trim()
    .not()
    .isEmpty()
    .withMessage("Şifre boş bırakılamaz!")
    .isLength({ min: 8, max: 20 })
    .withMessage("Şifre 8 ila 20 karakter uzunluğunda olmalıdır!"),
];

exports.validatePassword = [
  check("newPassword")
    .trim()
    .not()
    .isEmpty()
    .withMessage("Password is missing!")
    .isLength({ min: 8, max: 20 })
    .withMessage("Şifre 8 ila 20 karakter uzunluğunda olmalıdır!"),
];

exports.signInValidator = [
  check("email").normalizeEmail().isEmail().withMessage("Geçersiz e-mail!"),
  check("password").trim().not().isEmpty().withMessage("Şifre boş bırakılamaz!"),
];

exports.actorInfoValidator = [
  check("name").trim().not().isEmpty().withMessage("Aktör adı boş bırakılamaz!"),
  check("about")
    .trim()
    .not()
    .isEmpty()
    .withMessage("Hakkında gerekli bir alandır!"),
  check("gender")
    .trim()
    .not()
    .isEmpty()
    .withMessage("Cinsiyet zorunlu bir alandır!"),
];

exports.validateMovie = [
  check("title").trim().not().isEmpty().withMessage("İçerik adı boş bırakılamaz!"),
  check("storyLine")
    .trim()
    .not()
    .isEmpty()
    .withMessage("Seanryo boş bırakılamaz!"),
  check("language").trim().not().isEmpty().withMessage("Dil boş bırakılamaz!"),
  check("releseDate").isDate().withMessage("Çıkış Tarihi"),
  check("status")
    .isIn(["public", "private"])
    .withMessage("İçerik durumunu belirtiniz!"),
  check("type").trim().not().isEmpty().withMessage("İçerik türü boş bırakılamaz!"),
  check("tags")
    .isArray({ min: 1 })
    .withMessage("Etiketler kelime içermelidir!")
    .custom((tags) => {
      for (let tag of tags) {
        if (typeof tag !== "string")
          throw Error("Etiketler kelime içermelidir!");
      }

      return true;
    }),
  check("cast")
    .isArray()
    .withMessage("Hata")
    .custom((cast) => {
      for (let c of cast) {
        if (!isValidObjectId(c.actor))
          throw Error("Hatalı ID!");
        if (!c.roleAs?.trim()) throw Error("Hatalı rol ID'si");
        if (typeof c.leadActor !== "boolean")
          throw Error(
            "Yalnızca başrol içindeki boolean değeri ekip içinde kabul edilir!"
          );
      }

      return true;
    }),


];

exports.validateTrailer = check("trailer")
  .isObject()
  .withMessage("Hata!")
  .custom(({ url, public_id }) => {
    try {
      const result = new URL(url);
      if (!result.protocol.includes("http"))
        throw Error("Geçersiz fragman ID'si!");

      const arr = url.split("/");
      const publicId = arr[arr.length - 1].split(".")[0];

      if (public_id !== publicId) throw Error("Geçersiz fragman ID'si!");

      return true;
    } catch (error) {
      throw Error("Geçersiz fragman ID'si!");
    }
  });

exports.validateRatings = check(
  "rating",
  "Derecelendirme 0 ile 10 arasında bir sayı olmalıdır."
).isFloat({ min: 0, max: 10 });

exports.validate = (req, res, next) => {
  const error = validationResult(req).array();
  if (error.length) {
    return res.json({ error: error[0].msg });
  }

  next();
};
