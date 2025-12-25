import React from 'react';
import { View, StyleSheet } from 'react-native';
import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { Text, Divider, Avatar } from 'react-native-paper';
import useAuthStore from '../store/authStore';
import { lightTheme } from '../styles/theme';

export default function CustomDrawerContent(props) {
  const { user } = useAuthStore();

  return (
    <DrawerContentScrollView {...props}>
      {/* Drawer Items */}
      <DrawerItemList {...props} />

      {/* User Info Footer */}
      <View style={styles.userInfoSection}>
        <Divider style={styles.divider} />
        <View style={styles.userInfoContent}>
          <Avatar.Icon
            size={60}
            icon="account"
            style={styles.avatar}
            color="#fff"
          />
          {user?.name && (
            <View style={styles.userDetails}>
              <Text variant="titleLarge" style={styles.userName}>
                {user.name}
              </Text>
              <Text variant="bodyMedium" style={styles.userRole}>
                Administrator
              </Text>
              {user?.phone && (
                <Text variant="bodySmall" style={styles.userPhone}>
                  {user.phone}
                </Text>
              )}
            </View>
          )}
        </View>
      </View>
    </DrawerContentScrollView>
  );
}

const styles = StyleSheet.create({
  userInfoSection: {
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: lightTheme.colors.primaryContainer,
  },
  userInfoContent: {
    alignItems: 'center',
  },
  avatar: {
    backgroundColor: lightTheme.colors.primary,
    marginBottom: 12,
  },
  userDetails: {
    alignItems: 'center',
  },
  userName: {
    fontWeight: 'bold',
    color: '#292524',
    marginBottom: 4,
  },
  userRole: {
    color: '#57534e',
    marginBottom: 2,
  },
  userPhone: {
    color: '#78716c',
    fontSize: 12,
  },
  divider: {
    marginBottom: 12,
  },
});

