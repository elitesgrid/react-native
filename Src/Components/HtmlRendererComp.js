//import liraries
import React, { useMemo } from 'react';
import { useWindowDimensions, useColorScheme } from 'react-native';
import RenderHTML from 'react-native-render-html';
import Colors from '../Constants/Colors';

const HtmlRendererComp = ({ html = '' }) => {
  const { width: windowWidth } = useWindowDimensions();
  const colorScheme = useColorScheme();
  const isNightMode = colorScheme === 'dark';

  const htmlTagsStyles = useMemo(() => {
    const baseStyle = {
      whiteSpace: 'normal',
      color: isNightMode ? Colors.WHITE : Colors.DARK,
      fontSize: 15,
      lineHeight: 22,
    };
    return {
      body: baseStyle,
      p: baseStyle,
      span: baseStyle,
      li: baseStyle,
    };
  }, [isNightMode]);

  // ✅ Convert <sup> and <sub> to Unicode equivalents
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

  const processedHtml = useMemo(() => replaceHtmlMath(html), [html]);

  return (
    <RenderHTML
      contentWidth={windowWidth}
      source={{ html: processedHtml }}
      tagsStyles={htmlTagsStyles}
    />
  );
};

export default HtmlRendererComp;
