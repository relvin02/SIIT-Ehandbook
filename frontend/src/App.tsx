import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Provider as ReduxProvider, useSelector, useDispatch } from 'react-redux';
import { ActivityIndicator, View, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';

// Screens
import HomeScreen from './screens/HomeScreen';
import HandbookScreen from './screens/HandbookScreen';
import SearchScreen from './screens/SearchScreen';
import BookmarksScreen from './screens/BookmarksScreen';
import ProfileScreen from './screens/ProfileScreen';
import LoginScreen from './screens/LoginScreen';
import SectionDetailScreen from './screens/SectionDetailScreen';
import AdminDashboardScreen from './screens/AdminDashboardScreen';
import EditSectionScreen from './screens/EditSectionScreen';
import AnnouncementsScreen from './screens/AnnouncementsScreen';
import ManageUsersScreen from './screens/ManageUsersScreen';
import SIITHymnScreen from './screens/SIITHymnScreen';
import ManageMediaScreen from './screens/ManageMediaScreen';
import ChatScreen from './screens/ChatScreen';
import StudentLocationsScreen from './screens/StudentLocationsScreen';
import OrgChartScreen from './screens/OrgChartScreen';
import GalleryScreen from './screens/GalleryScreen';
import EmergencyAlertScreen from './screens/EmergencyAlertScreen';
import SchoolCalendarScreen from './screens/SchoolCalendarScreen';
import FeedbackScreen from './screens/FeedbackScreen';
import FeedbackManagementScreen from './screens/FeedbackManagementScreen';

// Store
import store from './store';
import { authActions } from './store';

// Theme
import { ThemeProvider, useTheme } from './config/ThemeContext';

// Services
import { authService } from './services/apiClient';
import locationService from './services/locationService';
import { startBackgroundLocation, stopBackgroundLocation } from './services/backgroundLocation';
import { registerForPushNotificationsAsync } from './services/notificationsService';
import { getSocket, disconnectSocket } from './services/socketService';

// Set up notification handler (foreground notifications)
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// Create Android notification channel at startup (before any notification arrives)
if (Platform.OS === 'android') {
  Notifications.setNotificationChannelAsync('default', {
    name: 'Default',
    importance: Notifications.AndroidImportance.MAX,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#004BA8',
    sound: 'default',
  });
}

// Navigation
const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

/**
 * Bottom Navigation Tabs for Students
 */
const StudentTabs = () => {
  const { theme } = useTheme();
  return (
    <Tab.Navigator
      screenOptions={({ route }: { route: any }) => ({
        tabBarIcon: ({ focused, color, size }: { focused: boolean; color: string; size: number }) => {
          let iconName: any = 'home';

          if (route.name === 'HomeTab') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'HandbookTab') {
            iconName = focused ? 'book-open' : 'book-open-outline';
          } else if (route.name === 'SearchTab') {
            iconName = focused ? 'magnify' : 'magnify';
          } else if (route.name === 'BookmarksTab') {
            iconName = focused ? 'bookmark' : 'bookmark-outline';
          } else if (route.name === 'ProfileTab') {
            iconName = focused ? 'account' : 'account-outline';
          } else if (route.name === 'ChatTab') {
            iconName = focused ? 'chat' : 'chat-outline';
          }

          return (
            <MaterialCommunityIcons name={iconName} size={size} color={color} />
          );
        },
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.textMuted,
        tabBarStyle: { backgroundColor: theme.tabBar, borderTopColor: theme.tabBarBorder },
        headerShown: true,
        headerStyle: {
          backgroundColor: theme.headerBg,
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      })}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{ title: 'Home', headerShown: false }}
      />
      <Tab.Screen
        name="HandbookTab"
        component={HandbookScreen}
        options={{ title: 'Handbook', headerShown: false }}
      />
      <Tab.Screen
        name="SearchTab"
        component={SearchScreen}
        options={{ title: 'Search' }}
      />
      <Tab.Screen
        name="BookmarksTab"
        component={BookmarksScreen}
        options={{ title: 'Bookmarks' }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{ title: 'Profile' }}
      />
      <Tab.Screen
        name="ChatTab"
        component={ChatScreen}
        options={{ title: 'Assistant' }}
      />
    </Tab.Navigator>
  );
};

