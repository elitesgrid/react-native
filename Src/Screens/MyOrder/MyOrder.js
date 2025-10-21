import React, { useEffect, useState } from 'react';
import { Text, View, Image, ScrollView,TouchableOpacity,Alert } from 'react-native';

import HeaderComp from '../../Components/HeaderComp';
import HomeService from "../../Services/apis/HomeService";
import imagePaths from '../../Constants/imagePaths';
import CustomHelper from '../../Constants/CustomHelper';
import LoadingComp from '../../Components/LoadingComp';


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
      <View style={{ flex: 1 }}>
        {isLoading ? (
          <LoadingComp />
        ) : (
          <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
            {courseList.map((item, index) => (
              <TouchableOpacity
                onPress={() => onItemClick(item.id)}
                key={index}
                activeOpacity={0.9}
                style={{
                  marginHorizontal: 20,
                  marginTop: 20,
                  backgroundColor: "#FFFFFF",
                  borderRadius: 20,
                  overflow: "hidden",
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 6,
                  elevation: 4,
                }}
              >
                <View style={{ position: "relative" }}>
                  <Image
                    source={fixImageUrl(item.cover_image)}
                    resizeMode={"stretch"}
                    style={{ height: 160, width: "100%" }}
                  />
                  <View
                    style={{
                      position: "absolute",
                      top: 10,
                      left: 10,
                      backgroundColor: "#29D697",
                      paddingVertical: 4,
                      paddingHorizontal: 10,
                      borderRadius: 8,
                    }}
                  >
                    <Text style={{ color: "white", fontSize: 12, fontWeight: "600" }}>
                      Active
                    </Text>
                  </View>
                </View>
                <View style={{ padding: 15 }}>
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: "700",
                      color: "#05030D",
                      marginBottom: 6,
                    }}
                  >
                    {item.title}
                  </Text>
                  <View>
                    <Text style={{ fontSize: 14, color: "#555" }}>
                      {"Added Date: " + CustomHelper.tsToDate(item.valid_from, "d M Y")}
                    </Text>
                    <Text style={{ fontSize: 14, color: "#E53935", marginTop: 2 }}>
                      {"Expire Date: " + CustomHelper.tsToDate(item.valid_to, "d M Y")}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>
    </View>
  );
};