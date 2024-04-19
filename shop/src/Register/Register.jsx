import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Register() {
  const [registerData, setRegisterData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const navigate = useNavigate();

  const loginClick = () => {
    navigate("/");
  };

  const handleRegister = async () => {
    if (!registerData.username) {
      alert("กรุณากรอก username");
      return;
    }
    if (!registerData.email) {
      alert("กรุณากรอก email");
      return;
    }
    if (!registerData.password) {
      alert("กรุณากรอก password");
      return;
    }
    try {
      const response = await axios.post(
        "http://localhost:3000/register",
        registerData
      );
      if (response.status === 200) {
        alert(`${response.data}`);
        window.location.reload();
      } else {
        alert("การลงทะเบียนล้มเหลว");
      }
    } catch (error) {
      if (error.response) {
        alert(
          `เกิดข้อผิดพลาด ${error.response.status}: ${error.response.data.error}`
        );
      } else if (error.request) {
        alert("ไม่ได้รับการตอบกลับจากเซิร์ฟเวอร์");
      } else {
        alert(`เกิดข้อผิดพลาด: ${error.message}`);
      }
    }
  };

  return (
    <section className="box">
      <div className="container">
        <form>
          {" "}
          <div className="l1">
            <h2>Register</h2>
          </div>
          <div className="b-name">
            <div className="u1">UserName</div>
            <input
              className="u2"
              type="text"
              placeholder="UserName"
              value={registerData.username}
              onChange={(e) =>
                setRegisterData({ ...registerData, username: e.target.value })
              }
            />
          </div>
          <div className="b-name">
            <div className="u1">Email</div>
            <input
              className="u2"
              type="email"
              placeholder="Email"
              value={registerData.email}
              onChange={(e) =>
                setRegisterData({ ...registerData, email: e.target.value })
              }
            />
          </div>
          <div className="b-name">
            <div className="u1">Password</div>
            <input
              className="u2"
              type="password"
              placeholder="Password"
              value={registerData.password}
              onChange={(e) =>
                setRegisterData({ ...registerData, password: e.target.value })
              }
            />
          </div>
          <div className="bl">
            <button className="b1" type="button" onClick={handleRegister}>
              Sign Up
            </button>
          </div>
          <div>
            <button className="b1" type="button" onClick={loginClick}>
              Login
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}

export default Register;