/**
 * Faculty/Staff Navigation Tabs (same as student but no location tracking)
 */
const FacultyTabs = () => {
  const { theme } = useTheme();
  return (
    <Tab.Navigator
      screenOptions={({ route }: { route: any }) => ({
        tabBarIcon: ({ focused, color, size }: { focused: boolean; color: string; size: number }) => {
          let iconName: any = 'home';

          if (route.name === 'HomeTab') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'HandbookTab') {
            iconName = focused ? 'book-open' : 'book-open-outline';
          } else if (route.name === 'SearchTab') {
            iconName = focused ? 'magnify' : 'magnify';
          } else if (route.name === 'BookmarksTab') {
            iconName = focused ? 'bookmark' : 'bookmark-outline';
          } else if (route.name === 'ProfileTab') {
            iconName = focused ? 'account' : 'account-outline';
          }

          return (
            <MaterialCommunityIcons name={iconName} size={size} color={color} />
          );
        },
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.textMuted,
        tabBarStyle: { backgroundColor: theme.tabBar, borderTopColor: theme.tabBarBorder },
        headerShown: true,
        headerStyle: {
          backgroundColor: theme.headerBg,
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      })}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{ title: 'Home', headerShown: false }}
      />
      <Tab.Screen
        name="HandbookTab"
        component={HandbookScreen}
        options={{ title: 'Handbook', headerShown: false }}
      />
      <Tab.Screen
        name="SearchTab"
        component={SearchScreen}
        options={{ title: 'Search' }}
      />
      <Tab.Screen
        name="BookmarksTab"
        component={BookmarksScreen}
        options={{ title: 'Bookmarks' }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{ title: 'Profile' }}
      />
    </Tab.Navigator>
  );
};

/**
 * Admin Navigation Tabs
 */
