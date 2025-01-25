import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  Modal,
  Alert,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons, SimpleLineIcons, Feather, EvilIcons } from '@expo/vector-icons';
import { useNavigation } from "expo-router";
import { Picker } from '@react-native-picker/picker';
import { useFonts, Figtree_400Regular } from "@expo-google-fonts/figtree";
import { 
  widthPercentageToDP as wp, 
  heightPercentageToDP as hp 
} from 'react-native-responsive-screen';
import * as Notifications from 'expo-notifications';

// Setup notification categories (iOS) if you want custom action buttons (e.g., "Snooze")
/*
useEffect(() => {
  const setCategories = async () => {
    await Notifications.setNotificationCategoryAsync('waterReminderCategory', [
      {
        identifier: 'snooze',
        buttonTitle: 'Snooze 5 min',
      },
    ]);
  };
  setCategories();
}, []);
*/

const WaterScreen: React.FC = () => {
  const navigation = useNavigation();

  const [fontsLoaded] = useFonts({
    Figtree: Figtree_400Regular,
  });

  const [openPicker, setOpenPicker] = useState<'start' | 'end' | null>(null);
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date());
  const [everyTime, setEveryTime] = useState('1 minute'); // Default to 1 minute for testing
  const [showModal, setShowModal] = useState(false); 
  const [showEveryModal, setShowEveryModal] = useState(false);

  // Request notification permissions on component mount
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

  // Handle notification responses (e.g., snooze)
  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const { actionIdentifier } = response;
        console.log('Notification response received:', response);

        // Handle custom action
        if (actionIdentifier === 'snooze') {
          handleSnooze();
        }
      }
    );
    return () => subscription.remove();
  }, []);

  // This will be called whenever the user picks a new time from the time picker
  const onChangeTime = (
    event: any,
    selectedDate: Date | undefined,
    setTime: (date: Date) => void
  ) => {
    // If user cancelled the picker, selectedDate will be undefined
    if (!selectedDate) {
      return;
    }
    setTime(selectedDate);
  };

  // Format time for UI
  const formatCustomTime = (time: Date) => {
    const hours = time.getHours() % 12 || 12;
    const minutes = time.getMinutes().toString().padStart(2, '0');
    const period = time.getHours() >= 12 ? 'PM' : 'AM';
    return { timeString: `${hours} : ${minutes}`, period };
  };

  const handleSnooze = async () => {
    // Reschedule the notification after 5 minutes
    const snoozeTime = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Snoozed: Time to Drink Water! 💧',
        body: 'Stay hydrated and drink a glass of water.',
        sound: true,
        data: { type: 'water-reminder' },
        // categoryIdentifier: 'waterReminderCategory', // If using custom actions on iOS
      },
      trigger: {
        date: snoozeTime,
      },
    });
    console.log("Notification snoozed for 5 minutes.");
  };

  // Schedules multiple notifications in a loop (watch out for iOS 64-limit)
  const startNotifications = async () => {
    // Clear all existing notifications
    await Notifications.cancelAllScheduledNotificationsAsync();
    console.log('Cleared all existing notifications.');

    // Validate times
    if (startTime <= new Date()) {
      Alert.alert(
        'Invalid Start Time',
        'Start time must be in the future. Please adjust the start time.'
      );
      return;
    }

    // Convert "everyTime" string into a millisecond interval
    const interval =
      everyTime === '1 minute'
        ? 1 * 60 * 1000
        : everyTime === '30 minutes'
        ? 30 * 60 * 1000
        : everyTime === '1 hour'
        ? 60 * 60 * 1000
        : 2 * 60 * 60 * 1000;

    let currentTime = new Date(startTime);
    const endTimeDate = new Date(endTime);
    let count = 0;

    // Loop through the time range
    while (currentTime <= endTimeDate) {
      count += 1;

      // If scheduling too many notifications, we risk hitting iOS limit of 64
      if (count > 63) {
        console.warn(
          'iOS only supports 64 scheduled notifications. Stopping early.'
        );
        break;
      }

      // Log the currentTime for debugging
      console.log("Scheduling notification #", count, "for:", currentTime);

      try {
        const id = await Notifications.scheduleNotificationAsync({
          content: {
            title: 'Time to Drink Water! 💧',
            body: 'Stay hydrated and drink a glass of water.',
            sound: true,
            data: { type: 'water-reminder' },
            // categoryIdentifier: 'waterReminderCategory', // If using custom actions on iOS
          },
          trigger: {
            date: currentTime, // Trigger at the specific time
          },
        });
        console.log('Scheduled notification ID:', id);
      } catch (error) {
        console.error('Error scheduling notification:', error);
      }

      // Increment the current time by the interval
      currentTime = new Date(currentTime.getTime() + interval);
    }

    Alert.alert(
      'Notifications Scheduled',
      `Scheduled ${count} notifications from ${formatCustomTime(startTime).timeString}${formatCustomTime(startTime).period} to ${formatCustomTime(endTime).timeString}${formatCustomTime(endTime).period}, every ${everyTime}.`
    );
    console.log("Notifications scheduled:", count, "total.");
  };

  /*
  // ALTERNATIVE: If you prefer a single, repeating notification (useful for frequent intervals):
  // This will fire at the same minute of every hour. It's simpler, but doesn't automatically stop.
  const startSingleRepeatingNotification = async () => {
    await Notifications.cancelAllScheduledNotificationsAsync();
    console.log('Cleared all existing notifications.');

    // Suppose we want to schedule a single repeating daily notification at the time set by "startTime"
    const hour = startTime.getHours();
    const minute = startTime.getMinutes();

    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Time to Drink Water! 💧',
        body: 'Stay hydrated and drink a glass of water.',
        sound: true,
      },
      trigger: {
        hour: hour,
        minute: minute,
        repeats: true, // This repeats every day at the specified time
      },
    });

    Alert.alert(
      'Single Repeating Notification Scheduled',
      `Will repeat daily at ${formatCustomTime(startTime).timeString}${formatCustomTime(startTime).period}.`
    );
  };
  */

  const handleDone = () => {
    setShowModal(false);
    setOpenPicker(null);
  };

  const handleEveryDone = () => {
    setShowEveryModal(false);
  };

  if (!fontsLoaded) {
    return null; // or return a loading spinner
  }

  return (
    <SafeAreaView style={styles.safeContainer}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={wp(7)} color="#4a90e2" />
        </TouchableOpacity>

        {/* Trash icon to clear notifications */}
        <TouchableOpacity
          onPress={async () => {
            await Notifications.cancelAllScheduledNotificationsAsync();
            Alert.alert('All Notifications Canceled', 'All scheduled water reminders have been canceled.');
          }}
        >
          <EvilIcons name="trash" size={wp(8)} color="red" />
        </TouchableOpacity>
      </View>

      {/* Title */}
      <View style={styles.watercontainer}>
        <Ionicons name="water-outline" size={wp(15)} style={styles.waterIcon} />
        <Text style={styles.title}>Water</Text>
      </View>

      <View style={styles.container}>
        {/* Start Time */}
        <View style={styles.timeBox}>
          <View style={styles.iconWithLabel}>
            <SimpleLineIcons name="clock" size={wp(7)} color="#4a90e2" />
            <Text style={styles.label}>Start</Text>
          </View>
          <TouchableOpacity
            onPress={() => {
              setOpenPicker('start');
              setShowModal(true);
            }}
            style={styles.timeTextContainer}
          >
            <Text style={styles.timeValue}>
              {formatCustomTime(startTime).timeString}
            </Text>
            <Text style={styles.timeSuffix}>
              {formatCustomTime(startTime).period}
            </Text>
          </TouchableOpacity>
        </View>

        {/* End Time */}
        <View style={styles.timeBox}>
          <View style={styles.iconWithLabel}>
            <SimpleLineIcons name="clock" size={wp(7)} color="#4a90e2" />
            <Text style={styles.label}>End</Text>
          </View>
          <TouchableOpacity
            onPress={() => {
              setOpenPicker('end');
              setShowModal(true);
            }}
            style={styles.timeTextContainer}
          >
            <Text style={styles.timeValue}>
              {formatCustomTime(endTime).timeString}
            </Text>
            <Text style={styles.timeSuffix}>
              {formatCustomTime(endTime).period}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Every */}
        <View style={styles.timeBox1}>
          <View style={styles.iconWithLabel}>
            <Ionicons name="alarm-outline" size={wp(7)} color="orange" />
            <Text style={styles.label}>Every</Text>
          </View>
          <TouchableOpacity
            onPress={() => setShowEveryModal(true)}
            style={styles.timeTextContainer}
          >
            <Text style={styles.timeValue}>{everyTime}</Text>
          </TouchableOpacity>
        </View>

        {/* Modal for Time Picker */}
        <Modal
          visible={showModal}
          transparent={true}
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
                  onChange={(event, date) =>
                    onChangeTime(event, date, setStartTime)
                  }
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

        {/* Modal for Every Interval Picker */}
        <Modal
          visible={showEveryModal}
          transparent={true}
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
                <Picker.Item label="30 minutes" value="30 minutes" />
                <Picker.Item label="1 hour" value="1 hour" />
                <Picker.Item label="2 hours" value="2 hours" />
              </Picker>
              <TouchableOpacity
                style={styles.doneButton}
                onPress={handleEveryDone}
              >
                <Text style={styles.doneButtonText}>Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Add Button */}
        <TouchableOpacity
          style={styles.addButton}
          onPress={startNotifications}
          // onPress={startSingleRepeatingNotification} // If you prefer a single repeating approach
        >
          <Text style={styles.addButtonText}>Add</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: wp(6),
    marginBottom: hp(1),
    padding: wp(5),
  },
  watercontainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    paddingVertical: hp(3),
  },
  waterIcon: {
    color: "#4a90e2",
    marginRight: wp(2),
  },
  title: {
    fontSize: wp(13),
    marginRight: wp(14),
    fontFamily: "Figtree",
    fontWeight: "400",
    textAlign: 'center',
  },
  container: {
    flex: 5,
    padding: wp(5),
  },
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
  iconWithLabel: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    fontSize: wp(4.5),
    color: '#333',
    marginLeft: wp(2.5),
    fontWeight: '500',
  },
  timeTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeValue: {
    fontSize: wp(7),
    fontWeight: '400',
    color: '#000',
    marginRight: wp(5),
  },
  timeSuffix: {
    fontSize: wp(5),
    fontWeight: '400',
    color: '#000000',
    marginRight: wp(3),
  },
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
  doneButtonText: {
    color: '#fff',
    fontSize: wp(5),
    fontWeight: '500',
  },
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
  addButtonText: {
    color: '#fff',
    fontSize: wp(6),
    fontWeight: "500",
  },
  picker: {
    width: wp(70),
    height: hp(20),
    backgroundColor: '#fff',
  },
});

export default WaterScreen;
