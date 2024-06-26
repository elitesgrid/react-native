import React, { useEffect, useState,useRef,useMemo,useCallback } from 'react';
import { Text, View, Image,TouchableOpacity,ActivityIndicator ,Alert,TextInput} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { Dropdown } from 'react-native-element-dropdown';

import imagePaths from '../../Constants/imagePaths';
import Colors from '../../Constants/Colors';
import navigationStrings from '../../Constants/navigationStrings';
import HeaderComp from '../../Components/HeaderComp';
import HomeService from '../../Services/apis/HomeService';
import { S3Upload } from '../../Services/S3Upload';
import FeedService from '../../Services/apis/FeedService';

export const CreateFeed = (props) => {
  const { navigation } = props;

  const [isLoading, setIsLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [courseList, setCourseList] = useState([]);
  const [courseId, setCourseId] = useState(0);
  const [imageUri1, setImageUri1] = useState(null);
  const [imageUri2, setImageUri2] = useState(null);

  const chooseImage = (whichUri) => {
    launchImageLibrary({ mediaType: 'photo' }, response => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
        whichUri==="1"?setImageUri1(null):"";
        whichUri==="2"?setImageUri2(null):"";
      } else if (response.error) {
        console.log('ImagePicker Error: ', response.error);
      } else if (response.customButton) {
        console.log('User tapped custom button: ', response.customButton);
      } else {
        const source = { uri: response.assets[0].uri };
        whichUri==="1"?setImageUri1(source):"";
        whichUri==="2"?setImageUri2(source):"";
      }
    });
  };

  const submitPost = async ()=>{
      if(query.length < 10){
        Alert.alert("Error","Please type atleast 10 character in query input.");
        return;
      }
      setIsLoading(true);
      let payload = {
        text:query,
        course_id:courseId,
        post_type:1
      };
      if(imageUri1!==null){
        let respose = await S3Upload(imageUri1,"/ios","feed_1");
        if(respose.Location){
          payload.meta_url = respose.Location;
        }
      }
      if(imageUri2!==null){
        let respose = await S3Upload(imageUri1,"/ios","feed_2");
        if(respose.Location){
          payload.meta_url_1 = respose.Location;
        }
      }

      FeedService.post_feed(payload)
      .then(async (data) => {
        setIsLoading(false);
        if (data.status === true) {
          setImageUri1(null);
          setImageUri2(null);
          setQuery("");
          setCourseId(0);
          Alert.alert("Server Says",data.message);
        }else{
          Alert.alert("Server Says",data.message);
        }
        return true;
      })
      .catch((error) => {
        Alert.alert('Error!', error.message);
        return false;
      });
  }

  const getMyOrder = async function () {
    return await HomeService.get_my_courses({})
      .then(async (data) => {
        setIsLoading(false);
        //console.log(data);
        if (data.status === true) {
          data = data.data;
          let dropdownData = [];
          data.forEach(element => {
            if(element.is_doubt_avail === "1"){
              dropdownData.push({label:element.title,value:element.id});
            }
          });
          setCourseList(dropdownData);
        }
        return true;
      })
      .catch((error) => {
        Alert.alert('Error!', error.message);
        return false;
      });
  };

  async function fetchData() {
    // You can await here
    const response = await getMyOrder();
    console.log(response);
  }


  useEffect(function () {
    fetchData();
  }, [navigation]);

  return (
    <View style={{ flex: 1}}>
      <HeaderComp headerTitle='Create New Post'></HeaderComp>
      <View style={{margin:10,flex:0.93}}>
      <Dropdown
          style={{ marginTop: 3,borderWidth:1,borderColor:Colors.IDLE,paddingHorizontal:5,marginVertical:3,borderRadius:5 }}
          placeholderStyle={{ fontSize: 16 }}
          selectedTextStyle={{ fontSize: 16 }}
          inputSearchStyle={{ height: 40, fontSize: 16 }}
          iconStyle={{ width: 20, height: 20, marginTop: 10, marginRight: 10 }}
          data={courseList}
          //search
          maxHeight={300}
          labelField="label"
          valueField="value"
          placeholder={'Select item'}
          //searchPlaceholder="Search..."
          value={courseId}
          onChange={item => {
            setCourseId(item.value);
          }}
        />
        <View>
          <Text style={{color:Colors.TAG_COLOR}}>{"Write your doubt/query, Community Members will help you soon."}</Text>
          <TextInput
            style={{borderWidth:1,borderColor:Colors.IDLE,borderRadius:5,marginVertical:10,padding:10,height:120}}
            value={query}
            placeholder={'Enter your query'}
            onChangeText={(text) => setQuery(text)}
            autoCapitalize={'none'}
            multiline={true}
            textAlignVertical='top'
          >
          </TextInput>
        </View>
        <View>
          {imageUri1 && (
            <View>
              <TouchableOpacity onPress={()=>{setImageUri1(null)}} style={{position:"absolute",zIndex:1}}>
                <Text style={{color:Colors.WHITE,backgroundColor:"red",paddingHorizontal:5,fontSize:20}}>{"x"}</Text>
              </TouchableOpacity>
              <Image source={imageUri1} style={{ width: 100, height: 100 }} />
            </View>
          )}
          {
            imageUri1 === null && <TouchableOpacity onPress={()=>{chooseImage("1")}} style={{backgroundColor:Colors.IDLE,padding:30,borderRadius:5,marginVertical:10}}>
              <Text style={{color:Colors.WHITE,alignSelf:"center",fontSize:18}}>{"Choose Image"}</Text>
            </TouchableOpacity>
          }
        </View>
        <View style={{marginVertical:10}}>
          {imageUri2 && (
            <View>
              <TouchableOpacity onPress={()=>{setImageUri2(null)}} style={{position:"absolute",zIndex:1}}>
                <Text style={{color:Colors.WHITE,backgroundColor:"red",paddingHorizontal:5,fontSize:20}}>{"x"}</Text>
              </TouchableOpacity>
              <Image source={imageUri2} style={{ width: 100, height: 100 }} />
            </View>
          )}
          {
            imageUri2 === null && <TouchableOpacity onPress={()=>{chooseImage("2")}} style={{backgroundColor:Colors.IDLE,padding:30,borderRadius:5,marginVertical:10}}>
              <Text style={{color:Colors.WHITE,alignSelf:"center",fontSize:18}}>{"Choose Image"}</Text>
            </TouchableOpacity>
          }
        </View>
      </View>
      <View style={{flex:0.07}}>
          <TouchableOpacity onPress={()=>submitPost()} style={{backgroundColor:Colors.THEME,padding:10,height:"100%"}}>
            <Text style={{alignSelf:"center",color:Colors.WHITE,fontSize:18,fontWeight:"500"}}>{"Submit Post"}</Text>
          </TouchableOpacity>
      </View>
      {isLoading && (
        <View style={{backgroundColor: 'rgba(0, 0, 0, 0.5)',justifyContent: 'center',alignItems: 'center',position:"absolute",height:"100%",width:"100%"}}>
          <ActivityIndicator size="large" color="#fff" />
        </View>
      )}
    </View>
  );
};