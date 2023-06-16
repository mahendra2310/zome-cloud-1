import React, { useEffect, useState } from 'react';
import './quickconnect.moduel.less';

import { Header, Sidebar } from '@zome/ui';
import { useRouter } from 'next/router';
import { Breadcrumb } from 'antd';
import { HomeOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { getUserInfo } from 'apps/web/services/utils/user.util';

export function Index() {
  const router = useRouter();

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
  useEffect(() => {
    if (!getUserInfo()) {
      router.push('/');
    }
  }, [])
  const handleChangeSubmit = (id, name) => {
    setApiCall(true);
    //setUUid(id);
    //setGateName(name);
  };

  const handleChangeSubmitBack = () => {
    setApiCall(false);
    window.location.reload;
  };

  return (
    <>
      {token ? (
        <div>
          <Header />
          <div className="flex">
            <div className="s-layout">
              <Sidebar />
              <main className={`s-layout__content `}>
                <div className="font-weight-bold ml-8 mt-24">
                  <Breadcrumb>
                    <Link href="/dashboard">
                      <Breadcrumb.Item className="cursor-pointer">
                        <HomeOutlined />
                        <span>Home</span>
                      </Breadcrumb.Item>
                    </Link>

                    <Breadcrumb.Item className="cursor-pointer ">
                      <span>Quickconnect</span>
                    </Breadcrumb.Item>
                  </Breadcrumb>
                </div>
                <div className="container-fluid pt-20">
                  <div className="w-full">
                    <h1>quickconnect</h1>
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
