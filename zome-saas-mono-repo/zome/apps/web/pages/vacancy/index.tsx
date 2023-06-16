import React, { useEffect, useState } from 'react';
import './vacancy.moduel.less';

import { AdminUi } from '@zome/ui';
import AdminVacant from 'libs/ui/src/lib/admin-vacant/admin-vacant';
import AdminVacantView from 'libs/ui/src/lib/admin-vacant-view/admin-vacant-view';

import { Antdtable, Header, Sidebar } from '@zome/ui';
import { useRouter } from 'next/router';
import { ApiDelete, ApiGet } from 'apps/web/services/helpers/API/ApiData';
import { AddBuilding } from 'apps/web/components/add-update-building/addBuilding';
import { Breadcrumb, Modal, Tooltip, Tabs } from 'antd';
import { HomeOutlined } from '@ant-design/icons';
import Link from 'next/link';

import { Table, Tag, Space } from 'antd';
import EditBuilding from 'apps/web/components/add-update-building/editBuilding';

export function Index() {
  const router = useRouter();
  const [allBuilding, setBuildingData] = useState<any>();
  const [visible, setVisible] = useState(false);
  const [visibleEdit, setVisibleEdit] = useState(false);
  const [allUpdateData, SetAllUpdateData] = useState();
  const token =
    typeof window !== 'undefined' ? localStorage.getItem('x-auth-token') : null;
  const role =
    typeof window !== 'undefined' ? localStorage.getItem('userinfo') : null;

  
  //console.log('role--', role);
  const tokenNotValid = () => {
    typeof window !== 'undefined' ? (
      router.push('/')
    ) : (
      <h1>not working router push</h1>
    );
  };

  
  
  const [bred, setBred] = useState('1');
  const handleBreadcrub = (data) => {
    //console.log('data---', data);
    setBred(data);
  };
  const [gateWayName, setGateWay] = useState([]);
  const { TabPane } = Tabs;
  
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
                      <span>Vacancy Mode</span>
                    </Breadcrumb.Item>
                    <Breadcrumb.Item className="cursor-pointer">
                      <span>
                        {bred === '1'
                          ? 'Vacant Units'
                          : 'Vacancy View'}
                      </span>
                    </Breadcrumb.Item>
                  </Breadcrumb>
                </div>
                <div className="container-fluid pt-5">
                
                  <div className="w-full">
                  <Tabs onTabClick={(data) => handleBreadcrub(data)}>
                    <TabPane tab="Vacant Units" key="1">
                      <AdminVacant />
                    </TabPane>
                    <TabPane tab="Vacancy View" key="2">
                      <AdminVacantView />
                    </TabPane>
                    
                  </Tabs>
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
