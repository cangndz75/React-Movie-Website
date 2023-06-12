import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth, useNotification } from "../../hooks";
import { isValidEmail } from "../../utils/helper";
import { commonModalClasses } from "../../utils/theme";
import Container from "../Container";
import CustomLink from "../CustomLink";
import FormContainer from "../form/FormContainer";
import FormInput from "../form/FormInput";
import Submit from "../form/Submit";
import Title from "../form/Title";

const validateUserInfo = ({ email, password }) => {
  if (!email.trim()) return { ok: false, error: "E-mail boş bırakılamaz!" };
  if (!isValidEmail(email)) return { ok: false, error: "Geçersiz E-mail" };

  if (!password.trim()) return { ok: false, error: "Şifre boş bırakılamaz!" };
  if (password.length < 8)
    return { ok: false, error: "Şifreniz 8 karakterden az olmamalı!" };

  return { ok: true };
};

export default function Signin() {
  const [userInfo, setUserInfo] = useState({
    email: "",
    password: "",
  });

  const navigate = useNavigate();
  const { updateNotification } = useNotification();
  const { handleLogin, authInfo } = useAuth();
  const { isPending, isLoggedIn } = authInfo;

  const handleChange = ({ target }) => {
    const { value, name } = target;
    setUserInfo({ ...userInfo, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { ok, error } = validateUserInfo(userInfo);

    if (!ok) return updateNotification("error", error);
    handleLogin(userInfo.email, userInfo.password);
  };



  return (
    <FormContainer>
      <Container>
        <form onSubmit={handleSubmit} className={commonModalClasses + " w-72"}>
          <Title>Giriş Yap</Title>
          <FormInput
            value={userInfo.email}
            onChange={handleChange}
            label="Email"
            placeholder="abc@gmail.com"
            name="email"
          />
          <FormInput
            value={userInfo.password}
            onChange={handleChange}
            label="Şifre"
            placeholder="12345"
            name="password"
            type="password"
          />
          <Submit value="Giriş Yap" busy={isPending} />

          <div className="flex justify-between">
            <CustomLink to="/auth/forget-password">Şifremi Unuttum</CustomLink>
            <CustomLink to="/auth/signup">Kayıt Ol</CustomLink>
          </div>
        </form>
      </Container>
    </FormContainer>
  );
}
