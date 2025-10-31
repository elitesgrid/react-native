//import liraries
import React, { useMemo, memo } from 'react';
import { useWindowDimensions, useColorScheme, LogBox } from 'react-native';
import RenderHTML from 'react-native-render-html';
import Colors from '../Constants/Colors';

const HtmlRendererComp = ({ html = '', key1 = '' }) => {
  const { width: windowWidth } = useWindowDimensions();
  const colorScheme = useColorScheme();
  const isNightMode = colorScheme === 'dark';

  // if(key1 === 'passage'){
  //   console.log("HTML",html);
  // }
  const htmlTagsStyles = useMemo(() => {
    const baseStyle = {
      whiteSpace: 'normal',
      color: Colors.BLACK,
      fontSize: 15,
      lineHeight: 22,
    };
    return {
      body: baseStyle,
      p: baseStyle,
      span: baseStyle,
      li: baseStyle,
      table: baseStyle,
    };
  }, [isNightMode]);

  const replaceHtmlMath = (rawHtml) => {
    if (!rawHtml) return '';
    return rawHtml
      .replace(/<sup>(.*?)<\/sup>/g, (_, p1) =>
        p1
          .split('')
          .map((ch) => ({
            '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴',
            '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹',
          }[ch] || ch))
          .join('')
      )
      .replace(/<sub>(.*?)<\/sub>/g, (_, p1) =>
        p1
          .split('')
          .map((ch) => ({
            '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄',
            '5': '₅', '6': '₆', '7': '₇', '8': '₈', '9': '₉',
          }[ch] || ch))
          .join('')
      );
  };

  LogBox.ignoreLogs([
    'Support for defaultProps will be removed from function components',
  ]);

  const processedHtml = useMemo(() => replaceHtmlMath(html), [html]);

  return (
    <RenderHTML
      contentWidth={windowWidth}
      source={{ html: html.trim() }}
      tagsStyles={htmlTagsStyles}
    />
  );
};

export default memo(HtmlRendererComp);
