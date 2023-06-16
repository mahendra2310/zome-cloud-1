import { Select } from 'antd';
import React, { useState } from 'react';


export interface AntdSelectProps { }

export function AntdSelect(props: any) {
  const [property,setSelectedProperty] = useState('');
  // const { handleClick } = props
  const handleClick = props.handleClick;
  const { children, selectedProperty } = props;
  const { Option } = Select;

  const handleChange = (value: string) => {
    setSelectedProperty(value);
  };

  return (
    <>
      <Select
        showSearch
        // mode="tags"
        style={{ width: '100%' }}
        placeholder="select one property"
        onChange={handleChange}
        optionLabelProp="label"
      >
        {children?.map(i => {
          return (
            <Option value={i.name} key={i._id}>{i.name}</Option>
          );
        })}
      </Select>
        
      <button
        className="addUserbtn white-text-color block cursor-pointer text-center mt-5 "
         onClick={(event) => handleClick(event,property)}
      >
       show users
      </button>
    </>
  )
}

export default AntdSelect;
