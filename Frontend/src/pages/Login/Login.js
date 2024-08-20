import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import eyeIcon from "../../assets/images/eye.svg";
import eyeIconSlash from "../../assets/images/eye-slash.svg";
import googleIcon from "../../assets/images/google.svg";
import axios from "axios";
import { Buffer } from "buffer";
import "./Login.css";
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';

function Login() {
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const savedEmail = localStorage.getItem('savedEmail');
    const savedPassword = localStorage.getItem('savedPassword');
    const savedRememberMe = localStorage.getItem('rememberMe') === 'true';

    if (savedEmail && savedPassword && savedRememberMe) {
      setEmail(savedEmail);
      setPassword(Buffer.from(savedPassword, 'base64').toString('utf-8'));
      setRememberMe(savedRememberMe);
    }
  }, []);

  const saveCredentials = () => {
    if (rememberMe) {
      localStorage.setItem('savedEmail', email);
      localStorage.setItem('savedPassword', Buffer.from(password).toString('base64'));
      localStorage.setItem('rememberMe', 'true');
    }
  };

  const generateToken = (userData) => {
    const userDataString = JSON.stringify(userData);
    const token = Buffer.from(userDataString).toString('base64');
    localStorage.setItem('token', token);
  };

  const handleLogin = async () => {
    try {
      if (!email || !password) {
        setErrorMessage('Please enter all credentials');
        return;
      }

      const emailRegex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
      const passRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})/;
      if (!emailRegex.test(email)) {
        setErrorMessage('Email format mismatch. Please enter a valid email address');
        return;
      }

      if (!passRegex.test(password)) {
        setErrorMessage(`Password format mismatch. 
          Please enter a valid password with the following criteria:
          1. At least one capital letter.
          2. Must contain a special character (@, $, !, &, etc).
          3. Password length must be at least 8 characters.`);
        return;
      }

      // Encode password to base64
      const encodedPassword = Buffer.from(password).toString('base64');

      const response = await axios.post(`https://prakalp.onrender.com/api/getLogin`, {
        email,
        pass: encodedPassword, // Send the encoded password to the backend
        rememberMe: rememberMe.toString() // Convert rememberMe boolean to string
      });

      if (response.data.message === 'Success') {
        const userData = response.data.result;
        generateToken(userData);
        saveCredentials();
        window.location = '/task';
      } else {
        setErrorMessage('Please enter a valid email or password');
        setEmail('');
        setPassword('');
      }
    } catch (error) {
      console.error('Login error:', error);
      setErrorMessage('An error occurred. Please try again.');
    }
  };

  const [passwordVisible, setPasswordVisible] = useState(false);

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  const handleGoogleLoginSuccess = async (credentialResponse) => {
    try {
      const response = await axios.get(`https://prakalp.onrender.com/api/googlelogin`, {
        params: {
          token: credentialResponse.credential,
        },
      });
      if (response.data.message === 'Success') {
        navigate('/task', { state: { name: response.data.result[0].Name } });
      } else {
        setMessage('Google Login failed');
      }
    } catch (error) {
      setMessage('Google Login failed: ' + error.response.data);
    }
  };

  const handleGoogleLoginFailure = () => {
    setMessage('Google Login failed');
  };


  
  return (
    <div id="login-body">
      <div className="container">
        <div
          className="modal fade"
          id="Errormsg"
          tabIndex="-1"
          role="dialog"
          aria-labelledby="exampleModalLabel"
          aria-hidden="true"
        >
          <div className="modal-dialog modal-sm" role="document">
            <div className="modal-content p-1">
              <div className="modal-header p-1">
                <h6 className="text-danger m-0" id="Errormsgtext"></h6>
                <button
                  className="close"
                  type="button"
                  data-dismiss="modal"
                  aria-label="Close"
                >
                  <span aria-hidden="true">×</span>
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="row justify-content-center">
          <div className="col-xl-10 col-lg-12 col-md-9">
            <div className="card o-hidden border-0 shadow-lg my-5">
              <div className="card-body p-0">
                <div className="row">
                  <div className="col-lg-5 d-none d-lg-block bg-login-image"></div>
                  <div className="col-lg-7">
                    <div className="p-5">
                      <div className="text-center">
                        <h1 className="h4 text-gray-900 mb-4">Welcome Back!</h1>
                      </div>
                      <form className="user">
                        <div className="form-group">
                          <input
                            type="email"
                            className="form-control form-control-user"
                            id="exampleInputEmail"
                            aria-describedby="emailHelp"
                            placeholder="Enter Email Address..."
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                          />
                        </div>
                        <div className="form-group">
                          <div className="input-group flex-nowrap">
                            <input
                              type={passwordVisible ? "text" : "password"} // Toggle input type based on showPassword state
                              className="form-control form-control-user"
                              id="exampleInputPassword"
                              placeholder="Password"
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              style={{ height: "3.1rem", paddingLeft: '1.5rem' }}
                            />
                            <div className="input-group-prepend">
                              <span
                                className="input-group-text"
                                id="showeye"
                                style={{
                                  borderRadius: "0rem 10rem 10rem 0rem",
                                  height: "3.1rem",
                                  width: "43px",
                                  cursor: "pointer"
                                }}
                                onClick={togglePasswordVisibility}
                              >
                                {passwordVisible ? (
                                  <img
                                    className="eyeIcon"
                                    src={eyeIcon}
                                    alt="Eye Icon"
                                  />
                                ) : (
                                  <img
                                    className="eyeIconSlash"
                                    src={eyeIconSlash}
                                    alt="Eye Slash Icon"
                                  />
                                )}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="form-group">
                          <div className="custom-control custom-checkbox small">
                            <input
                              type="checkbox"
                              className="custom-control-input"
                              id="customCheck"
                              checked={rememberMe}
                              onChange={(e) => setRememberMe(e.target.checked)}
                            />
                            <label
                              className="custom-control-label"
                              htmlFor="customCheck"
                            >
                              Remember Me
                            </label>
                          </div>
                        </div>
                        <div>
                          <button
                            id="loginbtn"
                            className="btn btn-primary btn-user"
                            onClick={handleLogin}
                            type="button" // Use type="button" to prevent form submission
                          >
                            <strong>Login</strong>
                          </button>
                          {errorMessage && <p style={{ color: 'red', marginTop: '0.5rem' }}>{errorMessage}</p>}
                          {!errorMessage && (
                            <div className="text-center">
                              <p style={{ color: 'green', marginTop: '0.5rem' }}>{successMessage}</p>
                            </div>
                          )}
                        </div>
                        <hr />
                        <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}
                        >
                        
                        <GoogleLogin
                          onSuccess={handleGoogleLoginSuccess}
                          onFailure={handleGoogleLoginFailure}
                          className="google-login-button" 
                        >
                          {/* <img
                            src={googleIcon}
                            alt="Google Icon"
                            style={{ width: "1.5rem", marginRight: "1rem" }}
                            className="googleIcon"
                          />
                          <i className="fab fa-google fa-fw"></i>{" "}
                          <strong>Login with Protovec Account.</strong> */}
                        </GoogleLogin>
                        </GoogleOAuthProvider>
                      </form>
                      {message && <p style={{color:'red'}}>{message}</p>}
                      <hr/>
                      <div className="text-center">
                        <Link to="/register" className="small">
                          <h6>Create an Account!</h6>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;