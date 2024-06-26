import React, { useEffect, useState } from 'react';
import { Text, View, Image, ScrollView,TouchableOpacity,Alert } from 'react-native';

import HeaderComp from '../../Components/HeaderComp';
import Styles from '../../Assets/Style/LoginStyle';
import HomeService from "../../Services/apis/HomeService";
import imagePaths from '../../Constants/imagePaths';
import CustomHelper from '../../Constants/CustomHelper';


export const MyOrder = (props) => {
  const { navigation } = props;
  const [isLoading, setIsLoading] = useState(true);
  const [courseList, setCourseList] = useState([]);

  const onItemClick = function(item_id){
    Alert.alert('Message!', "All the information regarding added/expiry Mentioned Over Card itself. For view content for this please visit 'My Portal' from bottom bar.");
  }

  const getMyOrder = async function () {
    return await HomeService.get_my_courses({})
      .then(async (data) => {
        setIsLoading(false);
        if (data.status === true) {
          data = data.data;
          setCourseList(data);
          console.log((data));
        }
        return true;
      })
      .catch((error) => {
        Alert.alert('Error!', error.message);
        return false;
      });
  };

  function fixImageUrl(url) {
    return url === "" ? imagePaths.LOGIN_WITH_TITLE : { uri: url };
  }

  useEffect(function () {
    async function fetchData() {
      // You can await here       
      const response = await getMyOrder();
      console.log(response);
    }
    fetchData();
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: "#F9F9F9" }}>
      <HeaderComp headerTitle={"My Order"} />
      <View>
        <ScrollView>
          {courseList.map((item, index) => {
            return (<TouchableOpacity onPress={()=>onItemClick(item.id)} key={index} style={{ marginHorizontal: 20, height: 260, backgroundColor: "#FFFFFF", borderRadius: 30, width: "90%", marginTop: 20, paddingBottom: 15, borderColor: "#FFFFFF", borderWidth: 1 }}>
              <View>
                <View>
                  <Image source={fixImageUrl(item.cover_image)} resizeMode='stretch' style={{ height: 170, width: "100%", position: "relative" }} />
                </View>
                <Text style={{ position: "absolute", backgroundColor: "#29D697", padding: 7, color: "white", borderBottomRightRadius: 12, borderTopLeftRadius: 12 }}>{"Active"}</Text>
              </View>
              <View style={{ marginHorizontal: 10 }}>
                <Text style={{ fontSize: 18, fontWeight: "600", color: "#05030D", marginVertical: 10 }}>{item.title}</Text>
                <View style={{ }}>
                  <Text>{"Added Date: " + CustomHelper.tsToDate(item.valid_from, "d M Y")}</Text>
                  <Text style={{ color: "red" }}>{"Expire Date: " + CustomHelper.tsToDate(item.valid_to, "d M Y")}</Text>
                </View>
              </View>
            </TouchableOpacity>)
          })}
        </ScrollView>
      </View>
    </View>
  );
};