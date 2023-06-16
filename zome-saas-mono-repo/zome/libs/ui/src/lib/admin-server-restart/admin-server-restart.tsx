/* eslint-disable @nrwl/nx/enforce-module-boundaries */
/* eslint-disable @typescript-eslint/no-empty-interface */

import React, { useState } from 'react';
import { ApiGet, ApiPost } from 'apps/web/services/helpers/API/ApiData';
import './admin-server-restart.module.less';
export interface AdminReportProps {}

export function AdminServer(props: AdminReportProps) {
  const [show, setShow] = useState(false);
  const handleServerRestart = async () => {
    await ApiGet('restart')
      .then((res) => {
        console.log(res);
        setShow(true);
      })
      .catch((err) => {
        console.log(err);
      });
  };
  return (
    <div className="p-10">
      <button
        className="gateway-btn-style-admin white-text-color block cursor-pointer text-center content-end"
        onClick={() => handleServerRestart()}
      >
        <span className="">Reboot Server</span>
      </button>

      {show && (
        <h3 className="text-green-600">Server restarted successfully</h3>
      )}
    </div>
  );
}

export default AdminServer;
