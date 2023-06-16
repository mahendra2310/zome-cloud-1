import React, { useEffect, useState } from 'react';
import './properties.moduel.less';
import { Input, InputNumber, Tooltip,message } from 'antd';

import { Antdtable, Header, Sidebar } from '@zome/ui';
import { useRouter} from 'next/router';
import { ApiGet, ApiDelete, ApiPost } from 'apps/web/services/helpers/API/ApiData';

import { Breadcrumb, Modal } from 'antd';
import { EditOutlined, HomeOutlined } from '@ant-design/icons';
import Link from 'next/link';
import AddProperty from 'apps/web/components/add-property/addProperty';
import { Table, Tag, Space } from 'antd';
import EditProperty from 'apps/web/components/add-property/editProperty';
import { async } from 'rxjs';

export function Index() {
  const router = useRouter();
  const [allProperty, setPropertyData] = useState<any>();
  const [visible, setVisible] = useState(false);
  const [visibleEdit, setVisibleEdit] = useState(false);
  const [allUpdateData, SetAllUpdateData] = useState();
  const [confirmData, setConfirmData] = useState([]);
  const [response,setResponse] = useState();

  const token =
    typeof window !== 'undefined' ? localStorage.getItem('x-auth-token') : null;
  const role =
    typeof window !== 'undefined' ? localStorage.getItem('userinfo') : null;

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Meter No',
      dataIndex: 'meter_id',
      key: 'meter_id',
    },
    {
      title: 'address',
      dataIndex: 'address',
      key: 'address',
    },
    {
      title: 'action',
      // dataIndex: 'action',
      render: (row, data) => {
        return (
          <>
            <div className="flex justify-around m-block">
              <div
                onClick={() => deleteProperty(row._id)}
                className="cursor-pointer mr-3 text-red-600"
              >
                <Tooltip placement="left" title="Remove">
                  <img
                    src="https://t4.ftcdn.net/jpg/03/46/38/41/240_F_346384140_CSEbRk7NsnZ6Mo01cBc3vUfipngdjHWl.jpg"
                    className="w-10"
                  />
                </Tooltip>
              </div>

              <div className="mr-3 text-blue-600">
                <div
                  onClick={() => editProperty(row)}
                  className="cursor-pointer mt-2"
                >
                  <Tooltip placement="left" title="Edit">
                    {/* <EditOutlined className="px-2" /> */}
                    <img
                      src="https://www.freeiconspng.com/thumbs/edit-icon-png/edit-new-icon-22.png"
                      className="w-7"
                    />
                  </Tooltip>
                </div>
              </div>
            </div>
          </>
        );
      },
    },
  ];
  //console.log('role--', role);
  const tokenNotValid = () => {
    typeof window !== 'undefined' ? (
      router.push('/')
    ) : (
      <h1>not working router push</h1>
    );
  };

  const deleteProperty = async (propertyId) => {
    console.log('propertyId::', propertyId);
    // propertyId = '6144d66d835177233088ee31';
    // console.log("propertyId:::",propertyId)
    await ApiDelete(`property/${propertyId}`, {})
      .then((res: any) => {
        //  console.log("propery removed!!::",(this.allProperty).length)
        let updatedPropertylist = allProperty.filter(
          (eachproperty: any) => eachproperty._id != propertyId
        );
        setPropertyData(updatedPropertylist);
      })
      .catch((err) => {
        console.log('error in get data!!', err);
      });
  };

  const editProperty = async (row) => {
    SetAllUpdateData(row);
    setVisibleEdit(true);
    // console.log('get edit::', propertyId);
    // await ApiGet(`property/${propertyId}`)
    //   .then((res: any) => {
    //     console.log('res:::', res);
    //     if (res.data.status) {
    //       setVisible(true);
    //     }
    //   })
    //   .catch((err) => {
    //     console.log('error in get data!!');
    //   });
  };

  const getallProperty = async () => {
    await ApiGet('property')
      .then((res: any) => {
        setPropertyData(res.data.data);

        // setData(res.data);
      })
      .catch((err) => {
        console.log('error in get data!!');
      });
  };

  const addPropertySuccess = async () => {
    getallProperty();
  };

  const editPropertySuccess = async (updatedData) => {
    // console.log("updatedData::::",updatedData )
    // let idx = allProperty.findIndex((eachproperty: any) => eachproperty._id == updatedData._id);
    // console.log("idx::",idx)
    // if(idx > -1){
    //   allProperty[idx] = updatedData;
    //   setPropertyData(allProperty);
    // }
    getallProperty();
  };

  useEffect(() => {
    //console.log(modal);
    getallProperty();
  }, []);

  const getGatewayByProperty =  (e) => {
    const data = {
      propertyids : confirmData
    }
    let dataJSON = JSON.stringify(data);
    console.log(data);
    
      router.push({
        pathname: '/dashboard',
        query: {
          data: dataJSON,
        },
      });
  }

    const getGatewaysById =  (e) => {
      const data = {
        meterids : confirmData
      }
      //console.log(data,"confirmdata...");
       ApiPost('gateway-properties',data)
      .then(async (res: any) => {
        console.log('res------------',  res.data[0]);
        //let queryData = JSON.stringify (res.data);
        const queryData = res.data[0];
        setResponse(queryData)
        //console.log('queryData-----------1-',   queryData);
      
        router.push({
          pathname: '/dashboard',
          query: {
            data: JSON.stringify(confirmData),
          },
        });

        if (res.data.msg) {
          message.error(res.data.msg);
        } else {
          message.success('selected property Gateways');
      }
      })
      .catch((err) => {
        console.log(err);
      });
    } 

  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [loading, setLoading] = useState(false);

  const start = () => {
    setLoading(true); // ajax request after empty completing
    setTimeout(() => {
      setSelectedRowKeys([]);
      setLoading(false);
    }, 1000);
  };
  const onSelectChange = (newSelectedRowKeys) => {
    console.log('selectedRowKeys changed: ', selectedRowKeys);
    setSelectedRowKeys(newSelectedRowKeys);
  };
  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,

    onSelect: (record, selected, selectedRows, nativeEvent) => {
          console.log('---------', record, );
          let newData = [];
          selectedRows.map((re: {_id: any; }) => {
            newData.push(re._id);
          });
          setConfirmData(newData);
        },
        onSelectAll: (selected, selectedRows, changeRows) => {
          console.log('---------', selected, selectedRows);
          let newData = [];
          selectedRows.map((re: {_id: any; }) => {
            newData.push(re._id);
          });
          setConfirmData(newData);
        }
  };
  const hasSelected = selectedRowKeys.length > 0;
 // console.log('000...........', confirmData);

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
                      <span>All Properties</span>
                    </Breadcrumb.Item>
                  </Breadcrumb>
                </div>
                <div className="container-fluid pt-5">
                  <div className="w-full">
                    {allProperty?.msg !== 'You are not have authority role' ? (
                      <>
                        <div className=" flex justify-end">
                          <button
                            className="login-btn-style white-text-color block cursor-pointer text-center"
                            onClick={() => setVisible(true)}
                          >
                            <span className="mr">Add Property</span>
                          </button>
                          {/* <button
                            className="login-btn-style white-text-color block cursor-pointer text-center"
                            onClick={() => deleteProperty('')}
                          >
                            <span className="mr-3">deleteProperty temp</span>
                          </button> */}
                        </div>

                        {selectedRowKeys?.length > 0 && (
                          <>

                            <div className="flex justify-between p-3 bg-gray-100">
                              <div>
                                <h1> Properties to view gateways</h1>
                                {hasSelected ? `${selectedRowKeys.length} property Selected  ` : ''}
                              </div>
                              <div className="mr-5 mt-3 cursor-pointer">
                                <div>
                                  <button  
                                    className="gateway-btn-style-admin white-text-color block cursor-pointer text-center content-end"
                                    onClick={(e) =>getGatewayByProperty(e) }
                                    >
                                    show gateways
                                  </button>
                                
                                </div>
                              </div>
                             
                              {/* </Link> */}
                            </div>
                          </>
                        )}
                        
                        <div className="mt-10">
                          <Table
                            columns={columns}
                            dataSource={allProperty}
                            bordered
                            title={() => 'Properties'}
                            rowSelection={rowSelection}
                            rowKey="meter_id"
                          />
                        </div>
                      </>
                    ) : (
                      <h1>{allProperty?.msg}</h1>
                    )}
                  </div>
                </div>
              </main>
            </div>
          </div>
          {visible && (
            <AddProperty
              visible={setVisible}
              addPropertySuccess={addPropertySuccess}
            />
          )}
          {visibleEdit && (
            <EditProperty
              visibleEdit={setVisibleEdit}
              data={allUpdateData}
              editPropertySuccess={editPropertySuccess}
            />
          )}
        </div>
      ) : (
        tokenNotValid()
      )}
    </>
  );
}

export default Index;