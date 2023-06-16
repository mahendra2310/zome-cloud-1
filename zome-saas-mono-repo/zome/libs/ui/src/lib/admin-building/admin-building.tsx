import React, { useEffect, useState } from 'react';
import './admin-building.module.less';

import { Antdtable, Header, Sidebar } from '@zome/ui';
import { useRouter } from 'next/router';
import { ApiDelete, ApiGet } from 'apps/web/services/helpers/API/ApiData';
import { AddBuilding } from 'apps/web/components/add-update-building/addBuilding';
import { Breadcrumb, Modal, Tooltip } from 'antd';
import { HomeOutlined } from '@ant-design/icons';
import Link from 'next/link';

import { Table, Tag, Space } from 'antd';
import EditBuilding from 'apps/web/components/add-update-building/editBuilding';

export function AdminBuilding() {
  const router = useRouter();
  const [allBuilding, setBuildingData] = useState<any>();
  const [visible, setVisible] = useState(false);
  const [visibleEdit, setVisibleEdit] = useState(false);
  const [allUpdateData, SetAllUpdateData] = useState();
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
      title: 'Block',
      dataIndex: 'block',
      key: 'block',
    },
    {
      title: 'address',
      dataIndex: 'address',
      key: 'address',
    },
    {
      title: 'action',
      //dataIndex: 'action',
      render: (row, data) => {
        return (
          <>
            <div className="flex justify-around m-block">
              <div
                onClick={() => deleteBuilding(row._id)}
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
                  onClick={() => editBuilding(row)}
                  className="cursor-pointer mt-2"
                >
                  <Tooltip placement="left" title="Edit">
                    {/* <InfoCircleOutlined className="px-2" /> */}
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
      key: 'action',
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

  const deleteBuilding = async (buildingId) => {
    console.log('buildingId::', buildingId);
    // buildingId = '6144d66d835177233088ee31';
    // console.log("buildingId:::",buildingId)
    await ApiDelete(`building/${buildingId}`, {})
      .then((res: any) => {
        let updatedbuildinglist = allBuilding.filter(
          (eachbuilding: any) => eachbuilding._id != buildingId
        );
        handleSetBuildingData(updatedbuildinglist);
        // setBuildingData(updatedbuildinglist);
      })
      .catch((err) => {
        console.log('error in get data!!', err);
      });
  };

  const editBuilding = async (row) => {
    SetAllUpdateData(row);
    setVisibleEdit(true);
    // console.log('get edit::', buildingId);
    // await ApiGet(`building/${buildingId}`)
    //   .then((res: any) => {
    //     console.log('res:::', res);
    //     if (res.data.status) {
    //       // setVisible(true);
    //     }
    //   })
    //   .catch((err) => {
    //     console.log('error in get data!!');
    //   });
  };
  const handleSetBuildingData = (building) => {
    const buildingData = building.map((item, i) => {
      return { ...item, key: i };
    });
    setBuildingData(buildingData);
  };
  const getallBuildings = async () => {
    await ApiGet('building')
      .then((res: any) => {
        handleSetBuildingData(res.data.data);
        // setBuildingData(res.data.data);
        // setData(res.data);
      })
      .catch((err) => {
        console.log('error in get data!!');
      });
  };

  const addBuildingSuccess = async () => {
    getallBuildings();
  };

  useEffect(() => {
    getallBuildings();
  }, []);

  const editBuildingSuccess = async (updatedData) => {
    // console.log("updatedData::::",updatedData )
    // let idx = allProperty.findIndex((eachproperty: any) => eachproperty._id == updatedData._id);
    // console.log("idx::",idx)
    // if(idx > -1){
    //   allProperty[idx] = updatedData;
    //   setPropertyData(allProperty);
    // }
    getallBuildings();
  };
  return (
    <>
      {token ? (
        <div>
          
          <div className="flex">
            <div className="s-layout">
              
              <main className={`s-layout__content `}>
          
                <div className="container-fluid pt-5">
                  <div className="w-full">
                    {allBuilding?.msg !== 'You are not have authority role' ? (
                      <>
                        <div className=" flex justify-end">
                          <button
                            className="login-btn-style white-text-color block cursor-pointer text-center"
                            onClick={() => setVisible(true)}
                          >
                            <span className="mr-3">Add Building</span>
                          </button>
                        </div>
                        <div className="mt-10">
                          <Table
                            columns={columns}
                            dataSource={allBuilding}
                            expandable={{
                              expandedRowRender: (record) => (
                                <p style={{ margin: 0 }}>
                                  {record?.propertyId?.name}
                                </p>
                              ),
                              rowExpandable: (record) =>
                                record?.propertyId?.name ? true : false,
                            }}
                            bordered
                            title={() => 'Buildings'}
                          />
                        </div>
                      </>
                    ) : (
                      <h1>{allBuilding?.msg}</h1>
                    )}
                  </div>
                </div>
              </main>
            </div>
          </div>
          {visible && (
            <AddBuilding
              visible={setVisible}
              addBuildingSuccess={addBuildingSuccess}
            />
          )}
          {visibleEdit && (
            <EditBuilding
              visibleEdit={setVisibleEdit}
              data={allUpdateData}
              editBuildingSuccess={editBuildingSuccess}
            />
          )}
        </div>
      ) : (
        tokenNotValid()
      )}
    </>
  );
}

export default AdminBuilding;