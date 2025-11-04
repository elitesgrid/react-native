import React, { useState } from 'react';
import { View, Image, Dimensions, TouchableOpacity } from 'react-native';
import Carousel from 'react-native-reanimated-carousel';
import ImageViewing from 'react-native-image-viewing';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'; // Using existing icon set
import Colors from '../../../Constants/Colors';

const BannerSlider = ({ imagesList = [] }) => {
  const width = Dimensions.get('window').width;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visible, setVisible] = useState(false);

  const imageUrls = imagesList.map(item => ({ uri: item.image }));
  const bannerHeight = width > 1000 ? 400 : width > 600 ? 300 : width > 400 ? 230 : width * 0.45;

  return (
    <View style={{ alignItems: 'center', marginVertical: 3 }}>
      <Carousel
        width={width}
        height={bannerHeight}
        data={imagesList}
        loop
        autoPlay
        autoPlayInterval={4000}
        scrollAnimationDuration={800}
        onSnapToItem={index => setCurrentIndex(index)}
        renderItem={({ item, index }) => (
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => {
              setCurrentIndex(index);
              setVisible(true);
            }}>
            <Image
              source={{ uri: item.image }}
              style={{
                width: '100%',
                height: 235,
                borderRadius: 12,
              }}
              resizeMode="cover"
            />
          </TouchableOpacity>
        )}
      />

      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          marginTop: 10,
        }}>
        {imagesList.map((_, index) => (
          <View
            key={index}
            style={{
              height: 8,
              width: currentIndex === index ? 18 : 8,
              borderRadius: 4,
              backgroundColor: currentIndex === index ? '#0274BA' : '#C0C0C0',
              marginHorizontal: 4,
            }}
          />
        ))}
      </View>

      <ImageViewing
        images={imageUrls}
        imageIndex={currentIndex}
        visible={visible}
        onRequestClose={() => setVisible(false)}
        swipeToCloseEnabled={true}
        doubleTapToZoomEnabled={true}
        HeaderComponent={() => (
          <TouchableOpacity
            style={{
              position: 'absolute',
              top: 50,
              right: 20,
              zIndex: 10,
              backgroundColor: 'rgba(0,0,0,0.5)',
              borderRadius: 20,
              padding: 8,
            }}
            onPress={() => setVisible(false)}>
            <Icon name="close" size={22} color={Colors.WHITE} style={{}} />
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

export default BannerSlider;
