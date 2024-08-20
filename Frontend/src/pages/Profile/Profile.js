import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHouse, faCircleUser, faUser, faRightFromBracket, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { useNavigate, Link } from 'react-router-dom';
import Footer from '../../components/Footer';
import './Profile.css';
import axios from 'axios';

const Profile = () => {
  const [activeButton, setActiveButton] = useState(null);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [location, setLocation] = useState('');
  const [emailuse, setEmailuse] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [initialData, setInitialData] = useState({});

  const saveProfile = () => {
    setSuccessMessage('');
    setErrorMessage('');
    const token = localStorage.getItem('token');
    const decodedData = JSON.parse(atob(token));

    if (decodedData && decodedData.length > 0) {
      const userData = decodedData[0];
      const userId = userData.id;

      const EmailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const PassRegex = /^(?=.*[A-Z])(?=.*[@$!%*?&.])[A-Za-z\d@$!%*?&.]{8,}$/;
      const emailDomain = email.split('@')[1];

      if (name === '' || email === '' || (emailuse === 0 && (password === '' || confirmPassword === ''))) {
        setErrorMessage("Please enter all fields.");
        return;
      }
      if (!EmailRegex.test(email)) {
        setErrorMessage("Please Enter Valid Email Format<br> eg.Abc@protovec.com");
        return;
      }
      if (emailuse === 0 && !PassRegex.test(password)) {
        setErrorMessage("Password format mismatch. Expected form eg. Abcd@123 <br>1. Atleast one capital letter. <br>2. Password must contain a special character (@, $, !, &, etc).<br>3. Password length must be greater than 8 characters.");
        return;
      }
      if (emailuse === 0 && confirmPassword !== password) {
        setErrorMessage("Password and confirm password fields did not match.");
        return;
      }
      if (location === "Select Location") {
        setErrorMessage("Please select a location.");
        return;
      }
      if (emailDomain !== 'protovec.com') {
        setErrorMessage("Please Enter Company Provided Email");
        return;
      }

      // Check if data has changed
      if (
        initialData.name === name &&
        initialData.email === email &&
        initialData.location === location &&
        (emailuse === 1 || initialData.password === password)
      ) {
        setErrorMessage("User already exists");
        return;
      }

      // Use the provided password or the decoded password from token
      const finalPassword = emailuse === 0 ? password : atob(userData.Password);

      const payload = {
        id: userId,
        name: name,
        Email: email,
        Password: finalPassword,
        location: location
      };

      // Send POST request to update user
      axios.post(`https://prakalp.onrender.com/api/updateUser`, payload, {
        headers: {
          'Content-Type': 'application/json'
        }
      })
        .then(response => {
          console.log(response.data);
          if (response.data === 'Success') {
            setSuccessMessage("User profile updated successfully !");
            setTimeout(() => {
              localStorage.removeItem('token');
              window.location = '/';
            }, 1500);
          }
          if (response.data === 'User exists') {
            setErrorMessage("User already exists !");
          }
        })
        .catch(error => {
          console.error('Error:', error); // Handle error
        });
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    const decodedData = JSON.parse(atob(token));

    if (decodedData && decodedData.length > 0) {
      const userData = decodedData[0];
      setName(userData.Name);
      setEmail(userData.Email);
      setPassword(atob(userData.Password));
      setConfirmPassword(atob(userData.Password));
      setLocation(userData.Location);
      setEmailuse(userData.loginusinggmail);

      // Store initial data
      setInitialData({
        name: userData.Name,
        email: userData.Email,
        password: atob(userData.Password),
        location: userData.Location
      });
    }
  }, []);

  const handleProfileButtonClick = () => {
    setShowProfileDropdown(!showProfileDropdown);
  };

  const handleButtonClick = (buttonName) => {
    setActiveButton(buttonName);
    setShowProfileDropdown(false);

    if (buttonName === 'home') {
      navigate('/task');
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  const passwordIcon = showPassword ? faEyeSlash : faEye;

  const handleLogout = () => {
    navigate('/');
    localStorage.removeItem('token');
  };

  return (
    <div>
      <div className='profile_bg'>
        <div className='title'>
          <div style={{ fontSize: '24px', color: '#f8f9fc', textDecoration: 'none' }}>
            My Profile
          </div>
        </div>
        <div className='dropdown'>
          <button className={activeButton === 'home' ? 'home_bg active' : 'home_bg'} onClick={() => handleButtonClick('home')}>
            <FontAwesomeIcon icon={faHouse} style={{ fontSize: '1.6rem' }} color='white' />
          </button>
          <button className={activeButton === 'profile' ? 'home_bg active' : 'home_bg'} onClick={() => { handleProfileButtonClick('profile'); }}>
            <FontAwesomeIcon icon={faCircleUser} style={{ fontSize: '1.7rem' }} color='white' />
            {showProfileDropdown && (
              <div className="dropdown-content">
                <div>
                  <div><button><Link to="/profile" style={{ textDecoration: 'none', color: 'black' }}>
                    <FontAwesomeIcon icon={faUser} color='blue' />&emsp; Profile
                  </Link></button>
                  </div>
                  <div onClick={handleLogout}><button><FontAwesomeIcon icon={faRightFromBracket} color='red' />&emsp; LogOut</button></div>
                </div>
              </div>
            )}
          </button>
        </div>
      </div>

      <div className="container-fluid mt-4">
        <div className="row">
          <div className="col col-md-6 offset-md-3">
            <div className="card shadow">
              <div className="card-body card-block">
                <div >
                  <label htmlFor="name" className="form-control-label text-dark">Name</label>
                  <input
                    type="text"
                    id="name"
                    placeholder="Enter your name"
                    className="form-control"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={{ marginBottom: '1rem' }}
                  />
                  <small className="form-text text-danger Empnamemsg" id="Empnamemsgname" style={{ display: 'none' }}></small>
                </div>
                <div className="profile-for-memail mt-2" >
                  <label htmlFor="Email" className="form-control-label text-dark">Email</label>
                  <input
                    type="email"
                    id="Email"
                    placeholder="Abc@protovec.com"
                    className="form-control"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{ marginBottom: '1rem' }}
                  />
                  <small className="form-text text-danger Empnamemsg" id="EmpnamemsgEmail" style={{ display: 'none' }}></small>
                </div>
                {emailuse === 0 && (
                  <>
                    <div className="form-group">
                      <label htmlFor="profileInputPassword" className="form-control-label text-dark">Password</label>
                      <div className="input-group">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          className="form-control form-control-user"
                          id="profileInputPassword"
                          placeholder="Password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                        />
                        <div className="input-group-prepend" id="profileInputPrepend">
                          <span className="profile-input-group-text" id="profileInputEye" onClick={togglePasswordVisibility}>
                            <FontAwesomeIcon icon={passwordIcon} />
                          </span>
                        </div>
                      </div>
                    </div>
                    <small className="form-text text-danger Empnamemsg" id="Empnamemsgpass" style={{ display: 'none' }}></small>
                    <div className="form-group" id="profileRepeatPasswordGroup">
                      <label
                        htmlFor="profileRepeatPassword"
                        className="form-control-label text-dark"
                        id="profileRepeatPasswordLabel"
                      >
                        Confirm Password
                      </label>
                      <input
                        type="password"
                        className="form-control form-control-user"
                        id="profileRepeatPassword"
                        placeholder="Repeat Password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                      />
                    </div>
                    <small className="form-text text-danger Empnamemsg" id="Empnamemsgcpass" style={{ display: 'none' }}></small>
                  </>
                )}
                <div className="profile-location mt-3">
                  <select
                    className="form-select border border-primary rounded p-1"
                    aria-label="Default select example"
                    id="dropLocation"
                    style={{ marginBottom: '1rem' }}
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  >
                    <option value="Select Location">Select Location</option>
                    <option value="Mumbai">Mumbai</option>
                    <option value="Ratnagiri">Ratnagiri</option>
                  </select>
                </div>
                <div className="message-container">
                  {errorMessage.split('<br>').map((line, index) => (
                    <div className="text-center" key={index}>
                      <p style={{ color: 'red', margin: '0' }}>{line}</p>
                    </div>
                  ))}
                  {successMessage && <div className="success-message" style={{ textAlign: 'center', color: 'green', marginTop: '0.5rem', marginBottom: '0.5rem' }}>{successMessage}</div>}
                </div>
                <div className="modal-footer">
                  <button type="button" id="save" onClick={saveProfile} className="btn btn-success">Save</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Profile;
