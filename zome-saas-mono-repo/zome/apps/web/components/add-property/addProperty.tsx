import React, { useEffect, useState } from 'react';

import { message, Modal } from 'antd';
import Link from 'next/link';
import { Radio } from 'antd';
import { ApiGet, ApiPost } from 'apps/web/services/helpers/API/ApiData';
import './addproperty.module.less';

import PlacesAutocomplete, {
  geocodeByAddress, geocodeByPlaceId,
  getLatLng,
} from 'react-places-autocomplete';



export function addProperty(props) {
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(true);
  const [propertyName, setPropertyName] = useState('');
  const [meterId, setMeterId] = useState('');
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [address, setAddress] = useState('');
  const [zipcode, setZipcode] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [country, setCountry] = useState('');
  const [profileError, setprofileError] = useState(false);
  const [responsedata, setresponsedata] = useState({});
  const [error, setError] = useState(false);
  const [zipcodeError, setZipcodeError] = useState(false);
  const [cityStateCountry, showCityStateCountry] = useState(false);
  const [placeLatLong,setPlaceLatLong] = useState({lat: "", lng: ""});
  const [invalidZipcodeError,setInvalidZipcodeError] = useState(false);
 
 

  const initialCityState = { city: "", state: "" };

  const mapApiKey = "AIzaSyBht8VXDhG7fl4JFB5RiTMMFHbUJOMZIlw";

  //const mapApiKey = "AIzaSyDQ8Er9ZffS1TGcRCcCn8A9sJkENuxK0vk";


  const handleSelect = async (value) => {

    const results = await geocodeByAddress(value);
    const ll = await getLatLng(results[0]);
    setAddress(value);
    setLatitude(ll.lat)
    setLongitude(ll.lng)
  }

  useEffect(() => {
    const getPropertyDetails = async (id) => {
      await ApiGet(`property/${id}`)
        .then((res: any) => {
          if (res.data.status) {
            setPropertyName(res.data.data.name);
            setMeterId(res.data.data.meter_id);
            setLatitude(res.data.data.latitude);
            setLongitude(res.data.data.longitude);
            setAddress(res.data.data.address);
            setZipcode(res.data.data.zipcode);
            setCity(res.data.data.city);
            setState(res.data.data.state);
            setCountry(res.data.data.country);
          }
        })
        .catch((err) => {
          console.log('error in get data!!');
        });
    };
    //console.log(modal);
    // need to get dynamic id which will be pass throgh argument
    if (props.id) {
      getPropertyDetails(props.id);

    }
  }, [zipcode]);

  const handleAddProperty = async (e) => {
    //  console.log("propertyName, meterId, latitude, longitude, address, zipcode, city, state, country, profileError,::",propertyName, meterId, latitude, longitude, address, zipcode, city, state, country, profileError)      
    e.preventDefault();
    setprofileError(true);

    setLatitude(latitude)
    setLongitude(longitude)
    if (propertyName == "") {
      setprofileError(true);
      setTimeout(() => {
        setprofileError(false);
      }, 5000);
      return
    }
    if (meterId == "") {
      setprofileError(true);
      setTimeout(() => {
        setprofileError(false);
      }, 5000);
      return
    }
    if (meterId.length < 17 || meterId.length > 22) {
      setError(true);
      setTimeout(() => {
        setError(false);
      }, 5000);
      return
    }
    if (latitude == "") {

      setprofileError(true);
      setTimeout(() => {
        setprofileError(false);
      }, 5000);
      return
    }
    if (longitude == "") {
      setprofileError(true);
      setTimeout(() => {
        setprofileError(false);
      }, 5000);
      return
    }
    if (address == "") {
      setprofileError(true);
      setTimeout(() => {
        setprofileError(false);
      }, 5000);
      return
    }

    if (city == "") {
      setprofileError(true);
      setTimeout(() => {
        setprofileError(false);
      }, 5000);
      return
    }
    if (state == "") {
      setTimeout(() => {
        setprofileError(true);
      }, 1000);
      return false;
    }
    if (country == "") {
      setprofileError(true);
      setTimeout(() => {
        setprofileError(false);
      }, 5000);
      return
    }
    if (zipcode == "") {
      setprofileError(true);
      setTimeout(() => {
        setprofileError(false);
      }, 5000);
      return;
    }
    let postData = {
      "name": propertyName,
      "meter_id": meterId,
      "latitude": latitude,
      "longitude": longitude,
      "address": address,
      "city": city,
      "state": state,
      "country": country,
      "pincode": zipcode,
    }
   // console.log("postData::::", postData)
   // console.info('object');
    setLoading(true);
    await ApiPost('property', postData)
      .then(async (res: any) => {
        if (res.data.status == true) {
          setprofileError(true)
          props.visible(false);
          props.addPropertySuccess();
          message.success("New property added successfully");
        } else {
         // console.log(res.data.message,"else------")
          setprofileError(res.data.msg)
          setprofileError(res.data.message)
        }

      })
      .catch((err) => {
       // console.log(err);
      });

  }


  const fetchCityState = async () => {

    if(zipcode!= ""){
      showCityStateCountry(true);
    }

    if (zipcode == "") {
      message.error("please enter a zipcode");
    } else {

    
      try {
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?address=${zipcode}&key=${mapApiKey}`,
          { headers: { accept: "application/json" } }
        );
        const responsedata = await response.json();

        if (!response.ok) {
          throw new Error(`Error! status: ${response.status}`);
        }
        setresponsedata(responsedata);
        setInvalidZipcodeError(false);
        var city = '';
        var state = '';
        var country = '';
        var cityShort = '';
        var stateShort = '';
        var countryShort = '';


        if (responsedata.results.length) {
          var arrComponents = responsedata.results[0].address_components;
          var locations = responsedata.results[0].geometry.location;
          setPlaceLatLong(locations);
          arrComponents.forEach(component => {
            var type = component.types[0];
            if (city == "" && (type == "sublocality_level_1" || type == "locality" || type == "administrative_area_level_2")) {
              city = component.long_name.trim();
              cityShort = component.short_name.trim();
           //   console.log(city, "city..")
              setCity(city);
            }

            if (state == "" && type == "administrative_area_level_1") {
              state = component.long_name.trim();
              stateShort = component.short_name.trim();
            //  console.log(state, "state..");
              setState(state);
            }

            if (country == "" && type == "country") {
              country = component.long_name.trim();
              countryShort = component.short_name.trim();
              setCountry(country);
            //  console.log(country, "country..");
            }             
            if (city != "" && state != "" && country != "") {
              //we're done
              return;
            }
          })
        }

        return {
          city: {
            long: city,
            short: cityShort
          },
          state: {
            long: state,
            short: stateShort
          },
          country: {
            long: country,
            short: countryShort
          },
          formatted_address: responsedata.results[0].formatted_address,
          location: responsedata.results[0].geometry.location
        }


      } catch (e) {
      //  console.log(e);
       setTimeout(() => {
          setInvalidZipcodeError(true);
        }, 2000);
        setInvalidZipcodeError(false);
        return
      }
    };

  }

  const searchOptions = {
  // location: new google.maps.LatLng(placeLatLong.lat,placeLatLong.lng),
    radius: 20000,
    types: ['address']
  }

  return (
    <>
      <Modal
        title={
          <>
            <div className="flex justify-start">Add Property</div>
          </>
        }
        centered
        visible={visible}
        footer={null}
        // onOk={() => setVisible(false)}
        onCancel={
          () => props.visible(false)
          //  setShowExludeData(false),
          //  setShowTemprature(false),
          //  setTemp(0),
          //  setSelectedRowKeys1(null)
        }
        width={'100%'}
        className="fullScreenModal"
      >
        <div className="">
          <section className="login-banner bg-white">
            <div className="">
              <div className="lg:flex md:flex  align-content">
                {/* <div className="lg:w-4/6 md:w-1/2 m-pl-2 flex justify-center items-center banner-full-height ">
                  <div className="login-banner-img ">
                    <LoginImage className="login-banner-img" />
                  </div>
                </div> */}
                <div className="lg:w-2/6 md:w-1/2 pl-8 pr-8 m-pl-2 m-login-banner">
                  <div className="left">
                    <form className="form" onSubmit={(e) => handleAddProperty(e)}>

                      <label>Property Name</label>
                      <input
                        type="text"
                        className="form-control block "
                        placeholder="Property Name"
                        value={propertyName}
                        onChange={(e) => setPropertyName(e.target.value)}
                        required
                      />
                      <h6 className="text-red-600">{profileError && propertyName == "" ? <span className="text-red-600">Property Name can not be blank!</span> : ""}</h6>
                      <div>
                      <label>Meter No (ESID)</label>

                      <input
                        type="number"
                        className="form-control block "
                        placeholder="Meter No"
               
                        value={meterId}
                        onChange={(e) => setMeterId(e.target.value)}
                        required
                      />
                      <h6 className="text-red-600">{profileError && meterId == "" ? <span className="text-red-600">meter no can not be blank!</span> : ""}</h6>
                      {
                        error && meterId.length < 17 ?
                          <label style={{ color: "red" }}>Meter No should be atleast 17 digits.</label>
                          : error && meterId.length > 22 ?
                            <label style={{ color: "red" }}>Meter No should be less then 22 digits. </label>
                            : null 
                     }
                        </div>
                      <label>Zipcode</label>
                      <input
                        type="text"
                        className="form-control block "
                        placeholder="Zipcode"
                        value={zipcode}
                        onChange={(e) => setZipcode(e.target.value)}
                        required
                        onBlur={fetchCityState}
                      />
                      <h6 className="text-red-600">{profileError && zipcode == "" ? <span className="text-red-600">zipcode can not be blank!</span> : ""}</h6>
                      <h6 className="text-red-600">{invalidZipcodeError ? <span className="text-red-600">Please enter a valid zipcode!</span> : ""}</h6>

                      {cityStateCountry  && (
                        <div>

                          <label>Country</label>
                          <input
                          readOnly
                            type="text"
                            className="form-control block "
                            placeholder="Country"
                            value={country}
                            onChange={(e) => setCountry(e.target.value)}
                            required
                          />

                          <h6 className="text-red-600">{profileError && country == "" ? <span className="text-red-600"> Country can not be blank!</span> : ""}</h6>

                          <label>State</label>
                          <input
                          readOnly
                            type="text"
                            className="form-control block "
                            placeholder="State"
                            value={state}
                            onChange={(e) => setState(e.target.value)}
                            required
                          />


                          <h6 className="text-red-600">{profileError && state == "" ? <span className="text-red-600">State can not be blank!</span> : ""}</h6>

                          <label>City</label>
                          <input
                            type="text"
                            className="form-control block "
                            placeholder="City"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            required
                          />
                          <h6 className="text-red-600">{profileError && city == "" ? <span className="text-red-600">city can not be blank!</span> : ""}</h6>

                        </div>
                      )}
                      <label>Address</label>

                      <PlacesAutocomplete
                       // searchOptions={searchOptions}     
                        value={address}
                        onChange={setAddress}
                        onSelect={handleSelect}
                      >
                        {({ getInputProps, suggestions, getSuggestionItemProps, loading }) => (
                          <div>
                            <input
                              {...getInputProps({
                                placeholder: 'Address',
                                className: "form-control block ",
                              })} 
                              
                              />
                            <div className="autocomplete-dropdown-container">
                              {loading && <div>Loading...</div>}
                              {suggestions.map(suggestion => {
                                const className = suggestion.active
                                  ? 'suggestion-item--active'
                                  : 'suggestion-item';
                                // inline style for demonstration purpose
                                const style = suggestion.active
                                  ? { backgroundColor: '#fafafa', cursor: 'pointer' }
                                  : { backgroundColor: '#ffffff', cursor: 'pointer' };
                                return (
                                  <div
                                    {...getSuggestionItemProps(suggestion, {
                                      className,
                                      style,
                                    })}
                                  >
                                    <span>{suggestion.description}</span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </PlacesAutocomplete>
                      <h6 className="text-red-600">{profileError && address == "" ? <span className="text-red-600">Address can not be blank!</span> : ""}</h6>
            
                      <label>Latitude</label>
                      <input
                        readOnly
                        type="text"
                        className="form-control block "
                        placeholder="Latitude"
                        value={latitude}
                        onChange={(e) => (e.target.value)}
                        required
                      />

                      <h6 className="text-red-600">{profileError && latitude == "" ? <span className="text-red-600">latitude can not be blank!</span> : ""}</h6>

                      <label>Longitude</label>
                      <input
                        readOnly
                        type="text"
                        className="form-control block "
                        placeholder="Longitude"
                        value={longitude}
                        onChange={(e) => (e.target.value)}
                        required
                      />

                      <h6 className="text-red-600">{profileError && longitude == "" ? <span className="text-red-600"> longitude can not be blank!</span> : ""}</h6>
                      <div className="new-account-text-rigth">
                        {/* <Link href="/">Have an account? Sign in now</Link> */}
                      </div>
                      <div className="pt-5 m-pb-1">
                        <div className="same-button-style flex justify-center">
                          {/* <h6 className="text-red-600">{profileError && profileError}</h6> */}
                          {/* <Link href="/"> */}
                          <button
                            className="login-btn-style white-text-color block cursor-pointer text-center"
                            type="submit"
                            onClick={(e) => handleAddProperty(e)}
                          >
                            <span className="mr-3">Add Property</span>
                          </button>
                          {/* </Link> */}
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </Modal>
    </>
  );
}

export default addProperty;
