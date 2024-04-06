import { View } from "react-native";
import { Text } from "react-native-elements";
// import { SliderBox } from "react-native-image-slider-box";
import { ImageSlider } from "react-native-image-slider-banner";


const BannerSlider = ({
    onPressBack,
    headerStyles = {},
    headingText = {},
    imagesList = [],
    ...props
}) => {
    let banners = [];
    imagesList.forEach(element => {
        banners.push({img:element.image});
        // banners.push(element.image);
    });

    function slideClick(index) {
        console.warn(`images ${index} pressed`)
    }

    return (
        <View style={{backgroundColor:""}}>
            <ImageSlider
                data={banners}
                autoPlay={true}
                timer={3000}
                //showHeader={true}
                //onItemChanged={(item) => console.log("item", item)}
                caroselImageStyle={{height:235}}
                //closeIconColor="#fff"
            />
            {/* <SliderBox
                images={banners}
                sliderBoxHeight={200}
                onCurrentImagePressed={index => slideClick(index)}
                dotColor="#FFEE58"
                inactiveDotColor="#90A4AE"
                paginationBoxVerticalPadding={20}
                autoplay
                circleLoop
                resizeMethod={'resize'}
                resizeMode={'cover'}
                ImageComponentStyle={{borderRadius: 15, width: '97%', marginTop: 5}}
                imageLoadingColor="#2196F3"
            /> */}
        </View>
    );
}

export default BannerSlider;