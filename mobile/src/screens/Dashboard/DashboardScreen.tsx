import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import { RootState } from '../../store';

const DashboardScreen = () => {
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium">Welcome back,</Text>
      <Text variant="titleLarge" style={styles.name}>
        {user?.firstName} {user?.lastName}
      </Text>
      <Text variant="bodyMedium" style={styles.role}>
        Role: {user?.role}
      </Text>
      
      <Button mode="outlined" onPress={handleLogout} style={styles.logoutButton}>
        Logout
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  name: {
    fontWeight: 'bold',
    marginTop: 10,
  },
  role: {
    marginTop: 5,
    opacity: 0.7,
  },
  logoutButton: {
    marginTop: 30,
  },
});

export default DashboardScreen;
