import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import Select from "react-select";

import React, { useRef, useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { db } from "../firebase";
import TextField from '@material-ui/core/TextField';
import shieldcheck from "../images/fi-rr-shield-check.svg";

import firebase from "firebase"

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box p={3}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.any.isRequired,
  value: PropTypes.any.isRequired,
};

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.paper,
  },
  container: {
    display: 'flex',
    flexWrap: 'wrap',

  },
  textField: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    width: 200,
  },
}));

export default function SimpleTabs() {
  const user = useSelector((state) => state.service.user);

  const classes = useStyles();
  const [value, setValue] = React.useState(0);
  const [disabled, setDisabled] = useState(true);
  const [resfullname, setFullname] = useState([]);
  const [resemail, setEmail] = useState([]);
  const [resemailverified, setEmailverified] = useState(null);

  const [selected, setSelected] = React.useState("");

  const [resprovince_val, setProvince_Val] = useState([]);
  const [district, setDistrict] = useState(null);
  const [subdistrict, setSubdistrict] = useState(null);
 
  const [resprovinceid, setProvinceId] = useState([]);
  const [resdataprovince, setDataProvince] = useState([]);
  const [resdatadistrict, setDataDistrict] = useState([]);
  const [resdatasubdistrict, setDataSubDistrict] = useState([]);
  const [resdatazipcode, setDataZipcode] = useState([]);

  // set value for default selection
  const [selectedValue, setSelectedValue] = useState(3);


  const [country, setCountry] = useState(null);

  useEffect(() => {
    if (user) {
      const userInformation = db
        .collection("drive")
        .doc(user.uid)
        .onSnapshot((doc) => {
          setFullname(doc.data().name);
          setEmail(doc.data().email);
          setEmailverified(user.emailVerified);
        });
      return () => {
        userInformation();
      };
    }

  }, [user]);

  useEffect(() => {
    fetch('https://api.github.com/users/hacktivist123/repos')// test api
      // const response = await fetch("https://swapi.co/api/people");
      .then(response => response.json())
    // .then(data => console.log(data));
  }, []);

  useEffect(() => {
    var Province = firebase.functions().httpsCallable('getProvince');
    Province({})
      .then((result) => {
        setDataProvince(result.data);
        console.log("result_Province", result);
      });
  }, []);

  const results_prov = [];
    for (let i=0; i<5; i++ ) {
      let obj = resdataprovince[i];
      // console.log("obj",obj);
      results_prov.push(obj);
    }

  // console.log("results_prov",results_prov);

   // handle onChange event of the dropdown
   const handleChange = e => {
    setSelectedValue(e.value);
  }
  // ------------- Distric -------

  const handleProvinceChange = (Eobj) => {
    setProvince_Val(Eobj);
    console.log("Eobj.PROVINCE_ID:", Eobj.PROVINCE_ID);
    setProvinceId(Eobj.PROVINCE_ID);
    setDistrict(null);

    var District = firebase.functions().httpsCallable('getDistrict');
    District({PROVINCE_ID: Eobj.PROVINCE_ID})
      .then((result) => {
        setDataDistrict(result.data);
        console.log("result_District", result.data);
      });

  };

  //---- For District ----//  
  const handleDistrictChange = (Eobj) => {
    // setDistrict(Edobj);
    console.log("Edobj.DISTRICT_ID", Eobj.DISTRICT_ID);

    var SubDistrict = firebase.functions().httpsCallable('getSubDistrict');
    SubDistrict({DISTRICT_ID: Eobj.DISTRICT_ID})
      .then((result) => {
        setDataSubDistrict(result.data);
        console.log("result_SubDistrict", result.data);
      });
  };

  //---- For SubDistrict ----//
  const handle_subdistrictChange = (Eobj) => {
    console.log("Edobj.SUB_DISTRICT_ID", Eobj.SUB_DISTRICT_ID);

    var Zipcode = firebase.functions().httpsCallable('getZipcode');
    var SDI_String = Eobj.SUB_DISTRICT_ID.toString();  //Convert to String
    Zipcode({SUB_DISTRICT_ID: SDI_String})             //check with Function
      .then((result) => {                             //if true
        setDataZipcode(result.data[0].ZIPCODE);
        console.log("result_Zipcode", result.data[0].ZIPCODE);
      });
  }

  // console.log("resdatazipcode",resdatazipcode);

  const handle_ = (E) => {
      //Zipcode
  } 


  let type = null;
  let options = null;

  if (type) {
    options = type.map((el) => <option key={el}>{el}</option>);
  }


  return (
    <div className="box_content">

      <div className="appbar" position="">
        <Tabs value={value} onChange={handleChange} aria-label="simple tabs example">
          <Tab label="ข้อมูลทั่วไป" {...a11yProps(0)} />
          <Tab label="ตั้งค่า" {...a11yProps(1)} />
          <Tab label="กระเป๋าตัง" {...a11yProps(2)} />
          {/* <Tab label="Item Three" {...a11yProps(3)} /> */}

        </Tabs>
      </div>

      <TabPanel value={value} index={0} className="input_inner_1">
        <div class="inputWithIcon_bg">
          <input
            type="text"
            name="username"
            placeholder="Username"
            value={resfullname}
            disabled={disabled}
          />
          <i class="fa fa-user fa-lg fa-fw" aria-hidden="true"></i>
        </div>
        <div class="inputWithIcon_bg">
          <input
            type="text"
            name="firstname"
            placeholder="Firstname"
            // value={resfullname}
            disabled={disabled}
          />
          <i class="fa fa-envelope fa-lg fa-fw" aria-hidden="true"></i>
        </div>
        <div class="inputWithIcon_bg">
          <input
            type="text"
            name="lastname"
            placeholder="Lastname"
            // value={resfullname}
            disabled={disabled}
          />
          <i class="fa fa-envelope fa-lg fa-fw" aria-hidden="true"></i>
        </div>
        <div class="inputWithIcon_bg">
          <input
            type="text"
            name="email"
            placeholder="Email"
            value={resemail}
            disabled={disabled}
          />
          <i class="fa fa-envelope fa-lg fa-fw" aria-hidden="true"></i>
          {resemailverified ? <i className="keep_icon"><img src={shieldcheck} /></i> : ""}
        </div>
        {/* ///////////////////////////////////// */}
        <div class="input_address_cards_1">
          {/* <div class="inputUnicon_bg"> (type="date"  Diff Scale type="text") */}
          <input
            className="date_field"
            id="date"
            label="Birthday"
            type="date"
            name="birthday"
            data-date-format="DD/MM/YYYY"
            placeholder="Birthday"
            defaultValue=""
            disabled={disabled}
            // className={classes.textField}
            InputLabelProps={{
              shrink: true,
            }}
          />
          {/* </div> */}
          <div class="input_address_card2">
            <div class="inputWithIcon_bg">
              <input
                type="text"
                name="telephone"
                placeholder="Telephone"
                // value={resfullname}
                disabled={disabled}
              />
              <i class="fa fa-phone fa-lg fa-fw" aria-hidden="true"></i>
            </div>
          </div>

        </div>
        {/* </div> */}
        {/* ///////////////////////////////////// */}
        <div class="inputWithIcon_bg">
          <input
            type="text"
            name="address1"
            placeholder="Address1"
            // value={resfullname}
            disabled={disabled}
          />
          <i class="fa fa-home fa-lg fa-fw" aria-hidden="true"></i>
        </div>
        <div class="inputWithIcon_bg">
          <input
            type="text"
            name="address2"
            placeholder="Address2"
            // value={resfullname}
            disabled={disabled}
          />
          <i class="fa fa-home fa-lg fa-fw" aria-hidden="true"></i>
        </div>

        {/* ================================================= */}
        <div class="input_address_cards_2">
          <Select
            name="province"
            placeholder="Province"
            options={results_prov}  //province data
            onChange={handleProvinceChange}
            // value={resprovince_val}
            getOptionLabel={x => x.PROVINCE_NAME}
            getOptionValue={x => x.PROVINCE_ID}
          />
          
          <Select
            name="district"
            placeholder="District/Area"
            options={resdatadistrict}
            onChange={handleDistrictChange}
            // value={district}
            getOptionLabel={x => x.DISTRICT_NAME}
            getOptionValue={x => x.DISTRICT_ID}
          />
        </div>


        <div class="input_address_cards_2">

          <Select
            // className="inputUnicon_bg"
            name="sub-district"
            placeholder="Sub-district"
            options={resdatasubdistrict}
            onChange={handle_subdistrictChange}
            // value={district}
            getOptionLabel={x => x.SUB_DISTRICT_NAME}
            getOptionValue={x => x.SUB_DISTRICT_ID}
          />

          <div class="input_address_card4">
            <div class="inputUnicon_bg">
              <input
                type="text"
                name="postal-code"
                placeholder="Postal Code"
                value={resdatazipcode}
                // disabled={disabled}
              />
            </div>
          </div>
        </div>

        <button class="btn button_icon"><i class="fa fa-download fa-lg fa-fw"></i>แก้ไข</button>
        {/* =========================================== */}
      </TabPanel>

      <TabPanel value={value} index={1}>
        <div className="input_inner_2">
          <br /><br /><br /><br /><br /><br /><br />
          ยังไม่พร้อมใช้งาน
        </div>
      </TabPanel>
      <TabPanel value={value} index={2}>
        <div className="input_inner_2">
          <br /><br /><br /><br /><br /><br /><br />
          ยังไม่พร้อมใช้งาน
        </div>
      </TabPanel>
    </div>
  );
}