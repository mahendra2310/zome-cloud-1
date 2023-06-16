/* eslint-disable react/jsx-no-useless-fragment */
import React, { useEffect, useState } from 'react';
import './profile.moduel.less';

import { Header, Sidebar } from '@zome/ui';
import { useRouter } from 'next/router';
import { Breadcrumb, Tabs } from 'antd';
import { HomeOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { getUserInfo } from 'apps/web/services/utils/user.util';
import Userprofile from 'apps/web/components/userprofile/userprofile';

const { TabPane } = Tabs;
export function Index() {
  const router = useRouter();
  let userRole = getUserInfo()?.role;
  const [apiCall, setApiCall] = useState(false);
  const [propsData, setPropsData] = useState(false);

  const token =
    typeof window !== 'undefined' ? localStorage.getItem('x-auth-token') : null;

  const tokenNotValid = () => {
    typeof window !== 'undefined' ? (
      router.push('/')
    ) : (
      <h1>not working router push</h1>
    );
  };

  const handleChangeSubmit = (id, name) => {
    setApiCall(true);
    //setUUid(id);
    //setGateName(name);
  };
  useEffect(() => {
    if (!getUserInfo()) {
      router.push('/');
    }
  }, []);
  const handleChangeSubmitBack = () => {
    setApiCall(false);
    window.location.reload;
  };
  const handleRole = () => {
    if (userRole == 'TENANT' || userRole == 'TenantAdministratorUser') {
      return false;
    } else if (userRole == 'tenant'||  userRole == 'tenantAdministratorUser') {
      return false;
    } else {
      return true;
    }
  };
  const handleTab = (data) => {
    if (data == '1') {
      router.push('/dashboard');
    } else if (data == '2') {
      router.push('/activity');
    } else if (data == '3') {
      router.push('/profile');
    }
  };
  return (
    <>
      {token ? (
        <div>
          <Header />
          <div className="flex">
            <div className="s-layout">
              {handleRole() && <Sidebar />}
              <main className={`s-layout__content `}>
                <div className="font-weight-bold ml-8 mt-24">
                  {userRole == 'TENANT' || userRole == 'tenant' || userRole == 'TenantAdministratorUser'? (
                    <Tabs
                      onTabClick={(data) => handleTab(data)}
                      defaultActiveKey="3"
                    >
                      <TabPane tab="Control" key="1"></TabPane>
                      <TabPane tab="Log" key="2"></TabPane>
                      <TabPane tab="Account" key="3"></TabPane>
                    </Tabs>
                  ) : (
                    <Breadcrumb>
                      <Breadcrumb.Item
                        onClick={() => handleChangeSubmitBack()}
                        className="cursor-pointer"
                      >
                        <HomeOutlined />
                        <span>Home</span>
                      </Breadcrumb.Item>
                      <Breadcrumb.Item className="cursor-pointer ">
                        <span>Profile</span>
                      </Breadcrumb.Item>
                    </Breadcrumb>
                  )}
                </div>
                <div className="container-fluid pt-20">
                  <div className="w-full">
                    {/* <h1>Profile</h1> */}
                    <Userprofile />
                  </div>
                </div>
              </main>
            </div>
          </div>
        </div>
      ) : (
        tokenNotValid()
      )}
    </>
  );
}

export default Index;
