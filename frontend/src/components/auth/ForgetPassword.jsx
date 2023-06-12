import React, { useState } from "react";
import { forgetPassword } from "../../api/auth";
import { useNotification } from "../../hooks";
import { isValidEmail } from "../../utils/helper";
import { commonModalClasses } from "../../utils/theme";
import Container from "../Container";
import CustomLink from "../CustomLink";
import FormContainer from "../form/FormContainer";
import FormInput from "../form/FormInput";
import Submit from "../form/Submit";
import Title from "../form/Title";

export default function ForgetPassword() {
  const [email, setEmail] = useState("");
  const { updateNotification } = useNotification();

  const handleChange = ({ target }) => {
    const { value } = target;
    setEmail(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValidEmail(email))
      return updateNotification("error", "Geçersiz E-mail");

    const { error, message } = await forgetPassword(email);
    if (error) return updateNotification("error", error);

    updateNotification("error", message);
  };

  return (
    <FormContainer>
      <Container>
        <form onSubmit={handleSubmit} className={commonModalClasses + " w-96"}>
          <Title>Lütfen E-mail adresinizi girin</Title>
          <FormInput
            onChange={handleChange}
            value={email}
            label="E-mail"
            placeholder="mail@gmail.com"
            name="email"
          />
          <Submit value="Link Gönder" />

          <div className="flex justify-between">
            <CustomLink to="/auth/signin">Giriş Yap</CustomLink>
            <CustomLink to="/auth/signup">Kayıt Ol</CustomLink>
          </div>
        </form>
      </Container>
    </FormContainer>
  );
}
