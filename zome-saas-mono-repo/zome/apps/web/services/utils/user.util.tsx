import localStore from './localstore.util';
import { get, filter } from 'lodash';

export const setUserInfo = async (info) => {
  const _data = { ...info };
  await localStore.store_data('userinfo', _data);
  return true;
};
export const getUserInfo = () => localStore.get_data('userinfo');

export const removeUserInfo = () => localStore.remove_data('userinfo');

export const setAdminInfo = async (info) => {
  const _data = { ...info };
  await localStore.store_data('Admininfo', _data);
  return true;
};
export const getAdminInfo = () => localStore.get_data('Admininfo');

export const removeAdminInfo = () => localStore.remove_data('Admininfo');

export const setWorkshopInfo = async (info) => {
  const _data = { ...info };
  await localStore.store_data('workshopinfo', _data);
  return true;
};
export const getWorkshopInfo = () => localStore.get_data('workshopinfo');

export const setVendorInfo = async (info) => {
  const _data = { ...info };
  await localStore.store_data('vendorinfo', _data);
  return true;
};
export const getVendorInfo = () => localStore.get_data('vendorinfo');

export const removeVendorInfo = () => localStore.remove_data('vendorinfo');

export const setUserRole = async (info) => {
  const _data = { ...info };
  await localStore.store_data('userRole', _data);
  return true;
};
export const getUserRole = () => get(localStore.get_data('userRole'), 'role');

export const removeUserRole = () => localStore.remove_data('userRole');

export const getCategories = async () => {
  const _userInfo = await getUserInfo();
  const categories = filter(_userInfo.categories, (item) => item._id);

  return categories;
};

//signup first page
export const setsignupBasicInfo = async (info) => {
  const _data = { ...info };
  await localStore.store_data('signupBasicInfo', _data);
  return true;
};
export const getsignupBasicInfo = () => localStore.get_data('signupBasicInfo');

export const removesignupBasicInfo = () =>
  localStore.remove_data('signupBasicInfo');

//signup second page
export const setsignupDeviceId = async (info) => {
  const _data = { ...info };
  await localStore.store_data('signupDeviceId', _data);
  return true;
};
//login to open temp popup
export const setTempPopup = async (info) => {
  const _data = info;
  await localStore.store_data('tempPopup', _data);
  return true;
};
export const getsignupDeviceId = () => localStore.get_data('signupDeviceId');

export const getTempPopup = () => localStore.get_data('tempPopup');

export const removesignupDeviceId = () =>
  localStore.remove_data('signupBasicInfo');
