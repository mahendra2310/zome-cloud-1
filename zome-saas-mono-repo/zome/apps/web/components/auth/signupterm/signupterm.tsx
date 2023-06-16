import React, { useState, useEffect } from 'react';
import { ReactComponent as LoginImage } from './login.svg';
import router from 'next/router';
import { ApiPost } from '../../../services/helpers/API/ApiData';
import * as authUtil from '../../../services/utils/auth.util';
import * as userUtil from '../../../services/utils/user.util';
import * as localStoreUtil from '../../../services/utils/localstore.util';
import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import './signupterm.module.less';
import Link from 'next/link';
const antIcon = (
  <LoadingOutlined style={{ fontSize: 20, color: 'white' }} spin />
);

const axios = require('axios');

const Signupterm = () => {
  let signupBasicInfo = localStoreUtil?.default.get_data('signupBasicInfo');
  let signupDeviceId = localStoreUtil?.default.get_data('signupDeviceId');
  const [loading, setLoading] = useState(false);

  const [agreeCondition, setagreeCondition] = useState(false);
  const [signupError, setSignupError] = useState('');
  const [signupButton, setSignupButton] = useState(
    'next-button-style-disabled'
  );
  // useEffect(() => {
  //   if (!userUtil.getsignupBasicInfo()) {
  //     router.push('/login');
  //   } else {
  //     if (!userUtil.getsignupDeviceId()) {
  //       router.push('/signupdevice');
  //     }
  //   }
  // }, []);

  //* testing purpose api call is here.....

  // useEffect(() => {
  //   const getTestData = async () => {
  //     axios
  //       .get('http://3.85.120.212:4000/test')
  //       .then((response) => {
  //         //console.log(response.data[0].name)
  //       })

  //       .catch((err) => {
  //         console.log('err', err);
  //       });
  //   };

  //   getTestData();
  // }, []);

  const registerUser = async (e) => {
    e.preventDefault();
    if (!agreeCondition) {
      setSignupError('Please Read And Accept T&C.');
      setSignupButton('next-button-style-disabled');
    } else {
      e.preventDefault();
      // var data = {
      //   full_name: signupBasicInfo?.fullName,
      //   username: signupBasicInfo?.userName,
      //   email: signupBasicInfo?.userEmail,
      //   phone: signupBasicInfo?.userPhone,
      //   password: signupBasicInfo?.userPassword,
      //   deviceId: signupDeviceId?.deviceId,
      // };
      setLoading(true);
      router.push('/signupdevice');
  //     await ApiPost('signup', data)
  //       .then(async (res: any) => {
  //         if (res.data.msg === 'Username already exists') {
  //           setLoading(false);
  //           setSignupError('Username already exists');
  //         } else if (res.data.msg === 'Email already exists') {
  //           setSignupError('Email already exists');
  //         } else {
  //           setLoading(false);
  //           localStorage.clear();
  //           authUtil.setToken(res?.data?.token);
  //           userUtil.setUserInfo(res.data);
  //           localStoreUtil?.default.remove_data('signupBasicInfo');
  //           localStoreUtil?.default.remove_data('signupDeviceId');
  //         }
  //         setLoading(false);
  //       })
  //       .catch((err) => {
  //         setLoading(false);
  //         console.log(err);
  //       });
   }
  };

  return (
    <section className="login-banner bg-white">
      <div className="">
        <div className="lg:flex md:flex  align-content">
          <div className="lg:w-4/6 md:w-1/2 m-pl-2 flex justify-center items-center banner-full-height ">
            <div className="login-banner-img ">
              <LoginImage className="login-banner-img" />
            </div>
          </div>
          <div className="lg:w-2/6 md:w-1/2 pl-8 pr-8 m-pl-2 m-login-banner">
            <div className="left">
              <div className="header terms-text-align">
                <h2 className="opensans-bold heading-title-text-color heading-title-size">
                  {/* Welcome Back To */}
                  Welcome to ZOME
                </h2><br/><br/>
                <h6 className="child-text-color font-size-16 tracking-normal mt-3 mb-4">
                  Terms and Conditions of the ZOME service
                </h6>
                <h5 className="text-red-600">{signupError}</h5>
              </div>
              <div className="terms-condition-box">
                <p>
                  EFFECTIVE DATE: September 1, 2021 <br/> READ THE FOLLOWING TERMS AND
                  CONDITIONS OF THIS SOFTWARE LICENSE CAREFULLY BEFORE
                  PROCEEDING. <br/> BY PROCEEDING AND CLICKING THE CHECKBOX FOR “I
                  agree to the terms of service” AND THEN CLICKING ON THE
                  “SUBMIT” BUTTON, YOU ARE ACCEPTING AND AGREEING TO THE
                  FOLLOWING SOFTWARE LICENSE TERMS AND CONDITIONS. IF YOU ARE
                  NOT WILLING TO BE BOUND BY THE FOLLOWING SOFTWARE LICENSE
                  TERMS AND CONDITIONS, YOU SHOULD CHOOSE "DECLINE" AND PROMPTLY
                  EXIT THE ZOMEKIT CONNECTED PRODUCT SOFTWARE APPLICATION. THIS
                  LICENSE AGREEMENT REPRESENTS THE ENTIRE AGREEMENT CONCERNING
                  THE ZOME SOFTWARE (“SOFTWARE”) BETWEEN YOU AND ZOME ENERGY
                  NETWORKS, INC (“ZOME”), AND IT SUPERSEDES ANY PRIOR PROPOSAL,
                  REPRESENTATION, OR UNDERSTANDING BETWEEN THE PARTIES.1.
                  LICENSE GRANT AND USEa. ZOME grants to You a nonexclusive,
                  non-transferable license to access the Software via your
                  Mobile Device or Browser-based viewing device, including but
                  not limited to computer desktops/laptops and iPads, and to use
                  the machine-readable version of Software, as may be updated
                  from time to time without notice by Licensor at Licensor’s
                  sole discretion ("Licensed Software"), user manuals and
                  technical materials viewable and printable through Licensor’s
                  website (the "Documentation”). The Licensed Software and
                  Documentation are collectively called the "System.”b. You
                  acknowledge that You have no ownership, rights, title or other
                  interest in the Software apart from that granted hereunder.
                  All rights, title, and interest including, but not limited to,
                  intellectual property interests, in and to the System are the
                  exclusive property of Licensor, and this Agreement shall not
                  be deemed a transfer of title or ownership in any respect.c.
                  You acknowledge that the license granted hereunder is
                  terminable at will by ZOME in its sole and absolute
                  discretion. Termination of the Agreement revokes Your license
                  and ends Your rights. In case of such termination, You will
                  immediately cease use of the System. The terms that by their
                  sense and context are intended to survive performance by
                  either or both parties shall so survive the performance and
                  termination of the Agreement, including without limitation
                  those terms relating to warranty limitations, limitation of
                  liability, remedies or damages, or ZOME’s proprietary
                  rights.d. You acknowledge that the Licensed Software may
                  include software provided by third parties ("Third Party
                  Software") and the licensor of any Third Party Software
                  embedded in the Licensed Software has a proprietary interest
                  in such software.e. You may view and download any
                  Documentation from ZOME but solely for Your personal,
                  non-commercial use. You will not otherwise, in whole or in
                  part, sublicense, copy, rent, loan, transfer, modify, enhance,
                  prepare derivatives of, decompile, or reverse engineer any
                  portion of the System.f. If any modifications, enhancements,
                  improvements or alterations to the Software are or have been
                  made by ZOME, You or any non-party, either singly or in
                  combination, all such modifications, enhancements,
                  improvements or alterations shall belong exclusively to ZOME.
                  You agree to assign to ZOME any ownership or other right,
                  title and interest in or to any such improvements,
                  enhancements, modifications or alterations and to execute any
                  documents to facilitate said assignment that are requested of
                  it by ZOME.g. Your rights hereunder may not be assigned, sold,
                  transferred, pledged or encumbered in any way. You may not
                  sell, sublicense or rent Software to any third-party. ZOME may
                  assign this Agreement.2. MAINTENANCE. ZOME shall have no
                  obligation to support or maintain Software.3. CONSULTING AND
                  TRAINING. Consulting and training services are not provided
                  under this Agreement.4. PROPRIETARY RIGHTS. You acknowledge
                  that System is a proprietary asset of ZOME.5. ENERGY METERING
                  / AGGREGATOR SERVICES. You acknowledge and agree, by the
                  action of clicking “Submit” to this online contract, to
                  provide access to ZOME of the smart energy meter data for your
                  apartment. Access is needed on a limited basis for when
                  billing reconciliation is required, but on an ongoing basis.
                  You also acknowledge and agree to allow ZOME to act as the
                  sole energy aggregator for energy curtailment services with
                  the energy wholesaler in your region and that You, nor anyone
                  associated with your domicile, are not currently enrolled in
                  any program for Demand Response, curtailment, or smart energy
                  management with another service provider in the domicile
                  represented by the App. Use of the App is tied directly and
                  explicitly to allowing ZOME to act as the sole energy
                  aggregator for your domicile in the energy wholesale
                  electricity grid in your local area. 6. WARRANTIES.ZOME MAKES
                  NO REPRESENTATIONS OR WARRANTIES OF ANY KIND WHATSOEVER AS TO
                  THE PERFORMANCE OR FUNCTIONALITY OF THE SOFTWARE. THE LICENSE
                  OF SAID SOFTWARE HEREUNDER IS STRICTLY ON AN “AS-IS” BASIS.
                  ANY IMPLIED WARRANTIES OF MERCHANTABILITY OR FITNESS FOR A
                  PARTICULAR PURPOSE, TITLE, AND NON-INFRINGEMENT ARE EXPRESSLY
                  DISCLAIMED WHETHER SUCH WARRANTIES ARE EXPRESS, IMPLIED, OR
                  STATUTORY.7. LIMITATION OF LIABILITY.YOU WAIVE AND RELEASE ANY
                  CAUSES OF ACTION, BOTH AT LAW OR IN EQUITY, AND/OR ANY
                  REMEDIES YOU MIGHT CURRENTLY HAVE OR HEREAFTER ACQUIRE AGAINST
                  ZOME, OR ITS RELATED BUSINESSES, SUPPLIERS, AGENTS, OR
                  REPRESENTATIVES ARISING EITHER HEREUNDER OR FROM YOUR PRIOR
                  USE OF THE SOFTWARE. IN NO EVENT, SHALL EITHER PARTY HAVE ANY
                  LIABILITY TO THE OTHER FOR INDIRECT, INCIDENTAL OR
                  CONSEQUENTIAL DAMAGES, INCLUDING, BUT NOT LIMITED TO, LOST
                  PROFITS, OR FOR SPECIAL, EXEMPLARY OR PUNITIVE DAMAGES, AND
                  EACH PARTY COVENANTS NOT TO SEEK SUCH DAMAGES WITH RESPECT TO
                  ANY CLAIMS ARISING OUT OF OR RELATED TO THIS AGREEMENT.8.
                  EXPORT CONTROL. The United States controls the export of
                  products and information. You agree to comply with such
                  restrictions and not to export or re-export the System or any
                  portion thereof to countries or persons prohibited under the
                  export control laws. By downloading the System, you are
                  agreeing that you are not in a country where such export is
                  prohibited and that you are not on the U.S. Commerce
                  Department's Table of Denial Orders or the U.S. Treasury
                  Department's list of Specially Designated Nationals. You are
                  responsible for compliance with the laws of your local
                  jurisdiction regarding the import, export, or re-export of the
                  System.9. USER INFORMATION. The ZOME may use the information
                  it obtains relating to You strictly subject to the privacy
                  specifications set forth in the Privacy Policy set forth
                  below.10. GOVERNING LAW The United Nations Convention on the
                  International Sale of Goods is explicitly excluded from this
                  Agreement.For US Users: This Agreement and any action related
                  thereto or related to the Software shall be governed,
                  controlled, interpreted, and defined by and under the laws in
                  effect in the State of Delaware, without regard to conflicts
                  of law principles. Venue for any action, claim or proceeding
                  pertaining to this Agreement shall be Delaware and you hereby
                  irrevocably and unconditionally consent and submit to the
                  exclusive jurisdiction of such courts for the purpose of such
                  action.For Canadian Users: This Agreement and any action
                  related thereto or related to the Software shall be governed,
                  controlled, interpreted, and defined by and under the laws in
                  effect in Your Province and the federal laws applicable
                  therein without giving effect to any principles of conflict
                  laws. You agree that any action at law or in equity out of or
                  relating to this Agreement or the Software will be filled only
                  in a court located in Your Province, and you hereby
                  irrevocably and unconditionally consent and submit to the
                  exclusive jurisdiction of such courts for the purpose of such
                  action.11. ENTIRE AGREEMENT. This represents the entire
                  agreement and understanding of the parties with respect to the
                  subject matter of this Agreement and supersedes all prior
                  agreements and understandings between the parties, whether
                  oral or written, with respect to this subject matter.
                  Notwithstanding the foregoing, the Terms and Conditions of
                  ZOME’s web site are incorporated herein by reference and are
                  made part of this Agreement. You acknowledge that such Terms
                  and Conditions may be changed at any time without notice by
                  ZOME, and that such changes to the Terms and Conditions shall
                  be binding upon You. ZOME’s Privacy NoticeEFFECTIVE DATE:
                  September 1, 2021This ZOME (a Delaware C-corp) Privacy Notice
                  (the “Notice”) is brought to you by ZOME Energy Networks, Inc.
                  (collectively, “ZOME”, "we", "our" or "us").You are being
                  presented with this Notice because you have agreed to access
                  and use a ZOMEKit Connected Product (“Connected Product”),
                  consisting of two or more master ZOMEKit Gateways and a “kit”
                  of pre-paired smart IoT devices, like connected thermostats,
                  enabling cost savings and remote control of your HVAC system.
                  The Connected Product enables novel energy services that
                  allows you to:•Use your Connected Product with a ZOME Web App
                  (“App”) and cloud service that enables certain features and
                  functions for your Connected Product; and/or•Use your
                  Connected Product with a Third Party product, service, or
                  application in order to enable certain features and functions
                  (all features and functions not provided by ZOME are provided
                  by Third Parties (collectively, “Third
                  Parties”)).Collectively, the features and functions provided
                  by ZOME and the App are referred to in this Notice as the
                  “Services".In this Notice we describe how we collect, use,
                  hold and disclose information that we obtain through your use
                  of the Services and the integration of your Connected Product
                  with the App and/or Third Parties (as applicable). ZOME is not
                  responsible nor does ZOME control the practices of Third
                  Parties. Additional documentation regarding Third Party
                  privacy practices can be found at their respective websites.By
                  using the Services, you agree that your information will be
                  handled as described in this Notice. Your use of our Services,
                  and any dispute over privacy, is subject to this Notice and
                  our Terms of Use, which are incorporated by reference into
                  this Notice and include applicable limitations on damages and
                  the resolution of disputes.What Information Do We Collect
                  About You and Why? We collect information about you directly
                  from you and from third parties, as well as automatically
                  through your use of our Services.Information We Collect
                  Directly From You. When you create an account to use the
                  Services, you must provide us with your name, email address,
                  possibly a unique device ID, and other information that we may
                  request.Information We Collect Automatically. We automatically
                  collect information about your use of our Services, including:
                  your location, Browser type, referring URL, device ID, the
                  mobile platform, SDK version, timestamp, API key (identifier
                  for application), application version, device identifier, iOS
                  Identifier for Advertising, iOS Identifier for Vendors,
                  Android Advertiser ID, IP address, the device model,
                  manufacturer and device O/S, session start/stop time, mobile
                  network code, network status (WiFi, etc.) and other
                  statistical or technical information related to your device or
                  the version of our Services that you are using.App and Third
                  Party Integrations. ; We collect the information described in
                  the “Third Party Integrations” section below. We will not
                  share your information to Third Parties outside of the ZOME
                  system and eco-system without your permission.Cookies. We and
                  our third-party service providers may use cookies and other
                  tracking mechanisms to track information about your use of the
                  Services. Cookies are small text files that the Services may
                  place on your device to store information. We may combine this
                  information with other information we collect about you (and
                  our third-party service providers may do so on our
                  behalf).Clear GIFs, pixel tags and other technologies. Clear
                  GIFs are tiny graphics with a unique identifier, similar in
                  function to cookies. In contrast to cookies, which are stored
                  on your computer’s hard drive, clear GIFs are embedded
                  invisibly. We may use clear GIFs (a.k.a. web beacons, web bugs
                  or pixel tags), in connection with our Services to, among
                  other things, track the activities of visitors, help us manage
                  content, and compile statistics about usage. We and our
                  third-party service providers may also use clear GIFs in HTML
                  e-mails to our customers, to help us track e-mail response
                  rates, identify when our e-mails are viewed, and track whether
                  our e-mails are forwarded.How We Use Your InformationWe use
                  your information, including your personal data, for the
                  following purposes: 1. To operate our Smart Energy management
                  services, including but not limited to providing these
                  capabilities:oTo allow you to register, program, configure,
                  schedule certain ZOME connected devices.oTo deliver our
                  Services to you, to communicate with you about your use of our
                  Services, to respond to your queries or complaints, and for
                  other customer service purposes.oTo inform you of the status
                  of our Services, including but not limited to temporary loss
                  of or degraded performance of the Service or products that you
                  use.2. For this reason, we use your information, including
                  your personal data, for the following purposes:oTo employ
                  algorithms to save energy usage, and thus save money, and to
                  otherwise personalize your experiences while using the
                  Services.oTo better understand how users access and use our
                  Services, both on an aggregated and individualized basis, to
                  improve our Services, respond to user desires and preferences,
                  and for other research and analytical purposes.oTo comply with
                  our legal obligations and assist government and law
                  enforcement agencies or regulators, and to protect our rights
                  and interests as well as the rights and interests of our users
                  and other third parties.How We Share Your InformationWe may
                  share your information, including personal data, as
                  follows:•Affiliates. We will not disclose the information we
                  collect from you, outside of the anonymous inter-workings of
                  our comfort and optimization algorithms, to our affiliates or
                  subsidiaries without your permission. And if we do disclose
                  information collected, your personal data will be subject to
                  this Notice.•Service Providers. We may disclose the
                  information we collect from you to third party vendors,
                  service providers, contractors or agents who perform functions
                  on our behalf, including, without limitation, the information
                  described in the Third Party Integrations section below.
                  •Business Transfers. If we are acquired by or merged with
                  another ZOME, if we transfer some or all of our assets to
                  another ZOME, or as part of an asset sale, a sale of business
                  or a bankruptcy proceeding, we may transfer the information we
                  have collected about you to the new parent company. •In
                  Response to Legal Process. We may disclose the information we
                  collect from you where we are required or authorized by law to
                  do so, and to comply with any judicial proceeding, court
                  order, or other legal process, such as in response to a court
                  order or a subpoena.•To Protect Us and Others. We may disclose
                  the information we collect from you where we believe it is
                  necessary to investigate, prevent, or take action regarding
                  illegal activities, suspected fraud, situations involving
                  potential threats to the safety of any person, or violations
                  of our Terms of Use or this Notice.•Aggregate and
                  De-Identified Information. We may share and disclose
                  aggregate, de-identified or anonymized information about you
                  or derived from your use of the Services with third parties
                  for purposes of helping us review use of our Services and
                  improve our Services and marketing, advertising, research,
                  analytical or similar purposes.•You have consented. We may
                  disclose the information we collect from you where you have
                  expressly consented to the disclosure or the consent may
                  reasonably be inferred from the circumstances.•Third Party
                  Integrations. All information obtained by the Third Party is
                  subject to use by the Third Party’s policies, including their
                  privacy notice. ZOME is not responsible nor does ZOME control
                  the practices of any Third Party.International TransfersThe
                  Services is only intended for use in the United States. Use
                  outside of the United States is prohibited. We store personal
                  data in the United States. If you provide us information, it
                  will be transferred to, processed, and accessed in the United
                  States. This Notice shall apply even if we transfer personal
                  data from non-United States countries to other countries. You
                  acknowledge and agree that it is necessary for us to transfer
                  your personal data to the United States in order for us to
                  provide you our Services.SecurityWe have implemented measures
                  designed to protect the information we collect from damage,
                  misuse, interference, loss, alteration, destruction,
                  unauthorized or accidental use, modification, disclosure,
                  access or processing, and other unlawful forms of processing
                  data. However, please be aware no data security measures can
                  guarantee 100% security. While we monitor and maintain the
                  security of the Services, we do not guarantee that the
                  Services or any products or services is impervious to attack
                  or that any use of the Services or any products or services
                  will be uninterrupted or secure. In addition, information that
                  you transmit over the Internet, including through email or SMS
                  message, is not secured by us and is inherently vulnerable to
                  attack or interception.Storage of Personal DataWe store your
                  information in electronic and physical formats. Your data
                  remains stored by us in the Services. After you delete your
                  Services account, we may continue to use and store your
                  information in accordance with our record retention policies
                  and this Notice. ; As a general matter, we do not retain
                  personal data for longer than is required or appropriate for
                  the purposes for which it was collected, unless a longer or
                  shorter period is necessary for our legal obligations, or
                  customs of the industry, or to defend a legal claim, or to
                  comply with legal, accounting, regulatory or reporting
                  requirements, and consistent with applicable law.Access To
                  Personal DataYou may modify personal data that you have
                  submitted by logging into the Services, navigating to My
                  Account, and updating your profile information. Please note
                  that copies of information that you have updated, modified or
                  deleted may remain viewable in cached and archived pages
                  within the Services for a period of time, and we may maintain
                  copies of such information in our business records. We will
                  take reasonable steps to ensure that the personal data we hold
                  about you remains accurate, up to date and complete.What
                  Choices Do I Have Regarding Use of My Personal Data?We
                  currently have no plans but could conceivably in the future
                  may send periodic promotional emails and other communications
                  to you with offers and announcements we think may interest
                  you. You may opt-out of promotional emails by following the
                  opt-out instructions contained in the email. Further, you may
                  opt-out of promotional communications by sending an e-mail to
                  programs@zomepower.com. If you opt-out of receiving
                  promotional communications from us, we may still send you
                  communications about your account or any products or services
                  you have requested or receive from us. Children Under 13Our
                  Services are not designed for children under 13. If we
                  discover that a child under 13 has provided us with personal
                  data, we will delete such information from our systems.Contact
                  UsIf you have any questions about the privacy aspects of our
                  Services or any complaints about the way in which we have
                  handled any privacy issue please contact us at:
                  programs@zomepower.com. We will consider your complaint and
                  determine whether it requires further investigation. We aim to
                  resolve all complaints promptly.Do Not Track
                  DisclosureCurrently, our systems do not recognize browser
                  “do-not-track” requests. You may disable certain tracking
                  (e.g., by disabling cookies). To learn more about do-not-track
                  signals, please see https://allaboutdnt.com/.Changes to this
                  NoticeThis Notice is current as of the Effective Date set
                  forth above. We may change this Notice from time to time, so
                  please be sure to check back periodically. We will post any
                  changes to this Notice within the Services. You can obtain a
                  copy of our current Notice by contacting us. If we make any
                  changes to this Notice that materially affect our practices
                  with regard to the personal data we have previously collected
                  from you, we will endeavor to provide you with notice by
                  highlighting the change in the Services or by emailing your
                  email address of record.
                </p>
              </div>
              <div className="approval-condition">
                <input
                  type="checkbox"
                  checked={agreeCondition}
                  onChange={() => {
                    setagreeCondition(!agreeCondition);
                    if (!agreeCondition) {
                      setSignupButton('next-button-style');
                    } else {
                      setSignupButton('next-button-style-disabled');
                    }
                  }}
                />
                <span>I agree to the terms of service</span>
              </div>
              <div className="mt-4 m-pb-1">
                <div className="same-button-style space-x-5">
                  <Link href="/">
                    <button className="prives-button-style">Previous</button>
                  </Link>

                  <button
                    className={`${signupButton}`}
                    onClick={(e) => registerUser(e)}
                  >
                    <span className="mr-3"> Submit</span>
                    {loading && loading === true ? (
                      <Spin indicator={antIcon} />
                    ) : null}
                  </button>
                </div>
              </div>
              {/* <div className="submit-button-center">
                  <Link href="/">
                    <button>Submit</button>
                  </Link>
                </div> */}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
export default Signupterm;
