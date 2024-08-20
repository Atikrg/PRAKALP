import React, { useState } from 'react';
import './Register.css';
import eyeIcon from '../../assets/images/eye.svg';
import eyeIconSlash from '../../assets/images/eye-slash.svg';
import ErrorMessageModal from "../../components/ErrorMessageModal";
import { Link } from 'react-router-dom';
import axios from 'axios';

function Register() {
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const togglePasswordVisibility = () => {
        setPasswordVisible(!passwordVisible);
    };

    const handleRegister = async () => {

        const { value: fname } = document.getElementById('exampleFirstName');
        const { value: lname } = document.getElementById('exampleLastName');
        const { value: email } = document.getElementById('exampleInputEmail');
        const { value: passwd } = document.getElementById('exampleInputPassword');
        const { value: cpass } = document.getElementById('exampleRepeatPassword');
        const { value: selectedVal } = document.getElementById('dropLocation');

        const EmailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        //const PassRegex = /^(?=.*[A-Z])(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        //const passRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})/; login page
        const PassRegex = /^(?=.*[A-Z])(?=.*[@$!%*?&.])[A-Za-z\d@$!%*?&.]{8,}$/; //(add dot .)
        const emailDomain = email.split('@')[1];

        if (fname === "" || lname === "" || email === "" || passwd === "" || cpass === "") {
            setErrorMessage("Please enter all account details");
            return;
        }
        if (!EmailRegex.test(email)) {
            setErrorMessage("Please Enter Valid Email Format<br> eg.Abc@abcd.com");
            return;
        }
        if (!PassRegex.test(passwd)) {
            setErrorMessage("Password format mismatch. Expected form eg. Abcd@123 <br>1. Atleast one capital letter. <br>2. Password must contain a special character (@, $, !, &, etc).<br>3. Password length must be greater than 8 characters.");
            return;
        }
        if (cpass !== passwd) {
            setErrorMessage("Password and confirm password are not match ");
            return;
        }
        if (selectedVal === 'unset') {
            setErrorMessage("Please Select Location ");
            return;
        }
        if (emailDomain !== 'protovec.com') {
            setErrorMessage("Please Enter Company Provided Email");
            return;
        }
        try {
            const response = await axios.post(`${process.env.SERVER_URL}/api/register`, {
                email,
                fname,
                lname,
                selectedVal,
                passwd
            });

            if (response.data.message === 'Success') {
                setSuccessMessage("Register Successful !")
                setTimeout(() => {
                    window.location = '/';
                }, 3000);
            } else {
                setErrorMessage('Unable to create account');
            }
        } catch (error) {
            setErrorMessage('Error occurred while creating account');
        }
    };


    return (
        <div id="reg-body">
            <div className="container">
                {successMessage && (
                    <div className="modal fade" id="Sucessmsg" tabIndex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
                        <div className="modal-dialog modal-sm" role="document">
                            <div className="modal-content p-1">
                                <div className="modal-header p-1">
                                    <h6 className="text-success text-center m-0" id="Sucessmsgtext">{successMessage}</h6>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                <div className="card o-hidden border-0 shadow-lg my-5">
                    <div className="card-body p-0">
                        <div className="row">
                            <div className="col-lg-5 d-none d-lg-block bg-register-image"></div>
                            <div className="col-lg-7">
                                <div className="p-5">
                                    <div className="text-center">
                                        <h1 className="h4 text-gray-900 mb-4">Create an Account!</h1>
                                    </div>
                                    <form className="user">
                                        <div className="form-group row">
                                            <div className="col-sm-6 mb-3 mb-sm-0">
                                                <input type="text" className="form-control form-control-user" id="exampleFirstName" placeholder="Name" />
                                            </div>
                                            <div className="col-sm-6">
                                                <input type="text" className="form-control form-control-user" id="exampleLastName" placeholder="Nickname" />
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <input type="email" className="form-control form-control-user" id="exampleInputEmail" placeholder="Email Address" />
                                        </div>
                                        <div className="form-group row">
                                            <div className="input-group flex-nowrap col-sm-6 mb-3 mb-sm-0">
                                                <input
                                                    type={passwordVisible ? 'text' : 'password'}
                                                    className="form-control form-control-user"
                                                    id="exampleInputPassword"
                                                    placeholder="Password"

                                                />
                                                <div className="input-group-prepend">
                                                    <span
                                                        className="input-group-text"
                                                        id="showeye"
                                                        style={{ borderRadius: '0rem 10rem 10rem 0rem', height: '3.1rem', width: '43px' }}
                                                        onClick={togglePasswordVisibility}
                                                    >
                                                        <img className={passwordVisible ? 'eyeIcon' : 'eyeIconSlash'} src={passwordVisible ? eyeIcon : eyeIconSlash} alt="Eye Icon" />
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="col-sm-6">
                                                <input type="password" className="form-control form-control-user" id="exampleRepeatPassword" placeholder="Repeat Password" />
                                            </div>
                                        </div>
                                        <div className="form-group row">
                                            <div className="flex-nowrap col col-md-4">
                                                <select className="form-select border border-primary text-center form-control form-control-user p-1" aria-label="Default select example" id="dropLocation">
                                                    <option className="bg-secondary text-white" defaultChecked="unset">
                                                        Select Location
                                                    </option>
                                                    <option className="text-dark" value="Mumbai">
                                                        Mumbai
                                                    </option>
                                                    <option className="text-dark" value="Ratnagiri">
                                                        Ratnagiri
                                                    </option>
                                                </select>
                                            </div>
                                        </div>
                                        <button type="button" id="registerbtn" className="btn btn-primary btn-reg-user btn-block" onClick={handleRegister}>
                                            Register Account
                                        </button>
                                    </form>
                                    <hr />
                                    <div className="text-center">
                                        <Link to="/" className="small">
                                            <h6>Already have an account? Login!</h6>
                                        </Link>
                                    </div>
                                    {errorMessage.split('<br>').map((line, index) => (
                                        <div className="text-left">
                                            <p style={{ color: 'red', margin: '0' }} key={index}>{line}</p>
                                        </div>
                                    ))}
                                    {!errorMessage && (
                                        <div className="text-center">
                                            <p style={{ color: 'green', margin: '0' }}>{successMessage}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Register;
