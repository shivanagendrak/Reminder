import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Modal,
  Alert,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons, SimpleLineIcons, Feather, EvilIcons } from '@expo/vector-icons';
import { useNavigation } from 'expo-router';
import { Picker } from '@react-native-picker/picker';
import { useFonts, Figtree_400Regular } from '@expo-google-fonts/figtree';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import * as Notifications from 'expo-notifications';

const WaterScreen: React.FC = () => {
  const navigation = useNavigation();
  const [fontsLoaded] = useFonts({ Figtree: Figtree_400Regular });

  // Time picker states
  const [openPicker, setOpenPicker] = useState<'start' | 'end' | null>(null);
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date());
  // Set everyTime to a default value. Now supporting "1 minute", "10 minutes", "30 minutes", "1 hour", "2 hours"
  const [everyTime, setEveryTime] = useState('10 minutes');
  const [showModal, setShowModal] = useState(false);
  const [showEveryModal, setShowEveryModal] = useState(false);

  // Request notification permissions on mount
  useEffect(() => {
    const requestPermissions = async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        alert('You need to enable notifications for this app to work properly.');
      } else {
        console.log('Notification permissions granted!');
      }
    };
    requestPermissions();
  }, []);

  // Listen for notification responses (e.g., snooze action)
  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        if (response.actionIdentifier === 'snooze') {
          handleSnooze();
        }
      }
    );
    return () => subscription.remove();
  }, []);

  // Handle time picker changes
  const onChangeTime = (
    event: any,
    selectedDate: Date | undefined,
    setTime: (date: Date) => void
  ) => {
    if (selectedDate) {
      setTime(selectedDate);
    }
  };

  // Format time for display (12-hour format)
  const formatCustomTime = (time: Date) => {
    const hours = time.getHours() % 12 || 12;
    const minutes = time.getMinutes().toString().padStart(2, '0');
    const period = time.getHours() >= 12 ? 'PM' : 'AM';
    return { timeString: `${hours} : ${minutes}`, period };
  };

  // Reschedule a notification for 5 minutes later (snooze)
  const handleSnooze = async () => {
    const snoozeTime = new Date(Date.now() + 5 * 60 * 1000);
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Snoozed: Time to Drink Water! 💧',
        body: 'Stay hydrated and drink a glass of water.',
        sound: true,
        data: { type: 'water-reminder' },
      },
      trigger: snoozeTime,
    });
    console.log('Notification snoozed for 5 minutes.');
  };

  // Schedule notifications from startTime to endTime every given interval
  const startNotifications = async () => {
    // Clear any existing notifications
    await Notifications.cancelAllScheduledNotificationsAsync();

    const now = new Date();
    // If the chosen startTime is in the past, use "now" as the first trigger
    const scheduledStartTime = startTime > now ? startTime : now;
    if (endTime <= now) {
      Alert.alert('Invalid End Time', 'End time must be in the future.');
      return;
    }

    // Convert "everyTime" string into milliseconds; now supports "10 minutes"
    const interval =
      everyTime === '1 minute'
        ? 1 * 60 * 1000
        : everyTime === '10 minutes'
        ? 10 * 60 * 1000
        : everyTime === '30 minutes'
        ? 30 * 60 * 1000
        : everyTime === '1 hour'
        ? 60 * 60 * 1000
        : everyTime === '2 hours'
        ? 2 * 60 * 60 * 1000
        : 1 * 60 * 1000;

    let currentTime = new Date(scheduledStartTime);
    const endTimeDate = new Date(endTime);
    let count = 0;

    while (currentTime <= endTimeDate) {
      count += 1;
      if (count > 63) {
        console.warn('iOS supports a maximum of 64 scheduled notifications. Stopping early.');
        break;
      }
      try {
        const id = await Notifications.scheduleNotificationAsync({
          content: {
            title: 'Time to Drink Water! 💧',
            body: 'Stay hydrated and drink a glass of water.',
            sound: true,
            data: { type: 'water-reminder' },
          },
          // Using a Date object as the trigger schedules a one-off notification at that time.
          trigger: currentTime,
        });
        console.log(`Scheduled notification #${count} for:`, currentTime, 'ID:', id);
      } catch (error) {
        console.error('Error scheduling notification:', error);
      }
      currentTime = new Date(currentTime.getTime() + interval);
    }

    Alert.alert(
      'Notifications Scheduled',
      `Scheduled ${count} notifications from ${formatCustomTime(scheduledStartTime).timeString}${formatCustomTime(scheduledStartTime).period} to ${formatCustomTime(endTimeDate).timeString}${formatCustomTime(endTimeDate).period}, every ${everyTime}.`
    );
    console.log(`Total notifications scheduled: ${count}`);
  };

  const handleDone = () => {
    setShowModal(false);
    setOpenPicker(null);
  };

  const handleEveryDone = () => {
    setShowEveryModal(false);
  };

  if (!fontsLoaded) return null;

  return (
    <SafeAreaView style={styles.safeContainer}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={wp(7)} color="#4a90e2" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={async () => {
            await Notifications.cancelAllScheduledNotificationsAsync();
            Alert.alert(
              'Notifications Canceled',
              'All scheduled water reminders have been canceled.'
            );
          }}
        >
          <EvilIcons name="trash" size={wp(8)} color="red" />
        </TouchableOpacity>
      </View>

      {/* Title */}
      <View style={styles.watercontainer}>
        <Ionicons name="water-outline" size={wp(15)} style={styles.waterIcon} color="#4a90e2" />
        <Text style={styles.title}>Water</Text>
      </View>

      {/* Time Selection */}
      <View style={styles.container}>
        {/* Start Time */}
        <View style={styles.timeBox}>
          <View style={styles.iconWithLabel}>
            <SimpleLineIcons name="clock" size={wp(7)} color="#4a90e2" />
            <Text style={styles.label}>Start</Text>
          </View>
          <TouchableOpacity
            style={styles.timeTextContainer}
            onPress={() => {
              setOpenPicker('start');
              setShowModal(true);
            }}
          >
            <Text style={styles.timeValue}>{formatCustomTime(startTime).timeString}</Text>
            <Text style={styles.timeSuffix}>{formatCustomTime(startTime).period}</Text>
          </TouchableOpacity>
        </View>

        {/* End Time */}
        <View style={styles.timeBox}>
          <View style={styles.iconWithLabel}>
            <SimpleLineIcons name="clock" size={wp(7)} color="#4a90e2" />
            <Text style={styles.label}>End</Text>
          </View>
          <TouchableOpacity
            style={styles.timeTextContainer}
            onPress={() => {
              setOpenPicker('end');
              setShowModal(true);
            }}
          >
            <Text style={styles.timeValue}>{formatCustomTime(endTime).timeString}</Text>
            <Text style={styles.timeSuffix}>{formatCustomTime(endTime).period}</Text>
          </TouchableOpacity>
        </View>

        {/* Interval Picker */}
        <View style={styles.timeBox1}>
          <View style={styles.iconWithLabel}>
            <Ionicons name="alarm-outline" size={wp(7)} color="orange" />
            <Text style={styles.label}>Every</Text>
          </View>
          <TouchableOpacity
            style={styles.timeTextContainer}
            onPress={() => setShowEveryModal(true)}
          >
            <Text style={styles.timeValue}>{everyTime}</Text>
          </TouchableOpacity>
        </View>

        {/* Modal for Time Picker */}
        <Modal
          visible={showModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowModal(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              {openPicker === 'start' && (
                <DateTimePicker
                  value={startTime}
                  mode="time"
                  display="spinner"
                  onChange={(event, date) => onChangeTime(event, date, setStartTime)}
                />
              )}
              {openPicker === 'end' && (
                <DateTimePicker
                  value={endTime}
                  mode="time"
                  display="spinner"
                  onChange={(event, date) => onChangeTime(event, date, setEndTime)}
                />
              )}
              <TouchableOpacity style={styles.doneButton} onPress={handleDone}>
                <Text style={styles.doneButtonText}>Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Modal for Interval Picker */}
        <Modal
          visible={showEveryModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowEveryModal(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Picker
                selectedValue={everyTime}
                onValueChange={(itemValue) => setEveryTime(itemValue)}
                style={styles.picker}
                dropdownIconColor="#000"
                mode="dropdown"
              >
                <Picker.Item label="1 minute" value="1 minute" />
                <Picker.Item label="10 minutes" value="10 minutes" />
                <Picker.Item label="30 minutes" value="30 minutes" />
                <Picker.Item label="1 hour" value="1 hour" />
                <Picker.Item label="2 hours" value="2 hours" />
              </Picker>
              <TouchableOpacity style={styles.doneButton} onPress={handleEveryDone}>
                <Text style={styles.doneButtonText}>Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Add Notification Button */}
        <TouchableOpacity style={styles.addButton} onPress={startNotifications}>
          <Text style={styles.addButtonText}>Add</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeContainer: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: wp(6),
    marginBottom: hp(1),
    padding: wp(5),
  },
  watercontainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: hp(3),
  },
  waterIcon: { marginRight: wp(2) },
  title: {
    fontSize: wp(13),
    fontFamily: 'Figtree',
    fontWeight: '400',
    textAlign: 'center',
  },
  container: { flex: 5, padding: wp(5) },
  timeBox: {
    marginTop: hp(1.5),
    paddingHorizontal: wp(5),
    marginHorizontal: wp(4),
    borderWidth: wp(0.4),
    borderColor: '#ddd',
    borderRadius: wp(10),
    paddingVertical: hp(1.3),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeBox1: {
    marginTop: hp(5),
    paddingHorizontal: wp(5),
    marginHorizontal: wp(4),
    borderWidth: wp(0.4),
    borderColor: '#ddd',
    borderRadius: wp(10),
    paddingVertical: hp(1.2),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: hp(8),
  },
  iconWithLabel: { flexDirection: 'row', alignItems: 'center' },
  label: { fontSize: wp(4.5), color: '#333', marginLeft: wp(2.5), fontWeight: '500' },
  timeTextContainer: { flexDirection: 'row', alignItems: 'center' },
  timeValue: { fontSize: wp(7), fontWeight: '400', color: '#000', marginRight: wp(5) },
  timeSuffix: { fontSize: wp(5), fontWeight: '400', color: '#000000', marginRight: wp(3) },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: wp(5),
    padding: wp(5),
    width: wp(80),
    alignItems: 'center',
  },
  doneButton: {
    marginTop: hp(2),
    padding: hp(1.5),
    backgroundColor: '#007AFF',
    borderRadius: wp(5),
    width: wp(50),
    alignItems: 'center',
  },
  doneButtonText: { color: '#fff', fontSize: wp(5), fontWeight: '500' },
  addButton: {
    padding: hp(1.3),
    backgroundColor: '#007AFF',
    borderRadius: wp(10),
    marginTop: hp(0.5),
    alignItems: 'center',
    justifyContent: 'center',
    width: wp(40),
    alignSelf: 'center',
  },
  addButtonText: { color: '#fff', fontSize: wp(6), fontWeight: '500' },
  picker: { width: wp(70), height: hp(20), backgroundColor: '#fff' },
});

export default WaterScreen;
