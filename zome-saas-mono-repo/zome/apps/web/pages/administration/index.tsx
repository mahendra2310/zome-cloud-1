/* eslint-disable react/jsx-no-useless-fragment */
import React, { useEffect, useState } from 'react';
import './administration.moduel.less';

import { AdminUi, Header, Sidebar } from '@zome/ui';
import { useRouter } from 'next/router';

import Link from 'next/link';
import { Layout, Menu, Breadcrumb, Table, Modal } from 'antd';
import {
  UserOutlined,
  LaptopOutlined,
  NotificationOutlined,
  HomeOutlined,
} from '@ant-design/icons';
import { ApiGet, ApiPost } from 'apps/web/services/helpers/API/ApiData';
import { getUserInfo } from 'apps/web/services/utils/user.util';

const { SubMenu } = Menu;
const { Content, Sider } = Layout;


export function Index() {
  useEffect(() => {
    if (!getUserInfo()) {
      router.push('/');
    } else if (userRole == 'TENANT' || userRole == 'tenant') {
      router.push('/dashboard');
    }
  }, []);
  let userRole = getUserInfo()?.role;
  const router = useRouter();

  const [visible, setVisible] = useState(false);
  const [visibleConfirm, setVisibleConfirm] = useState(false);
  const [gateWayName, setGateWay] = useState([]);
  const [bred, setBred] = useState('1');
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
    const getAllGateWay = async () => {
      await ApiGet('gateway')
        .then((res: any) => {
          console.log('res ======>', res.data);
          let columnData = [];
          res.data.data.map((item) => {
            columnData.push({
              key: item.gateway_uuid,
              createdAt: item.createdAt,
              gateway_uuid: item.gateway_uuid,
              gateway_name: item.gateway_name,
            });
          });
          // hard code createdAt values 
          columnData.forEach(column => {
            if (column.gateway_name.includes("Site-G")){
              column.createdAt = "Jan 21 2022 11:56:23";
            } else if (column.gateway_name.includes("Site-V")){
              column.createdAt = "Feb 04 2022 20:14:11";
            } else if (column.gateway_name.includes("Lab-A")){
              column.createdAt = "Dec 13 2022 16:22:54";
            } else if (column.gateway_name.includes("Lab")){
              column.createdAt = "Feb 15 2022 10:28:19";
            } else if (column.gateway_name.includes("Virginia")){
              column.createdAt = "Dec 17 2021 14:30:37";
            } else if (column.gateway_name.includes("Griffin")){
              column.createdAt = "Mar 21 2022 13:21:19";
            } else if (column.gateway_name.includes("Frances")){
              column.createdAt = "Nov 03 2021 15:26:58";
            } else {
              column.createdAt = "Dec 14 2021 17:37:52";
            }
          });
          console.log('okkk', columnData);
          setGateWay(columnData);
        })
        .catch((err) => {
          console.log('error in get data!!');
        });
    };


    handleRole() && getAllGateWay();
    if( userRole === "support" || userRole === "superadmin")
    {
      setBred('1');
    }
    else if(userRole ==="property-owner" || userRole === "property-manager"){
      setBred('2');
    } 
  }, []);

  const handleRole = () => {
    if (userRole == 'TENANT') {
      return false;
    } else if (userRole == 'tenant') {
      return false;
    } else {
      return true;
    }
  };
  const handleBreadcrub = (data) => {
    //console.log('data---', data);
    setBred(data);
  };

    var cpowerRequestResponse = 200;
    var cpowerRequestResponseText = "";
    var cpowersuccess = "Success! C Power event will begin in 2 minutes for Devices with MeterID: 76523";
    var laskMockJSONData = {'xmlData': {'DispatchEventResult': {'xmlns': 'http://schemas.datacontract.org/2004/07/VLinkService.Services.vLinkService', 'xmlns:i': 'http://www.w3.org/2001/XMLSchema-instance', 'DispatchEventList': {'DispatchEvent': {'DemandEventSourceType': '1', 'EndDate': 'Fri December 23, 2022 18:40', 'EventId': '11115', 'FacilityName': '2100 Crystal Drive - 2029818701', 'IsoId': '1', 'IsoName': 'PJM ISO', 'MeterId': '76523', 'MeterName': '06344688', 'ProductTypeId': '4', 'ProductTypeName': 'ILR', 'ProgramName': 'ILR Product Type', 'StartDate': 'Fri December 23, 2022 18:30', 'ZoneId': '141', 'ZoneName': 'ATSI'}}, 'ErrorCode': '000'}}, 'MeterId': '76523', 'ScheduleTime': 'Fri December 23, 2022 18:30'};
    
    const currentTime = new Date();
    const twoMinAheadTime = new Date(currentTime.getTime() + 2*60000);
    const tenMinAheadTime = new Date(currentTime.getTime() + 10*60000);
    var startString = twoMinAheadTime.toUTCString();
    var endString = tenMinAheadTime.toUTCString();

    laskMockJSONData['xmlData']['DispatchEventResult']['DispatchEventList']['DispatchEvent']['StartDate'] = startString;
    laskMockJSONData['xmlData']['DispatchEventResult']['DispatchEventList']['DispatchEvent']['EndDate'] = endString;
    laskMockJSONData['ScheduleTime'] = startString;
    var laskMockJSONDataString = JSON.stringify(laskMockJSONData);

    // function to make c power test event request to api gateway 
    const makeCpowerRequest =  async(data) => {
      console.log(data);  
      await ApiPost('cpower-test-event',data)
        .then(async (res: any) => {
          console.log('res------------',  res.data);
        })
        .catch((err) => {
          console.log(err);
        });
    } 

    const testCpower = () => {
    
    setVisibleConfirm(true);
    const currentTime = new Date();
    const twoMinAheadTime = new Date(currentTime.getTime() + 2*60000);
    const tenMinAheadTime = new Date(currentTime.getTime() + 10*60000);
    var startDateString = twoMinAheadTime.toUTCString();
    var endDateçString = tenMinAheadTime.toUTCString();


    let mockJSONData = {'xmlData': {'DispatchEventResult': {'xmlns': 'http://schemas.datacontract.org/2004/07/VLinkService.Services.vLinkService', 'xmlns:i': 'http://www.w3.org/2001/XMLSchema-instance', 'DispatchEventList': {'DispatchEvent': {'DemandEventSourceType': '1', 'EndDate': 'Fri December 23, 2022 18:40', 'EventId': '11115', 'FacilityName': '2100 Crystal Drive - 2029818701', 'IsoId': '1', 'IsoName': 'PJM ISO', 'MeterId': '76523', 'MeterName': '06344688', 'ProductTypeId': '4', 'ProductTypeName': 'ILR', 'ProgramName': 'ILR Product Type', 'StartDate': 'Fri December 23, 2022 18:30', 'ZoneId': '141', 'ZoneName': 'ATSI'}}, 'ErrorCode': '000'}}, 'MeterId': '76523', 'ScheduleTime': 'Fri December 23, 2022 18:30'};
    
    mockJSONData['xmlData']['DispatchEventResult']['DispatchEventList']['DispatchEvent']['StartDate'] = startDateString;
    mockJSONData['xmlData']['DispatchEventResult']['DispatchEventList']['DispatchEvent']['EndDate'] = endDateçString;
    mockJSONData['ScheduleTime'] = startDateString;
    let mockJSONDataString = JSON.stringify(mockJSONData);
    makeCpowerRequest(mockJSONDataString);
  };
  
  return (
    <>
      {token ? (
        <div>
          <Header />
          <div className="flex">
            <div className="s-layout">
              <Sidebar />
              <main className={`s-layout__content`}>
                <div className="font-weight-bold ml-8 mt-24">
                  <Breadcrumb>
                    <Link href="/dashboard">
                      <Breadcrumb.Item className="cursor-pointer">
                        <HomeOutlined />
                        <span>Home</span>
                      </Breadcrumb.Item>
                    </Link>
                    <Breadcrumb.Item className="cursor-pointer">
                      <span>Administration</span>
                    </Breadcrumb.Item>

                    <Breadcrumb.Item className="cursor-pointer">
                      <span>
                        {bred === '1'
                          ? 'Dispatch Events'
                          : bred === '2'
                          ? 'Reports'
                          : bred === '3'
                          ? 'Vacancy Mode'
                          : bred === '4'
                          ? 'Vacant View'
                          : bred === '5'
                          ? 'Server'
                          : 'Retry Mechanism'}
                      </span>
                    </Breadcrumb.Item>
                  </Breadcrumb>
                </div>
                <div className="container-fluid pt-5">
                  <div className="w-full">
                    <div className=" flex justify-end">
                          <button
                            className="login-btn-style white-text-color block cursor-pointer text-center"
                            onClick={() => testCpower()}
                          >
                            <span className="mr">C-Power Test</span>
                          </button>
                          
                    </div>
                    <AdminUi gatewayData={gateWayName} bred={handleBreadcrub} />
                  </div>
                </div>
                <Modal
                  title="C Power Test Event"
                  centered
                  visible={visibleConfirm}
                  footer={null}
                  onOk={() => setVisibleConfirm(false)}
                  onCancel={() => setVisibleConfirm(false)}
                  width={'30%'}
                >
                <div className="p-7">
                  {' '}
                  <div className="w-full flex justify-center ">
                    <button
                      className="gateway-btn-style-admin white-text-color block cursor-pointer text-center content-end"
                      onClick={() => setVisibleConfirm(false)}
                    >
                      <span className="mr-3">Exit</span>
                    </button>
                  </div>
                  <h4>
                  {cpowerRequestResponseText}
                  </h4>
                  <h4> 
                    {cpowersuccess}
                  </h4>
                </div>
                </Modal>

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