const AdminTabs = () => {
  const { theme } = useTheme();
  return (
    <Tab.Navigator
      screenOptions={({ route }: { route: any }) => ({
        tabBarIcon: ({ focused, color, size }: { focused: boolean; color: string; size: number }) => {
          let iconName: any = 'view-dashboard';

          if (route.name === 'AdminDashboard') {
            iconName = focused ? 'view-dashboard' : 'view-dashboard-outline';
          } else if (route.name === 'AdminHandbook') {
            iconName = focused ? 'pencil' : 'pencil-outline';
          } else if (route.name === 'AdminUsers') {
            iconName = focused ? 'account-group' : 'account-group-outline';
          } else if (route.name === 'AdminLocations') {
            iconName = focused ? 'map' : 'map-outline';
          } else if (route.name === 'AdminProfile') {
            iconName = focused ? 'account' : 'account-outline';
          }

          return (
            <MaterialCommunityIcons name={iconName} size={size} color={color} />
          );
        },
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.textMuted,
        tabBarStyle: { backgroundColor: theme.tabBar, borderTopColor: theme.tabBarBorder },
        headerShown: true,
        headerStyle: {
          backgroundColor: theme.headerBg,
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      })}
    >
      <Tab.Screen
        name="AdminDashboard"
        component={AdminDashboardScreen}
        options={{ title: 'Dashboard' }}
      />
      <Tab.Screen
        name="AdminHandbook"
        component={EditSectionScreen}
        options={{ title: 'Content' }}
      />
      <Tab.Screen
        name="AdminUsers"
        component={ManageUsersScreen}
        options={{ title: 'Students' }}
      />
      <Tab.Screen
        name="AdminLocations"
        component={StudentLocationsScreen}
        options={{ title: 'Locations' }}
      />
      <Tab.Screen
        name="AdminProfile"
        component={ProfileScreen}
        options={{ title: 'Profile' }}
      />
    </Tab.Navigator>
  );
};

/**
 * Main App Component - Inner (uses Redux)
 */
function AppInner() {
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();
  const { isAuthenticated, role } = useSelector((state: any) => state.auth);

  useEffect(() => {
    bootstrapAsync();
  }, []);

  const bootstrapAsync = async () => {
    try {
      const authToken = await AsyncStorage.getItem('authToken');
      const userRole = await AsyncStorage.getItem('userRole');

      if (authToken) {
        dispatch(authActions.setToken(authToken));
        try {
          const userData = await authService.getMe();
          dispatch(authActions.setUser(userData));
          const userRole = userData.role === 'admin' ? 'admin' : userData.role === 'faculty' ? 'faculty' : 'student';
          dispatch(authActions.setRole(userRole));

          // Re-register push token on app launch (ensures fresh token after reinstall/update)
          try {
            await registerForPushNotificationsAsync(userData.id || userData._id, authToken);
          } catch (notifErr) {
            console.warn('Push notification re-registration failed:', notifErr);
          }

          // Connect to Socket.IO for real-time updates
          getSocket();

          // Start location tracking for students only
          if (userData.role === 'student') {
            locationService.startLocationTracking(authToken);
            startBackgroundLocation();
          } else {
            stopBackgroundLocation();
          }
        } catch {
          dispatch(authActions.setUser({ email: '', id: '', name: '' }));
          dispatch(authActions.setRole((userRole as 'admin' | 'student' | 'faculty') || 'student'));
        }
      }
    } catch (error) {
      console.error('Failed to restore token:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#004BA8" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        {!isAuthenticated ? (
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{}}
          />
        ) : role === 'admin' ? (
          <Stack.Group>
            <Stack.Screen
              name="AdminRoot"
              component={AdminTabs}
              options={{}}
            />
            <Stack.Screen
              name="SIITHymn"
              component={SIITHymnScreen}
              options={{
                title: 'SIIT Hymn',
                headerShown: true,
                headerStyle: { backgroundColor: '#1B5E20' },
                headerTintColor: '#fff',
                headerTitleStyle: { fontWeight: 'bold' },
              }}
            />
            <Stack.Screen
              name="ManageMedia"
              component={ManageMediaScreen}
              options={{
                title: 'Media Management',
                headerShown: true,
                headerStyle: { backgroundColor: '#004BA8' },
                headerTintColor: '#fff',
                headerTitleStyle: { fontWeight: 'bold' },
              }}
            />
            <Stack.Screen
              name="OrgChart"
              component={OrgChartScreen}
              options={{
                title: 'Organizational Chart',
                headerShown: true,
                headerStyle: { backgroundColor: '#004BA8' },
                headerTintColor: '#fff',
                headerTitleStyle: { fontWeight: 'bold' },
              }}
            />
            <Stack.Screen
              name="Gallery"
              component={GalleryScreen}
              options={{
                title: 'Photo Gallery',
                headerShown: true,
                headerStyle: { backgroundColor: '#004BA8' },
                headerTintColor: '#fff',
                headerTitleStyle: { fontWeight: 'bold' },
              }}
            />
            <Stack.Screen
              name="EmergencyAlerts"
              component={EmergencyAlertScreen}
              options={{
                title: 'Emergency Alerts',
                headerShown: true,
                headerStyle: { backgroundColor: '#D32F2F' },
                headerTintColor: '#fff',
                headerTitleStyle: { fontWeight: 'bold' },
              }}
            />
            <Stack.Screen
              name="SchoolCalendar"
              component={SchoolCalendarScreen}
              options={{
                title: 'School Calendar',
                headerShown: true,
                headerStyle: { backgroundColor: '#004BA8' },
                headerTintColor: '#fff',
                headerTitleStyle: { fontWeight: 'bold' },
              }}
            />
            <Stack.Screen
              name="FeedbackManagement"
              component={FeedbackManagementScreen}
              options={{
                title: 'Student Feedback',
                headerShown: true,
                headerStyle: { backgroundColor: '#004BA8' },
                headerTintColor: '#fff',
                headerTitleStyle: { fontWeight: 'bold' },
              }}
            />
          </Stack.Group>
        ) : role === 'faculty' ? (
          <Stack.Group>
            <Stack.Screen
              name="FacultyRoot"
              component={FacultyTabs}
              options={{}}
            />
            <Stack.Screen
              name="SectionDetail"
              component={SectionDetailScreen}
              options={{
                title: 'Section',
                headerShown: true,
                headerStyle: { backgroundColor: '#004BA8' },
                headerTintColor: '#fff',
                headerTitleStyle: { fontWeight: 'bold' },
              }}
            />
            <Stack.Screen
              name="SIITHymn"
              component={SIITHymnScreen}
              options={{
                title: 'SIIT Hymn',
                headerShown: true,
                headerStyle: { backgroundColor: '#1B5E20' },
                headerTintColor: '#fff',
                headerTitleStyle: { fontWeight: 'bold' },
              }}
            />
            <Stack.Screen
              name="OrgChart"
              component={OrgChartScreen}
              options={{
                title: 'Organizational Chart',
                headerShown: true,
                headerStyle: { backgroundColor: '#004BA8' },
                headerTintColor: '#fff',
                headerTitleStyle: { fontWeight: 'bold' },
              }}
            />
            <Stack.Screen
              name="Gallery"
              component={GalleryScreen}
              options={{
                title: 'Photo Gallery',
                headerShown: true,
                headerStyle: { backgroundColor: '#004BA8' },
                headerTintColor: '#fff',
                headerTitleStyle: { fontWeight: 'bold' },
              }}
            />
            <Stack.Screen
              name="SchoolCalendar"
              component={SchoolCalendarScreen}
              options={{
                title: 'School Calendar',
                headerShown: true,
                headerStyle: { backgroundColor: '#004BA8' },
                headerTintColor: '#fff',
                headerTitleStyle: { fontWeight: 'bold' },
              }}
            />
            <Stack.Screen
              name="Feedback"
              component={FeedbackScreen}
              options={{
                title: 'Feedback',
                headerShown: true,
                headerStyle: { backgroundColor: '#004BA8' },
                headerTintColor: '#fff',
                headerTitleStyle: { fontWeight: 'bold' },
              }}
            />
          </Stack.Group>
        ) : (
          <Stack.Group>
            <Stack.Screen
              name="StudentRoot"
              component={StudentTabs}
              options={{}}
            />
            <Stack.Screen
              name="SectionDetail"
              component={SectionDetailScreen}
              options={{
                title: 'Section',
                headerShown: true,
                headerStyle: {
                  backgroundColor: '#004BA8',
                },
                headerTintColor: '#fff',
                headerTitleStyle: {
                  fontWeight: 'bold',
                },
              }}
            />
            <Stack.Screen
              name="SIITHymn"
              component={SIITHymnScreen}
              options={{
                title: 'SIIT Hymn',
                headerShown: true,
                headerStyle: { backgroundColor: '#1B5E20' },
                headerTintColor: '#fff',
                headerTitleStyle: { fontWeight: 'bold' },
              }}
            />
            <Stack.Screen
              name="OrgChart"
              component={OrgChartScreen}
              options={{
                title: 'Organizational Chart',
                headerShown: true,
                headerStyle: { backgroundColor: '#004BA8' },
                headerTintColor: '#fff',
                headerTitleStyle: { fontWeight: 'bold' },
              }}
            />
            <Stack.Screen
              name="Gallery"
              component={GalleryScreen}
              options={{
                title: 'Photo Gallery',
                headerShown: true,
                headerStyle: { backgroundColor: '#004BA8' },
                headerTintColor: '#fff',
                headerTitleStyle: { fontWeight: 'bold' },
              }}
            />
            <Stack.Screen
              name="SchoolCalendar"
              component={SchoolCalendarScreen}
              options={{
                title: 'School Calendar',
                headerShown: true,
                headerStyle: { backgroundColor: '#004BA8' },
                headerTintColor: '#fff',
                headerTitleStyle: { fontWeight: 'bold' },
              }}
            />
            <Stack.Screen
              name="Feedback"
              component={FeedbackScreen}
              options={{
                title: 'Feedback',
                headerShown: true,
                headerStyle: { backgroundColor: '#004BA8' },
                headerTintColor: '#fff',
                headerTitleStyle: { fontWeight: 'bold' },
              }}
            />
          </Stack.Group>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

/**
 * Root App Component
 */
export default function App() {
  return (
    <ReduxProvider store={store}>
      <ThemeProvider>
        <AppInner />
      </ThemeProvider>
    </ReduxProvider>
  );
}
