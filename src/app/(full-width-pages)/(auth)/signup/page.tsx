import AuthContainer from "@/components/auth/AuthContainer";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Đăng ký | Daily Logs",
  description: "Tạo tài khoản Daily Logs mới",
};

export default function SignUp() {
  return <AuthContainer />;
}
