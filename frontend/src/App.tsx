import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Provider as ReduxProvider, useSelector, useDispatch } from 'react-redux';
import { ActivityIndicator, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialCommunityIcons } from '@expo/vector-icons';

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

// Store
import store from './store';
import { authActions } from './store';

// Services
import { authService } from './services/apiClient';

// Navigation
const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

/**
 * Bottom Navigation Tabs for Students
 */
const StudentTabs = () => {
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
        tabBarActiveTintColor: '#004BA8',
        tabBarInactiveTintColor: '#888',
        headerShown: true,
        headerStyle: {
          backgroundColor: '#004BA8',
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
        options={{ title: 'Home' }}
      />
      <Tab.Screen
        name="HandbookTab"
        component={HandbookScreen}
        options={{ title: 'Handbook' }}
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
          } else if (route.name === 'AdminProfile') {
            iconName = focused ? 'account' : 'account-outline';
          }

          return (
            <MaterialCommunityIcons name={iconName} size={size} color={color} />
          );
        },
        tabBarActiveTintColor: '#004BA8',
        tabBarInactiveTintColor: '#888',
        headerShown: true,
        headerStyle: {
          backgroundColor: '#004BA8',
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
          dispatch(authActions.setRole(userData.role === 'admin' ? 'admin' : 'student'));
        } catch {
          dispatch(authActions.setUser({ email: '', id: '', name: '' }));
          dispatch(authActions.setRole((userRole as 'admin' | 'student') || 'student'));
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
          <Stack.Screen
            name="AdminRoot"
            component={AdminTabs}
            options={{}}
          />
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
      <AppInner />
    </ReduxProvider>
  );
}
