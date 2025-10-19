import AuthContainer from "@/components/auth/AuthContainer";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Đăng nhập | Daily Logs",
  description: "Đăng nhập vào tài khoản Daily Logs của bạn",
};

export default function SignIn() {
  return <AuthContainer />;
}
