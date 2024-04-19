import { useNavigate } from "react-router-dom";
import "./Login.css";
import { useState } from "react";
import axios from "axios";
function Login() {
  const [loginData, setLoginData] = useState({ username: "", password: "" });
  const navigate = useNavigate("");

  const handleLogin = async () => {
    try {
      const response = await axios.post(
        "http://localhost:3000/login",
        loginData
      );

      if (response.status === 200 && response.data.success) {
        navigate("/shop");
      } else {
        // Show an alert with the HTTP status and error message
        window.alert(`Error (${response.status}): ${response.data.error}`);
      }
    } catch (error) {
      if (error.response) {
        window.alert(
          `Error (${error.response.status}): ${error.response.data.error}`
        );
      } else if (error.request) {
        window.alert("Network error, please try again");
      } else {
        console.error("Error during login", error.message);
        window.alert("Internal error, please try again");
      }
    }
  };

  const handleEnterKeyPress = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleLogin();
    }
  };

  const registerClick = () => {
    navigate("/register");
  };

  return (
    <section className="box">
      <div className="container">
        <form action="">
          <div className="l1">
            <h2>Login</h2>
          </div>
          <div className="b-name">
            <div className="u1">UserName</div>
            <input
              className="u2"
              type="text"
              placeholder="UserName"
              value={loginData.username}
              onChange={(e) =>
                setLoginData({ ...loginData, username: e.target.value })
              }
              onKeyDown={handleEnterKeyPress}
            />
          </div>
          <div className="b-name">
            <div className="u1">Password</div>
            <input
              className="u2"
              type="password"
              placeholder="Password"
              value={loginData.password}
              onChange={(e) =>
                setLoginData({ ...loginData, password: e.target.value })
              }
              onKeyDown={handleEnterKeyPress}
            />
          </div>
          <div className="bl">
            <button className="b1" type="button" onClick={handleLogin}>
              Login
            </button>
          </div>
          <div>
            <button className="b1" onClick={registerClick}>
              Register
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}

export default Login;
