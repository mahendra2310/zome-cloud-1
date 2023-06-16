import React, { useState, useEffect } from 'react';
import { ReactComponent as LoginImage } from './userprofile.svg';
import router from 'next/router';
import { ApiGet, ApiPut } from '../../services/helpers/API/ApiData';
// import * as userUtil from '../../services/utils/user.util';
// import * as localStoreUtil from '../../services/utils/localstore.util';
import { getUserInfo } from 'apps/web/services/utils/user.util';
import { message } from 'antd';
import './userprofile.module.less';
import {
  faUser,
  faEnvelopeOpen,
  faUserTag,
  faCheck,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { CheckCircleOutlined, UserAddOutlined } from '@ant-design/icons';
import Activity from '../activity/activityLogs';
import Link from 'next/link';

const Userprofile = () => {
  let userprofileInfo: any = {}; // need to get it from user profile API
  let userRole = getUserInfo()?.role;
  //console.log(userprofileInfo);
  const [loading, setLoading] = useState(false);
  const [userData, setUserdata] = useState<any>({});
  const [email, setEmail] = useState<any>('');
  const [userName, setUsername] = useState<any>('');
  const [fullName, setFullname] = useState<any>('');
  const [profileError, setprofileError] = useState('');
  const [currentPasswordError,setCurrentPassowordError]  = useState(''); 
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [electricNumber, setElectricNumber] = useState('');
  const [activityVisible, setActivityVisible] = useState(false);
  const [ConfirmPasswordError, SetConfirmPasswordError] = useState('');
  const [duplicateUserName , setDuplicateUserName] = useState('')
  const [duplicateUserEmail , setDuplicateUserEmail] = useState('')
  const [error , setError] = useState(false);

  useEffect(() => {
    let userRole = getUserInfo()?.role;
    if (!getUserInfo()) {
      router.push('/');
    } else {
      getUserDataInfo();
    }
  }, []);

  const getUserDataInfo = async () => {
    await ApiGet('user')
      .then((res: any) => {
        // console.log(res);
        setUserdata(res.data);
      })
      .catch((err) => {
        // console.log(err);
      });
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();

    const data = {
      email: email ? email : userData.email,
      full_name: fullName ? fullName : userData.full_name,
      username: userName ? userName : userData.username,
      current_password: currentPassword && currentPassword,
      new_password: newPassword && newPassword,
      account_number: electricNumber && electricNumber,
      confirm_password: confirmPassword && confirmPassword,
    };

    setLoading(true);
    await ApiPut('user', data)
      .then(async (res: any) => {
        if (res.data.msg == 'Invalid current password') {
          setCurrentPassowordError(res.data.msg);
          setLoading(false);
          message.error("Invalid current password")
        } else if (
          res.data.msg == 'Password must have at least one Uppercase Character'
          ) {
          message.error("Password must have at least one Uppercase Character")
          setprofileError(res.data.msg);
          setLoading(false);
        } else if (
          res.data.msg == 'Password must contain at least one Digit.'
          ) {
            message.error("Password must contain at least one Digit.")
            setprofileError(res.data.msg);
            setLoading(false);
          } else if (
            res.data.msg == 'Password must contain at least one Special Symbol.'
            ) {
          message.error("Password must contain at least one Special Symbol.")
          setprofileError(res.data.msg);
          setLoading(false);
        } else if (res.data.msg == 'Password must be 3-16 Characters Long') {
          message.error("Password must be 3-16 Characters Long.")
          setprofileError(res.data.msg);
          setLoading(false);
        } else if (res.data.msg == 'new password and confirm password should be same') {
          message.error("new password and confirm password should be same.")
          setprofileError(res.data.msg);
          setLoading(false);
        } else {

          if(res.data.status){
            setError(res.data.status)
            setDuplicateUserName("User Name already exist.")

            setTimeout(() => {
              setDuplicateUserName('')
            }, 3000);
          }

          if(res.data.email){
            setError(res.data.email)
            setDuplicateUserEmail("Email already exist.")

            setTimeout(() => {
              setDuplicateUserEmail('')
            }, 3000);
          }

          setUsername("")
          setFullname("")
          setEmail("")
          setElectricNumber("")
          
          getUserDataInfo();
          setprofileError('');
          setCurrentPassowordError('');
          
          setCurrentPassword("");
          setNewPassword("");
          setConfirmPassword("");
          message.success('User updated successfully');
          setLoading(false);
        }
      })
      .catch((err) => {
        message.error("Internal Server Error")
      });
  };
  const handleImage = async (e, avtar) => {
    e.preventDefault();
    const imageSize = avtar.size / 1024 / 1024;
    // console.log(imageSize > 1, imageSize);
    const formData = new FormData();

    formData.append('profile_pic', avtar);
    if (imageSize < 5) {
      setLoading(true);
      await ApiPut('user/picture', formData)
        .then(async (res: any) => {
          if (res.data.msg == 'Invalid current password') {
            setprofileError(res.data.msg);
            setLoading(false);
          } else {
            getUserDataInfo();
            setprofileError('');
            message.success('Profile picture update successfully');
            setLoading(false);
          }
        })
        .catch((err) => {
          setLoading(false);
          // console.log(err);
        });
    } else {
      message.error('Profile picture size should be less than 5 mb');
    }
  };

  const checkValidation = (e) => {
    const cnfpassval = e.target.value;
    setConfirmPassword(cnfpassval);
    if (newPassword != cnfpassval) {
      SetConfirmPasswordError(
        'new password should match with confirm password '
      );
    } else {
      SetConfirmPasswordError('');
    }
  };
  const enabled = ( email || fullName || userName || electricNumber) ||
    (currentPassword.length > 0 &&
      confirmPassword.length > 0 &&
      newPassword.length > 0)

  return (
    <>
      {loading && (
        <div className="loader-container">
          <div className="flex flex-col justify-center w-full h-full">
            <button className="btn btn-ghost btn-lg self-center normal-case text-white">
              <div className="flex justify-between">
                <div className="loading mt-5"></div>
                <div className="ml-10"></div>
              </div>
            </button>
          </div>
        </div>
      )}
      {/* {(userRole == 'SFU' || userRole == 'sfu') && (
        <div className="flex justify-end mb-4">
          <button
            className="login-btn-style white-text-color block cursor-pointer text-center
              "
            onClick={() => setActivityVisible(true)}
          >
            <span className="mr-3">Activity</span>
          </button>
        </div>
      )} */}
      {userRole == "TenantAdministratorUser" &&
      <Link href="/tenantUsersList">
      <button
        className="login-btn-style white-text-color block cursor-pointer text-center mb-5"
        type="submit"
      >
        <span className="mr-3">show tenant users</span>
      </button>
      </Link> 

     }                  
                             
      <div className="profile-grid">
        <div className="profile-grid-items">
          <div className="profile-title">
            <UserAddOutlined className="profile-icon-size" />
            <div>
              <h1>My Profile</h1>
            </div>
          </div>
          <div className="user-information">
            <p>User information</p>
          </div>
          <div className="input-grid">
            <div className="input-grid-items">
              <span>User name</span>
              {/* <input type="text" /> */}
              <input
                type="text"
                //   value={userData.fullname}
                // disabled
                id="input-utility-account-number"
                defaultValue={userData?.username}
                placeholder={userData && userData.full_name}
                onChange={(e) => setUsername(e.target.value)}
              />

              <span style={{color : "red", fontSize:"15px"}}>{ error && duplicateUserName }</span>
            </div>
            <div className="input-grid-items">
              <span>Full Name</span>
              {/* <input type="text" /> */}
              <input
                type="text"
                //   value={userData.fullname}
                // disabled
                id="input-username"
                defaultValue={userData?.full_name}
                placeholder={userData && userData.full_name}
                onChange={(e) => setFullname(e.target.value)}
              />
            </div>
            <div className="input-grid-items">
              <span>Email</span>
              {/* <input type="text" /> */}
              <input
                type="email"
                id="input-email"
                // disabled
                //  value={userData.email}
                defaultValue={userData?.email}
                placeholder={userData && userData.email}
                onChange={(e) => setEmail(e.target.value)}
              />

           <span style={{color : "red", fontSize:"15px"}}>{error && duplicateUserEmail}</span>
            </div>
            <div className="input-grid-items">
              <span>Account Number</span>
              {/* <input type="text" /> */}
              <input
                type="text"
                id="input-first-name"
                // disabled
                // value={userData.role}
                defaultValue={userData?.account_number}
                placeholder="Enter account number"
                onChange={(e) => setElectricNumber(e.target.value)}
              />
            </div>
            <div className="input-grid-items">
              <span>Current Password </span>

              {/* <input type="text" /> */}
              <input
                type="password"
                id="input-first-name"
                // disabled
                // value={userData.role}
                value={currentPassword}
                placeholder="Enter Current Password"
                //onChange={validatePassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
              {/* <h6 className="text-red-600">{profileError && profileError}</h6> */}
              <h6 className="text-red-600">{currentPasswordError && currentPasswordError}</h6>
            </div>
            <div className="input-grid-items">
              <span>New Password</span>
              {/* <input type="text" /> */}
              <input
                type="password"
                id="input-first-name"
                // disabled
                // value={userData.role}
                value={newPassword}
                placeholder="Enter New Password"
                onChange={(e) => setNewPassword(e.target.value)}
                //onChange={validatePassword}
              />

              <h6 className="text-red-600">{profileError && profileError}</h6>
            </div>

            <div className="input-grid-items">
              <span>Confirm New Password</span>
              {/* <input type="text" /> */}
              <input
                type="password"
                id="input-first-name"
                // disabled
                value={confirmPassword}
                placeholder="Confirm New Password"
                onChange={(e) => checkValidation(e)}
              />
              <h6 className="text-red-600">
                {ConfirmPasswordError && ConfirmPasswordError}
              </h6>
            </div>
          </div>
          <div className="update-button">
            {/* <button>Update</button> */}
            <button disabled={!enabled} onClick={(e) => handleUpdateUser(e)}>
              Update
            </button>
          </div>
        </div>

        <div className="profile-grid-items">
          <label htmlFor="avtar">
            <input
              type="file"
              hidden
              id="avtar"
              name="avtar"
              onChange={(e) => handleImage(e, e.target.files[0])}
            />
            <div className="profile-image">
              <img
                src={
                  userData?.profile_pic
                    ? userData?.profile_pic
                    : 'https://st.depositphotos.com/2101611/4338/v/600/depositphotos_43381243-stock-illustration-male-avatar-profile-picture.jpg'
                }
              />
            </div>
          </label>
          <div className="profile-details">
            <p>{userData && userData.full_name}</p>
            <span>{userData && userData.full_name}</span>
          </div>
        </div>
        {activityVisible && <Activity visible={setActivityVisible} />}
      </div>
    </>
  );
};
export default Userprofile;