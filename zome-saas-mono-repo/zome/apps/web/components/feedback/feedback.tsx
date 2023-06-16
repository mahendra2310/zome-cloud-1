/* eslint-disable react/jsx-no-useless-fragment */
import React, { useState, useEffect } from 'react';
import { ReactComponent as LoginImage } from './userprofile.svg';
import router from 'next/router';
import { ApiGet, ApiPost, ApiPut } from '../../services/helpers/API/ApiData';
// import * as userUtil from '../../services/utils/user.util';
// import * as localStoreUtil from '../../services/utils/localstore.util';
import { getUserInfo } from 'apps/web/services/utils/user.util';
import { message, Radio } from 'antd';
import './feedback.module.less';
import {
  faUser,
  faEnvelopeOpen,
  faUserTag,
  faCheck,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { CheckCircleOutlined, UserAddOutlined } from '@ant-design/icons';
import Activity from '../activity/activityLogs';

const Feedback = () => {
  let userprofileInfo: any = {}; // need to get it from user profile API
  let userRole = getUserInfo()?.role;
  //console.log(userprofileInfo);

  const [feedBackData, setFeedbackData] = useState({
    email: '',
    phoneNumber: '',
    deviceType: '',
    comment: '',
  });
  const [deviceType, setdeviceType] = useState(feedBackData.deviceType);

  const addFeedback = async () => {
    console.log(feedBackData);
    // const data = {
    //   email: 'test@12ab.com',
    //   phoneNumber: '7895465123',
    //   deviceType: 'android',
    //   comment: 'Khub saras',
    // };
    if (feedBackData.email && feedBackData.comment) {
      await ApiPost('feedback', feedBackData)
        .then((res: any) => {
          if (res.data.msg == "Please enter valid email address") {
            message.error(res.data.msg);
          } else if (res.data.msg == "Please enter 10 digit phone number") {
            message.error(res.data.msg);
          } else {
            console.log('done');
            message.success('Feedback added successfully');
            setFeedbackData({
              email: '',
              phoneNumber: '',
              deviceType: '',
              comment: '',
            });
          }
        })
        .catch((err) => {
          console.log(err);
        });

        let data = {
          email:feedBackData.email,
          message:feedBackData.comment,
          phone:feedBackData.phoneNumber,
          deviceType:feedBackData.deviceType
        }

        await ApiPost('sendFeedbackEmail', data)
        .then(async (res: any) => {
          console.log(res,"res-----")
          console.log(res.status); 
        })
        .catch((err) => {
            console.log(err);
        });
    }
  };

  const clearFeedback = (e) => {
    setFeedbackData(
      {
        email: '',
        phoneNumber: '',
        deviceType: deviceType,
        comment: '',
      })
    setdeviceType('');
    router.push({
      pathname: '/dashboard',
    });
  }
  return (
    <>
      <div className="profile-grid">
        <div className="profile-grid-items">
          <div className="profile-title">
            <UserAddOutlined className="profile-icon-size" />
            <div>
              <h1>Feedback Form</h1>
            </div>
          </div>

          <div className="input-grid-fb">
            <div className="input-grid-items">
              <span>Your Email</span>
              {/* <input type="text" /> */}
              <input
                type="email"
                id="input-email"
                // disabled
                value={feedBackData.email}
                onChange={(e) =>
                  setFeedbackData({ ...feedBackData, email: e.target.value })
                }
              />
            </div>
            <div className="input-grid-items">
              <span>Your Phone Number</span>
              {/* <input type="text" /> */}
              <input
                type="number"
                id="input-phone"
                // disabled
                value={feedBackData.phoneNumber}
                onChange={(e) =>
                  setFeedbackData({
                    ...feedBackData,
                    phoneNumber: e.target.value,
                  })
                }
              />
            </div>
            <div className="input-grid-items">
              <span>Comments : </span>
              <input
                type="textarea"
                name="textValue"
                id="input-comment"
                style={{ height: '100px' }}
                value={feedBackData.comment}
                maxLength={300}
                onChange={(e) =>
                  setFeedbackData({ ...feedBackData, comment: e.target.value })
                }
              />
            </div>
            <div>
              <span>Device Type :</span>
              {/* <input type="text" /> */}
              <Radio.Group
                onChange={(e) =>
                  setFeedbackData({
                    ...feedBackData,
                    deviceType: e.target.value,
                  })
                }
                value={feedBackData.deviceType}
              >
                <Radio value="Android">Android</Radio>
                <Radio value="Ios">Ios</Radio>
              </Radio.Group>
            </div>

            <div id="container">
              <button type="button" id="button1" onClick={() => addFeedback()}>
                Submit
              </button>
              <button type="button" id="button2" onClick={(e) => clearFeedback(e)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
export default Feedback;
