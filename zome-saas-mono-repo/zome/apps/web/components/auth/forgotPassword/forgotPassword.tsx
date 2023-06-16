import React, { useState, useEffect } from 'react';
import { ReactComponent as LoginImage } from './login.svg';
import { useRouter } from 'next/router';

import { Checkbox, message, Spin } from 'antd';
import './signup.module.less';
import Link from 'next/link';
import { ApiGet, ApiPost } from 'apps/web/services/helpers/API/ApiData';
// import dynamic from "next/dynamic";
// const PasswordChecklist = dynamic(() => import("react-password-checklist"), {
//   ssr: false
// });


import { CheckCircleFilled, CheckCircleOutlined, CheckCircleTwoTone, CloseCircleFilled, CloseCircleOutlined, ExclamationCircleFilled, ExclamationCircleOutlined, InfoCircleFilled, InfoCircleOutlined, WarningFilled } from '@ant-design/icons';
import Icon from '@ant-design/icons/lib/components/AntdIcon';


const ForgotPasswordMain = () => {
  const [loading, setLoading] = useState(false);
  const [signupError, setSignupError] = useState('');
  const [data2, setData] = useState(false);
  const [password, setPassword] = useState("");
  const [messages, setMessage] = useState(false);
  const router = useRouter()
  const [showForm, setShowForm] = useState(true);
  const [disableText, setDisableText] = useState(false);
  const [showCheckList, setShowCheckList] = useState(false);
  const [errormessagecolor, setErrorMessageColor] = useState({});
  const [value1, setValue1] = useState("");
  const [value2, setValue2] = useState("");

  const [colour1, setcolour1] = useState("red");
  const [colour2, setcolour2] = useState("red");
  const [colour3, setcolour3] = useState("red");
  const [colour4, setcolour4] = useState("red");
  const [colour5, setcolour5] = useState("red");

  const [colour6, setcolour6] = useState("red");
  const [colour7,setcolour7] = useState("red");

  const { id, token } = router.query;

  const [passwordShown, setPasswordShown] = useState(false);
 const [checked,setChecked] = useState(false);



 const {email} = router.query


  // useEffect(() => {
  //   // codes using router.query
  //   if (!router.isReady) return;


  //   // const userValid = async () => {

  //   //   await ApiGet(`/forgotpassword/${id}/${token}`)
  //   //     .then(async (res: any) => {
  //   //       //const data = await res.json()
  //   //       if (res.status == 201) {
  //   //         console.log("user valid")
  //   //       } else if (res.status == 401) {

  //   //         router.push("/tokenExpire")
  //   //       }
  //   //     })
  //   //     .catch((err) => {
  //   //       console.log('error in post data!!');
  //   //     });
  //   // };

  //   // userValid()
  //   // setTimeout(() => {
  //   //   setData(true)
  //   // }, 3000)



  // }, [router.isReady]);


  useEffect(() => {
    setTimeout(() => {
      setSignupError("");
    }, 3000)
  }, [])

  const handlePassword = (e) => {
    setPassword(e.target.value);
  };

  // Password toggle handler
  const togglePassword = (e) => {
    if(checked == false){
      setChecked(true);
    }
    setPasswordShown((passwordShown) => !passwordShown);
  };


  const sendpassword = async (e) => {


    e.preventDefault();


    if (value1 === "") {
      setSignupError("password is required!");
      setTimeout(() => {
        setSignupError('');
      }, 5000);
    } else if (value1.length < 8) {
      setSignupError("password must contain atleast 8 characters");
      
      setTimeout(() => {
        setSignupError('');
      }, 5000);

    } else if (value1 !== value2) {
      setSignupError("Password and confirm password should be same. ");
      
      setTimeout(() => {
        setSignupError('');
      }, 5000);
      return
    } else {
      const passdata = {
        password: value1
      }
      await ApiPost(`/updatePassword/${email}`, passdata)
        .then(async (res: any) => {
          //  const data = await res.json()
          if (res.data.status == 201) {
            setPassword("")
            setMessage(true)
            console.log("password updated successfully...")
            setShowForm(false)
            message.success("password updated successfully")
            setDisableText(true)
            router.push("/")
          } else if (res.data.status == 211) {
            setSignupError(res.data.msg);
            setTimeout(() => {
              setSignupError('');
            }, 5000);

          } else if (res.status == 212) {
            setSignupError(res.data.msg);
            setTimeout(() => {
              setSignupError('');
            }, 5000);
          } else if (res.status == 213) {
            setSignupError(res.data.msg);
            setTimeout(() => {
              setSignupError('');
            }, 5000);
          } else if (res.status == 214) {
            setSignupError(res.data.msg);
            setTimeout(() => {
              setSignupError('');
            }, 5000);
          } else if (res.status == 215) {
            setSignupError(res.data.msg);
            setTimeout(() => {
              setSignupError('');
            }, 5000);
          } else if (res.status == 216) {
            setSignupError(res.data.msg);
            setTimeout(() => {
              setSignupError('');
            }, 5000);
          } else if (res.status == 401) {
            router.push("/tokenExpire")
          }
        }).catch((err) => {
          console.log(err,"error")
        });
    }
  }

  const showWarningError = async (e) => {
    if (showCheckList == false) {
      setShowCheckList(true);
    }
  }


  const handlevalue1 = async (e) => {
    setValue1(e.target.value);
  }


  const handlevalue2 = async (e) => {
    setValue2(e.target.value);
  }




  const handlecolour = async (e) => {
      setcolour1("red"),
      setcolour2("red"),
      setcolour3("red"),
      setcolour4("red"),
      setcolour5("red"),
      setcolour6("red"),
      setcolour7("red")

    if (value1.length >= 8) {
      setcolour1("black");
    }
    if (value1.match(/[A-Z]/)) {
      setcolour2("black");
    }
    if (value1.match(/[a-z]/)) {
      setcolour3("black");
    }
    if (value1.match(/[`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/)) {
      setcolour4("black");
    } else if (!value1.match(/[`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/)){
      setcolour4("red");      
    }
    if (value1.match(/^\S*$/)) {
      setcolour6("black");
    }  
    // Check if string contians numbers
    const isContainsNumber = /^(?=.*[0-9]).*$/;
    
     if (isContainsNumber.test(value1)) {
      setcolour7("black");
    }
    if (value1 === value2 && value1 !== "") {
      setcolour5("black");
    }

  }
  const style = {
    boxShadow: "2px 2px 3px 3px #ccc",
    border: "2px #eee",
    padding: "20px",
    marginTop: "25px"
  };


  return (
    <>
      <section className="login-banner bg-white">
        <div className="">
          <div className="lg:flex md:flex  align-content">
            <div className="lg:w-4/6 md:w-1/2 m-pl-2 flex justify-center items-center banner-full-height ">
              <div className="login-banner-img ">
                <LoginImage className="login-banner-img" />
              </div>
            </div>
            <div className="lg:w-2/6 md:w-1/2 pl-8 pr-8 m-pl-2 m-login-banner">
              <div className="left">
                <div className="header welcome-text-align">
                  <h2 className="opensans-bold heading-title-text-color heading-title-size">
                    Welcome to ZOME
                  </h2><br/><br/>
                  {disableText  ?  " " :  <h6 className="child-text-color font-size-16 tracking-normal mt-3 mb-4">
                    Please enter a new password
                  </h6>
          
                  }
                  <h6 className="child-text-color font-size-16 tracking-normal mt-3 ml-4">
                    {messages == true && <p style={{ color: "green", fontWeight: "bold" }}>Password updated Successfully </p>}
                  </h6>
                  <h5 className="text-red-600">{signupError}</h5>
                </div>
                {showForm == true &&
                  <form className="form">

                    <div className="container">
                      <div className="row">
                        <div className="col-md-4"></div>

                        <div className="col-md-4">
                          <div style={style}>
                              <div className="form-group">
                                <label htmlFor="password">Password</label>
                                <input
                                  type={passwordShown ? "text" : "password"} 
                                  className="form-control"
                                  value={value1}
                                  onChange={(e) => handlevalue1(e)}
                                  onKeyDown={(e) => showWarningError(e)}
                                  onKeyUp={(e)=>{handlecolour(e)}}
                                  placeholder="Password"
                                />
                              </div>
                              <div className="form-group">
                                <br/>
                                <label htmlFor="password">Confirm Password</label>
                                <input
                                   type={passwordShown ? "text" : "password"} 
                                  className="form-control"
                                  value={value2}
                                  onChange={(e) => handlevalue2(e)}
                                  onKeyDown={(e) => handlecolour(e)}
                                  placeholder="Confirm Password"
                                />
                              </div>
                            <br/>
                            <div>
                              <label>
                              <input
                                id="checkbox"
                                type="checkbox"
                                checked={checked}
                                onChange={(e)=>togglePassword(e)}
                                onClick= {(e)=> setChecked(!checked)}
                              /> show password
                            </label>
                            </div>
                            
                          </div>
                        </div>
                        <>
                        </>
                               <br/>
                              {value2 === "" ? (
                                ""
                              ) : value1 === value2 || value2 === value1 ? (
                                <span style={{ color: "#abce65", fontWeight: "bold" }}>
                                  {" "}
                                  Password matched !!!{" "}
                                </span>
                              ) : (
                                <span style={{ color: "red", fontWeight: "bold" }}>
                                  {" "}
                                  Password did not match: Please try again...{" "}
                                </span>
                              )}
                        <br/>
                        <br/>
                                <span style={{ fontWeight: "bold" }}>
                                 All requirements below must be met:
                                </span>

                                <br />

                                <span style={{ color: colour1, fontSize: "15px" }}>
                                  <i
                                    style={{ color: colour1, fontSize: "20px" }}
                                    className="fa fa-check-circle"
                                    aria-hidden="true"
                                  ><label>{colour1 != "red" ? <CheckCircleFilled style={{ color: '#abce65' }}/> : <ExclamationCircleOutlined /> } </label></i>{" "}
                                 Password must be of atleast 8 characters.
                                </span>
                                <br />

                                <span style={{ color: colour6, fontSize: "15px" }}>
                                  <i
                                      style={{ color: colour6, fontSize: "20px" }}
                                      className="fa fa-check-circle"
                                      aria-hidden="true"
                                    >{colour6 != "red" ? <CheckCircleFilled style={{ color: '#abce65' }}/> : <ExclamationCircleOutlined /> } </i>{""}
                                    
                                    Password must not contain whitespaces.
                                  </span>
                                  <br />

                                  <span style={{ color: colour7, fontSize: "15px" }}>
                                  <i
                                    style={{ color: colour7, fontSize: "20px" }}
                                    className="fa fa-check-circle"
                                    aria-hidden="true"
                                  >{colour7 != "red" ? <CheckCircleFilled style={{ color: '#abce65' }} /> : <ExclamationCircleOutlined /> } </i>{""}
                                   Password must contain at least one digit.
                                </span>
                                <br />


                                
                                <span style={{ color: colour4, fontSize: "15px" }}>
                                  <i
                                    style={{ color: colour4, fontSize: "20px" }}
                                    className="fa fa-check-circle"
                                    aria-hidden="true"
                                  >{colour4 != "red" ? <CheckCircleFilled style={{ color: '#abce65' }} /> : <ExclamationCircleOutlined /> } </i>{""}
                                  Password must contain at least one special symbol.
                                </span>

                                <br /> 
                                
                                <span style={{ color: colour2, fontSize: "15px" }}>
                                  <i
                                    style={{ color: colour2, fontSize: "20px" }}
                                    className="fa fa-check-circle"
                                    aria-hidden="true"
                                  >{colour2 != "red" ? <CheckCircleFilled style={{ color: '#abce65' }} /> : <ExclamationCircleOutlined /> } </i>{" "}
                                  Password must have at least one uppercase character.
                                </span>

                                <br />

                                <span style={{ color: colour3, fontSize: "15px" }}>
                                  <i
                                    style={{ color: colour3, fontSize: "20px" }}
                                    className="fa fa-check-circle"
                                    aria-hidden="true"
                                  > {colour3 != "red" ? <CheckCircleFilled style={{ color: '#abce65' }} />: <ExclamationCircleOutlined /> } </i>{" "}
                                  Password must have at least one lowercase character.
                                </span>

                                <br />
                              
                        <div className="col-md-4"></div>
                      </div>
                    </div>

                    <div className="pt-5 m-pb-1">
                      <div className="same-button-style">
                        <>
                          <button
                            className="next-button-style"
                            onClick={(e) => sendpassword(e)}
                          >
                            Next
                          </button>
                        </>
                      </div>
                    </div>

                  </form>
                }
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
export default ForgotPasswordMain

