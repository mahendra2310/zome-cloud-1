/* eslint-disable @nrwl/nx/enforce-module-boundaries */
/* eslint-disable @typescript-eslint/no-empty-interface */

import React, { useState, useEffect } from 'react';
import { ApiGet, ApiPost } from 'apps/web/services/helpers/API/ApiData';
import './admin-retry-mechanism.module.less';
import { Form, InputNumber, message } from 'antd';
export interface AdminReportProps {}

const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};
export function AdminRetryMechanism(props: AdminReportProps) {
  const [show, setShow] = useState(false);
  const [buttonType, setButtonType] = useState();
  const [retryCount, setRetryCount] = useState(3);

  const validateMessages = {
    required: '${label} is required!',
    types: {
      email: '${label} is not a valid email!',
      number: '${label} is not a valid number!',
    },
    number: {
      range: '${label} must be between ${min} and ${max}',
    },
  };

  const handleRetryMechanism = async (status) => {
    if (retryCount >= 3 && retryCount <= 5) {
      const body = {
        retryCount: retryCount,
        retryCountStatus: status,
      };
      await ApiPost('retry-count', body)
        .then((res) => {
          console.log(res);
          setShow(true);
          message.success('Retry Mechanism Call successfully');
          handleGetRetryMechanism();
        })
        .catch((err) => {
          console.log(err);
        });
    }
  };
  const handleGetRetryMechanism = async () => {
    await ApiGet('retry-count')
      .then((res: any) => {
        console.log(res);
        setButtonType(res.data.data.status);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  useEffect(() => {
    handleGetRetryMechanism();
  }, []);
  return (
    <div className="p-10">
      {!buttonType && (
        <div className="flex justify-start ">
          <Form
            {...layout}
            name="nest-messages"
            validateMessages={validateMessages}
          >
            <Form.Item
              name={['user', 'Count']}
              label="Count"
              rules={[{ type: 'number', min: 1, max: 5 }]}
            >
              <InputNumber
                onChange={(e: number) => setRetryCount(e)}
                defaultValue={3}
              />
            </Form.Item>
          </Form>
        </div>
      )}
      <div className="flex justify-start ">
        {!buttonType && (
          <button
            className="gateway-btn-style-admin white-text-color block cursor-pointer text-center content-end mx-4"
            onClick={() => handleRetryMechanism(true)}
          >
            <span className="p-3">Start Retry Mechanism</span>
          </button>
        )}
        {buttonType && (
          <button
            className="gateway-btn-style-admin white-text-color block cursor-pointer text-center content-end"
            onClick={() => handleRetryMechanism(false)}
          >
            <span className="p-3">Stop Retry Mechanism</span>
          </button>
        )}
      </div>

      {/* {show && (
        <h3 className="text-green-600">Retry Mechanism Call successfully</h3>
      )} */}
    </div>
  );
}

export default AdminRetryMechanism;
