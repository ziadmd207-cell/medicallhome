import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import 'react-native-reanimated';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';

import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  anchor: '(tabs)',
};

function TopSpacer() {
  const insets = useSafeAreaInsets();
  // هناخد نسبة صغيرة جداً من المساحة عشان نضمن إنها مش "كبيرة" زي ما طلبت
  // 0.6 تعني 60% من المساحة الطبيعية لتكون المسافة قليلة جداً واحترافية
  return <View style={{ height: insets.top * 1.2, backgroundColor: '#fff' }} />;
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <SafeAreaProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <View style={{ flex: 1, backgroundColor: '#fff' }}>
          <TopSpacer />

          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="select-role" />
            <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal', headerShown: true }} />
          </Stack>
        </View>
        <StatusBar style="dark" />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
