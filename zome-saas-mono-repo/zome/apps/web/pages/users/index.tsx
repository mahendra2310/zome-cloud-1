/* eslint-disable react/jsx-no-useless-fragment */
import React, { useEffect, useState } from 'react';
import './users.moduel.less';

import { Antdtable, Header, Sidebar ,AntdSelect } from '@zome/ui';
import { useRouter } from 'next/router';
import { ApiGet, ApiPost } from 'apps/web/services/helpers/API/ApiData';

import {
  Breadcrumb,
  Modal,
  Upload,
  message,
  Button,
  Space,
  notification,
} from 'antd';
import { DownloadOutlined, HomeOutlined } from '@ant-design/icons';
import Link from 'next/link';
import AddUser from 'apps/web/components/add-user/addUser';
import { UploadOutlined } from '@ant-design/icons';

export function Index() {
  const router = useRouter();
  const [allUser, setAllUser] = useState<any>();
  const [visible, setVisible] = useState(false);
  const [fileValidate, setFileValidate] = useState('');
  const [files, setFiles] = useState([]);
  const [property,setProperty] = useState([]);
  const [selectedProperty,setSelectedProperty] = useState("");
  const [flag,setFlag] = useState(true);


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

  useEffect(() => {
    const getAllUser = async () => {
      await ApiGet('users')
        .then((res: any) => {
          setAllUser(res.data.reverse());
        })
        .catch((err) => {
          console.log('error in get data!!');
        });
    };
    //console.log(modal);
    getAllUser();
  }, []);
  
  
  useEffect(() => {
    const getAllProperties = async () => {
      await ApiGet('allproperties')
          .then((res: any) => {
            setProperty(res.data.data);
          })
          .catch((err) => {
            console.log('error in get data!!',err);
          });
        };

        if(flag){
          getAllProperties();
          setFlag(false)
        }
    
    }, [])
    

  useEffect(() => {
      
    const getUsersByProperty = async () => {
      const postData = {
        "property" : selectedProperty
      }
        await ApiPost('propertyUsers', postData)
        .then((res: any) => {
          setAllUser(res.data);    
        })
        .catch((err) => {
          console.log('error in get data!!',err);
        });
    };
    
    if(!flag){
          getUsersByProperty();
          setFlag(false)
        }
        
}, [selectedProperty])
  
  const openNotificationWithIcon = (type, error) => {
    notification[type]({
      message: 'Error',
      description: `${error}`,
      duration: '100',
    });
  };
  const handleUploadBulkCsv = async () => {
    let formData: any = new FormData();
    if (fileValidate && fileValidate.toString() == 'csv') {
      formData.append('userlist', files);
      await ApiPost('manual-user', formData)
        .then((res: any) => {
          console.log();
          if (res?.data?.errorMessages.length > 0) {
            for (let i = 0; i < res?.data?.errorMessages.length; i++) {
              openNotificationWithIcon('error', res?.data?.errorMessages[i]);
            }
            setTimeout(() => {
              window.location.reload();
            }, 20000);
          } else {
            console.log(res);
            message.error(res?.data?.msg);
          }
        })
        .catch((err) => {
          console.log(err);
        });
    } else {
      message.error('only csv file supported');
      setTimeout(() => {
        window.location.reload();
      }, 5000);
    }
  };

  const props = {
    name: 'file',
    action: 'https://www.mocky.io/v2/5cc8019d300000980a055e76',
    headers: {
      authorization: 'authorization-text',
    },
    onChange(info) {
      setFileValidate(
        info?.file?.name?.split('.')[
          info?.fileList[0]?.name?.split('.')?.length - 1
        ]
      );
      setFiles(info.file.originFileObj);
      if (info.file.status !== 'uploading') {
        console.log(info.file, info.fileList);
      }
      if (info.file.status === 'done') {
        message.success(`${info.file.name} file uploaded successfully`);
        handleUploadBulkCsv();
      } else if (info.file.status === 'error') {
        message.error(`${info.file.name} file upload failed.`);
      }
    },
  };

  const handleClick = (event,data) => {
    // 👇️ take parameter passed from Child component
    setSelectedProperty(data);
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
                      <span>Users</span>
                    </Breadcrumb.Item>
                  </Breadcrumb>
                </div>
                <div className="container-fluid pt-5">
                  <div className="w-full">
                    {/* <h1>Clients</h1> */}
                    {allUser?.msg !== 'You are not have authority role' ? (
                      <>
                        <div className=" flex justify-end">
                          <div>
                            <Upload {...props}>
                              <button
                                className="addUserbtn white-text-color block cursor-pointer text-center"
                                //    onClick={() => setVisible(true)}
                              >
                                <span className="mr-3">Upload csv</span>
                              </button>
                            </Upload>
                            <a
                              className="download cursor-pointer"
                              href="/userlisttest.csv"
                            >
                              <DownloadOutlined />
                              download sample csv for
                              tenant user
                            </a>
                          </div>
                          <button
                            className="addUserbtn white-text-color block cursor-pointer text-center ml-5"
                            onClick={() => setVisible(true)}
                          >
                            <span className="mr-3">Add User</span>
                          </button>
                        </div>
                        <AntdSelect children={property} handleClick={handleClick}/>
                        <Antdtable data={allUser} />
                      </>
                    ) : (
                      <h1>{allUser?.msg}</h1>
                    )}
                  </div>
                </div>
              </main>
            </div>
          </div>
          {visible && <AddUser visible={setVisible} />}
        </div>
      ) : (
        tokenNotValid()
      )}
    </>
  );
}

export default Index;
