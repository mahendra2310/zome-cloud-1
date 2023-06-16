import React, { useEffect, useState } from 'react';
import { Tooltip, message, Button, Modal } from 'antd';
import { useRouter } from 'next/router';
import { ApiGet, ApiDelete, ApiPost } from 'apps/web/services/helpers/API/ApiData';
import AddProperty from 'apps/web/components/add-property/addProperty';
import { Table } from 'antd';
import Link from 'next/link'
import { CloseOutlined } from '@ant-design/icons';
import './tenantUsersList.module.less';

export function Index() {
  const router = useRouter();
  const [allProperty, setPropertyData] = useState<any>();
  const [visible, setVisible] = useState(false);
  const [confirmData, setConfirmData] = useState([]);
  const [allUser, setAllUser] = useState<any>();
  const [response, setResponse] = useState();
  const [modalFlag, setModalFlag] = useState(false);
  const [apartmentName, setApartmentName] = useState('');
  const [deleteFlag, setdeleteFlag] = useState(false);
  const [tenantTobeDeleted, setTenantToBeDeleted] = useState('');
  const [error, setError] = useState('');
  const [selectTenant, setSelectTenant] = useState(false);
  const [newTenantAdmin, setNewTenantAdmin] = useState([]);

  const [open, setOpen] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [modalText, setModalText] = useState('Content of the modal');

  const token =
    typeof window !== 'undefined' ? localStorage.getItem('x-auth-token') : null;
  const role =
    typeof window !== 'undefined' ? localStorage.getItem('userinfo') : null;

  const columns = [
    {
      title: 'firstName',
      dataIndex: 'firstName',
      key: 'firstName',
    },
    {
      title: 'lastName',
      dataIndex: 'lastName',
      key: 'lastName',
    },
    {
      title: 'role',
      dataIndex: 'role',
      key: 'role',
    }, {
      title: 'action',
      // dataIndex: 'action',
      render: (row, data) => {
        return (
          <>
            <div className="flex justify-around m-block">
              <div
                onClick={() => setDeleteTenant(row._id)}
                className="cursor-pointer mr-3 text-red-600"
              >
                <Tooltip placement="left" title="Remove">
                  <img
                    src="https://t4.ftcdn.net/jpg/03/46/38/41/240_F_346384140_CSEbRk7NsnZ6Mo01cBc3vUfipngdjHWl.jpg"
                    className="w-10"
                  />
                </Tooltip>
              </div>
            </div>
          </>
        );
      },
    },
  ];
  const columns2 = [
    {
      title: 'Name',
      dataIndex: 'firstName',
      key: 'firstName',
      // render: (row, data) => {
      //   return (
      //     <>
      //       <div className="flex justify-around m-block">
      //         <div
      //           onClick={() => setNewTenantAdmin(row._id)}
      //           className="cursor-pointer mr-3 text-red-600"
      //         >

      //         </div>
      //       </div>
      //     </>
      //   );
      // },
    }, {
      title: 'lastName',
      dataIndex: 'lastName',
      key: 'lastName', 
  }, {
      title: 'role',
      dataIndex: 'role',
      key: 'role',
    },
  ];
  const tokenNotValid = () => {
    typeof window !== 'undefined' ? (
      router.push('/')
    ) : (
      <h1>not working router push</h1>
    );
  };


  const setDeleteTenant = async (tenant_id) => {
    showModal();
    //to open modal 
    setModalFlag(true);

    setTenantToBeDeleted(tenant_id);

  }

  const deleteTenantAPI = async (tenant_id) => {
    showModal();
    setTenantToBeDeleted(tenant_id);
    await ApiDelete(`deleteTenant/${tenant_id}`, {})
      .then((res: any) => {

      if(res.data.flag== "RemoveApartmentAssociation"){
        message.success("Your user account has been deleted successfully, you are getting logged out");
        localStorage.clear();
        router.push('/');
      } else if (res.data.flag == "TenantAdministratorUser") {
          if (confirm("You cannot delete yourself without assigning new tenant Admin,Please assign a new Tenant Admin")) {
            router.push("/tenantUsersList");
            setSelectTenant(true);
          } else {
            router.push("/tenantUsersList")
            // setTimeout(() => {
            // }, 5000);
          }
        } else {
          let updatedtenantList = allUser.filter(
            (eachuser: any) => eachuser._id != tenant_id
          );
          setAllUser(updatedtenantList);
        }
        setModalFlag(false);
      })
      .catch((err) => {
        console.log('error in get data!!', err);
      });


  };

  useEffect(() => {
    const getAllUser = async () => {
      await ApiGet('Apartmentusers')
        .then((res: any) => {
          setAllUser(res.data.TenantUsers);
          setApartmentName(res.data.aptName)
        })
        .catch((err) => {
          console.log(err, 'error in get data!!');
        });
    };
    getAllUser();
  }, []);




  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [loading, setLoading] = useState(false);

  const onSelectChange = (newSelectedRowKeys) => {
    console.log('selectedRowKeys changed: ', selectedRowKeys);
    setSelectedRowKeys(newSelectedRowKeys);
    console.log(selectedRowKeys, "....................................Row Key");

  };
  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,

    onSelect: (record, selected, selectedRows, nativeEvent) => {
      console.log('--204-------', record);
      setNewTenantAdmin(record._id);
      let newData = [];
      selectedRows.map((re: { _id: any; }) => {
        try {
          newData.push(re._id);
        } catch (error) {
          console.log(error, "some error occur")
        }
      });
      setConfirmData(newData);
    },
  };
  const hasSelected = selectedRowKeys.length > 0;

  const showModal = () => {
    setOpen(true);
  };

  const handleOk = () => {
    setdeleteFlag(true);
    deleteTenantAPI(tenantTobeDeleted);
    setModalText('The modal will be closed after two seconds');
    setConfirmLoading(true);

    setTimeout(() => {
      setOpen(false);
      setConfirmLoading(false);
    }, 15000);
  };

  const handleCancel = () => {
    setOpen(false);
  };

  if (selectedRowKeys.length > 1) {

    if (confirm("please select only one tenant")) {
      setSelectedRowKeys([""]);

    } else {
      setSelectedRowKeys([""]);
    }
  } else {

  }

  const assignNewTenantAdmin = (e) => {
    ApiGet(`tenantToAdmin/${newTenantAdmin}`)
      .then(async (res: any) => {


        if (res.data.flag == "AdministratorUser") {
          message.error("you can not re-assign yourself tenantAdmin, please select a new tenant");
        }
        else if (res.data.flag == "userRemoved") {
          message.success("Your user account has been deleted successfully, you are getting logged out");
          localStorage.clear();
          router.push('/');
        }

      })
      .catch((err) => {
        console.log(err);
      });
  }


  const NormalTenantList = (e) => {
    window. location. reload()
  }

  return (
    <>
      {token ? (
        <div>
          <div className="flex">
            <div className="s-layout">
              <main className={`s-layout__content `}>

                <div className="container-fluid pt-5">
                  <div className="w-full">
                    {selectTenant == false ? (
                      <>
                        <div className="flex justify-end" >
                          <span className="block cursor-pointer border-b-2 border-blue-500 hover:text-blue-700 hover:border-blue-700 text-center content-end my-3 text-blue-500 text-md" >
                          <Link href={"/profile"}>go back</Link>
                          </span>
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
                                  {/* <button  
                                    className="gateway-btn-style-admin white-text-color block cursor-pointer text-center content-end"
                                    onClick={(e) =>getGatewaysById(e) }
                                    >
                                    show gateways
                                  </button>
                                 */}
                                </div>
                              </div>
                            </div>
                          </>
                        )}

                        {
                          modalFlag == true &&
                          <>

                            <Modal
                              title="Permission"
                              visible={open}
                              onOk={handleOk}
                              confirmLoading={confirmLoading}
                              onCancel={handleCancel}
                              footer={null}
                            >

                              <p className="text-lg ">Are you sure you want to remove this tenant?</p>
                              <div className="flex flex-row-reverse">
                                <button
                                  className="remove-btn-style white-text-color cursor-pointer  "
                                  onClick={() => handleCancel()}
                                >
                                  No
                                </button>
                                <button
                                  className="remove-btn-style white-text-color cursor-pointer mx-2 "
                                  onClick={() => { handleOk() }}
                                >
                                  Yes
                                </button>
                              </div>
                            </Modal>
                          </>
                        }
             
                          <div>
                            <h1>Apartment Name :- {apartmentName}</h1>
                            <div className="mt-10">
                              <Table
                                columns={columns}
                                dataSource={allUser}
                                bordered
                                title={() => 'Registered Users'}
                                //rowSelection={rowSelection}
                                rowKey="_id"
                              />
                            </div>
                          </div>
                        
                      </>
                    ) : (
                      <div>
                      <div className="mt-10">
                        {selectedRowKeys?.length > 0 && (
                          <>
                            <div className="flex justify-between p-3 bg-gray-100">
                              <div>
                                <h1>Assign Tenant Administrator role to one Tenant</h1>
                                {hasSelected ? `${selectedRowKeys.length} tenant selected  ` : ''}
                              </div>
                              <div className="mr-5 mt-3 cursor-pointer">
                                <div>
                                  <button
                                    className="block cursor-pointer border-b-2 border-blue-500 hover:text-blue-700 hover:border-blue-700 text-center content-end my-3 text-blue-500 text-md"
                                    onClick={(e) => assignNewTenantAdmin(e)}
                                  >
                                    Assign Admin Role
                                  </button>

                                </div>
                              </div>

                              {/* </Link> */}
                            </div>
                          </>
                        )}
                       
                        <button
                          className="block cursor-pointer border-b-2 border-blue-500 hover:text-blue-700 hover:border-blue-700 text-center content-end my-3 text-blue-500 text-md"
                          onClick={(e) => NormalTenantList(e)}
                        >
                         go back
                        </button>
                        <Table
                          columns={columns2}
                          dataSource={allUser}
                          bordered
                          title={() => 'Tenant-Users'}
                          rowSelection={rowSelection}
                          rowKey="_id"

                        />
                      </div>
                    </div>
                    )

                    }
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
