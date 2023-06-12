import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createUser } from "../../api/auth";
import { useAuth, useNotification } from "../../hooks";
import { isValidEmail } from "../../utils/helper";
import { commonModalClasses } from "../../utils/theme";
import Container from "../Container";
import CustomLink from "../CustomLink";
import FormContainer from "../form/FormContainer";
import FormInput from "../form/FormInput";
import Submit from "../form/Submit";
import Title from "../form/Title";

const validateUserInfo = ({ name, email, password }) => {
  const isValidName = /^[a-z A-Z]+$/;

  if (!name.trim()) return { ok: false, error: "Ad soyad boş bırakılamaz!" };
  if (!isValidName.test(name)) return { ok: false, error: "Geçersiz ad soyad!" };

  if (!email.trim()) return { ok: false, error: "E-mail boş bırakılamaz!" };
  if (!isValidEmail(email)) return { ok: false, error: "Geçersiz E-mail" };

  if (!password.trim()) return { ok: false, error: "Şifre boş bırakılamaz!" };
  if (password.length < 8)
    return { ok: false, error: "Şifreniz 8 karakterden az olmamalı!" };

  return { ok: true };
};

export default function Signup() {
  const [userInfo, setUserInfo] = useState({
    name: "",
    email: "",
    password: "",
  });

  const navigate = useNavigate();
  const { authInfo } = useAuth();
  const { isLoggedIn } = authInfo;

  const { updateNotification } = useNotification();

  const handleChange = ({ target }) => {
    const { name, value } = target;
    setUserInfo({ ...userInfo, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { ok, error } = validateUserInfo(userInfo);

    if (!ok) return updateNotification("error", error);

    const response = await createUser(userInfo);
    if (response.error) return console.log(response.error);

    navigate("/auth/verification", {
      state: { user: response.user },
      replace: true,
    });
  };

  useEffect(() => {
    if (isLoggedIn) navigate("/");
  }, [isLoggedIn]);

  const { name, email, password } = userInfo;

  return (
    <FormContainer>
      <Container>
        <form onSubmit={handleSubmit} className={commonModalClasses + " w-72"}>
          <Title>Kayıt Ol</Title>
          <FormInput
            value={name}
            onChange={handleChange}
            label="Ad Soyad"
            placeholder="Yunus Özyavuz"
            name="name"
          />
          <FormInput
            value={email}
            onChange={handleChange}
            label="Email"
            placeholder="email@gmail.com"
            name="email"
          />
          <FormInput
            value={password}
            onChange={handleChange}
            label="Şifre"
            placeholder="********"
            name="password"
            type="password"
          />
          <Submit value="Kayıt Ol" />

          <div className="flex justify-between">
            <CustomLink to="/auth/forget-password">Şifremi Unuttum</CustomLink>
            <CustomLink to="/auth/signin">Giriş Yap</CustomLink>
          </div>
        </form>
      </Container>
    </FormContainer>
  );
}
