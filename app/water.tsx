import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Modal,
  Alert,
  ScrollView,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Ionicons, SimpleLineIcons, Feather, EvilIcons } from "@expo/vector-icons";
import { useNavigation } from "expo-router";
import { Picker } from "@react-native-picker/picker";
import { useFonts, Figtree_400Regular } from "@expo-google-fonts/figtree";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import * as Notifications from "expo-notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "../ThemeProvider"; // Adjust the path to your theme context file

const WaterScreen: React.FC = () => {
  const navigation = useNavigation();
  const theme = useTheme();
  const styles = getStyles(theme);
  const [fontsLoaded] = useFonts({ Figtree: Figtree_400Regular });

  // Time picker states
  const [openPicker, setOpenPicker] = useState<"start" | "end" | null>(null);
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date());
  // Default interval for notifications
  const [everyTime, setEveryTime] = useState("10 minutes");
  const [showModal, setShowModal] = useState(false);
  const [showEveryModal, setShowEveryModal] = useState(false);

  // Stored water reminder range (e.g. "6 : 00 AM - 10 : 00 PM")
  const [waterReminderRange, setWaterReminderRange] = useState<string | null>(null);

  // Request notification permissions on mount
  useEffect(() => {
    const requestPermissions = async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission required", "You need to enable notifications for this app to work properly.");
      } else {
        console.log("Notification permissions granted!");
      }
    };
    requestPermissions();
  }, []);

  // Load stored water reminder range on mount
  useEffect(() => {
    const loadReminderRange = async () => {
      try {
        const storedRange = await AsyncStorage.getItem("waterReminderRange");
        if (storedRange !== null) {
          setWaterReminderRange(storedRange);
        }
      } catch (error) {
        console.error("Error loading water reminder range:", error);
      }
    };
    loadReminderRange();
  }, []);

  // Listen for notification responses (e.g., snooze action)
  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
      if (response.actionIdentifier === "snooze") {
        handleSnooze();
      }
    });
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
    const minutes = time.getMinutes().toString().padStart(2, "0");
    const period = time.getHours() >= 12 ? "PM" : "AM";
    return { timeString: `${hours} : ${minutes}`, period };
  };

  // Reschedule a notification for 5 minutes later (snooze)
  const handleSnooze = async () => {
    const snoozeTime = new Date(Date.now() + 5 * 60 * 1000);
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Snoozed: Time to Drink Water! 💧",
        body: "Stay hydrated and drink a glass of water.",
        sound: true,
        data: { type: "water-reminder" },
      },
      trigger: snoozeTime,
    });
    console.log("Notification snoozed for 5 minutes.");
  };

  // Schedule notifications from startTime to endTime every given interval
  const startNotifications = async () => {
    await Notifications.cancelAllScheduledNotificationsAsync();
    const now = new Date();

    // Compute scheduled start time
    let scheduledStartTime = new Date(now);
    scheduledStartTime.setHours(startTime.getHours(), startTime.getMinutes(), 0, 0);
    if (scheduledStartTime <= now) {
      scheduledStartTime.setDate(scheduledStartTime.getDate() + 1);
    }

    // Compute scheduled end time
    let scheduledEndTime = new Date(now);
    scheduledEndTime.setHours(endTime.getHours(), endTime.getMinutes(), 0, 0);
    if (scheduledEndTime <= scheduledStartTime) {
      scheduledEndTime.setDate(scheduledEndTime.getDate() + 1);
    }

    // Convert the "everyTime" string into milliseconds
    const interval =
      everyTime === "1 minute"
        ? 1 * 60 * 1000
        : everyTime === "10 minutes"
        ? 10 * 60 * 1000
        : everyTime === "30 minutes"
        ? 30 * 60 * 1000
        : everyTime === "1 hour"
        ? 60 * 60 * 1000
        : everyTime === "2 hours"
        ? 2 * 60 * 60 * 1000
        : 1 * 60 * 1000;

    let currentTime = new Date(scheduledStartTime);
    let count = 0;
    while (currentTime <= scheduledEndTime) {
      count += 1;
      if (count > 63) {
        console.warn("iOS supports a maximum of 64 scheduled notifications. Stopping early.");
        break;
      }
      try {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: "Time to Drink Water! 💧",
            body: "Stay hydrated and drink a glass of water.",
            sound: true,
            data: { type: "water-reminder" },
          },
          trigger: currentTime,
        });
        console.log(`Scheduled notification #${count} for:`, currentTime);
      } catch (error) {
        console.error("Error scheduling notification:", error);
      }
      currentTime = new Date(currentTime.getTime() + interval);
    }

    // Create a string representing the time range
    const formattedStart = formatCustomTime(scheduledStartTime);
    const formattedEnd = formatCustomTime(scheduledEndTime);
    const range = `${formattedStart.timeString} ${formattedStart.period} - ${formattedEnd.timeString} ${formattedEnd.period}`;

    try {
      await AsyncStorage.setItem("waterReminderRange", range);
      setWaterReminderRange(range);
    } catch (error) {
      console.error("Error saving water reminder range:", error);
    }

    Alert.alert(
      "Notifications Scheduled",
      `Scheduled ${count} notifications from ${range}, every ${everyTime}.`
    );
    console.log(`Total notifications scheduled: ${count}`);
  };

  // Delete the scheduled water reminder (cancel notifications and clear stored range)
  const handleDeleteReminder = async () => {
    await Notifications.cancelAllScheduledNotificationsAsync();
    try {
      await AsyncStorage.removeItem("waterReminderRange");
      setWaterReminderRange(null);
      Alert.alert("Reminder Deleted", "Scheduled water reminder has been deleted.");
    } catch (error) {
      console.error("Error deleting water reminder range:", error);
    }
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
          <Feather name="arrow-left" size={wp(7)} color={theme.text} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={async () => {
            await Notifications.cancelAllScheduledNotificationsAsync();
            await AsyncStorage.removeItem("waterReminderRange");
            setWaterReminderRange(null);
            Alert.alert("Notifications Canceled", "Scheduled water reminder has been canceled.");
          }}
        >
          <EvilIcons name="trash" size={wp(8)} color="red" />
        </TouchableOpacity>
      </View>

      {/* Title */}
      <View style={styles.watercontainer}>
        <Ionicons name="water-outline" size={wp(15)} style={styles.waterIcon} color={"#0B82FF"} />
        <Text style={styles.title}>Water</Text>
      </View>

      {/* Main Content */}
      <ScrollView contentContainerStyle={styles.contentContainer}>
        {/* Start Time */}
        <View style={styles.timeBox}>
          <View style={styles.iconWithLabel}>
            <SimpleLineIcons name="clock" size={wp(7)} color={"#699BA9"} />
            <Text style={[styles.label, { color: theme.text }]}>Start</Text>
          </View>
          <TouchableOpacity
            style={styles.timeTextContainer}
            onPress={() => {
              setOpenPicker("start");
              setShowModal(true);
            }}
          >
            <Text style={[styles.timeValue, { color: theme.text }]}>
              {formatCustomTime(startTime).timeString}
            </Text>
            <Text style={[styles.timeSuffix, { color: theme.text }]}>
              {formatCustomTime(startTime).period}
            </Text>
          </TouchableOpacity>
        </View>

        {/* End Time */}
        <View style={styles.timeBox}>
          <View style={styles.iconWithLabel}>
            <SimpleLineIcons name="clock" size={wp(7)} color={"#699BA9"} />
            <Text style={[styles.label, { color: theme.text }]}>End</Text>
          </View>
          <TouchableOpacity
            style={styles.timeTextContainer}
            onPress={() => {
              setOpenPicker("end");
              setShowModal(true);
            }}
          >
            <Text style={[styles.timeValue, { color: theme.text }]}>
              {formatCustomTime(endTime).timeString}
            </Text>
            <Text style={[styles.timeSuffix, { color: theme.text }]}>
              {formatCustomTime(endTime).period}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Every Interval Picker */}
        <View style={styles.timeBox1}>
          <View style={styles.iconWithLabel}>
            <Ionicons name="alarm-outline" size={wp(7)} color="orange" />
            <Text style={[styles.label, { color: theme.text }]}>Every</Text>
          </View>
          <TouchableOpacity style={styles.timeTextContainer} onPress={() => setShowEveryModal(true)}>
            <Text style={[styles.timeValue, { color: theme.text }]}>{everyTime}</Text>
          </TouchableOpacity>
        </View>

        {/* Add Notification Button */}
        <TouchableOpacity style={styles.addButton} onPress={startNotifications}>
          <Text style={[styles.addButtonText, { color: theme.buttonTextColor }]}>Add</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Modal for Start/End Time Picker */}
      <Modal
        visible={showModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={{ width: "100%", height: 216, backgroundColor: theme.background }}>
              {openPicker === "start" && (
                <DateTimePicker
                  value={startTime}
                  mode="time"
                  display="spinner"
                  themeVariant={theme.mode} // "light" or "dark" based on the theme
                  onChange={(event, date) => onChangeTime(event, date, setStartTime)}
                />
              )}
              {openPicker === "end" && (
                <DateTimePicker
                  value={endTime}
                  mode="time"
                  display="spinner"
                  themeVariant={theme.mode}
                  onChange={(event, date) => onChangeTime(event, date, setEndTime)}
                />
              )}
            </View>
            <TouchableOpacity
              style={[styles.doneButton, { backgroundColor: theme.buttonBackground }]}
              onPress={handleDone}
            >
              <Text style={[styles.doneButtonText, { color: theme.buttonTextColor }]}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal for "Every" Picker */}
      <Modal
        visible={showEveryModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowEveryModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={{ width: "100%", backgroundColor: theme.background, paddingVertical: 20 }}>
              <Picker
                selectedValue={everyTime}
                onValueChange={(itemValue) => setEveryTime(itemValue)}
                style={{ width: "100%" }}
                dropdownIconColor={theme.text}
                mode="dropdown"
                itemStyle={{ color: theme.text, fontSize: wp(5) }}
              >
                <Picker.Item label="1 minute" value="1 minute" color={theme.text} />
                <Picker.Item label="10 minutes" value="10 minutes" color={theme.text} />
                <Picker.Item label="30 minutes" value="30 minutes" color={theme.text} />
                <Picker.Item label="1 hour" value="1 hour" color={theme.text} />
                <Picker.Item label="2 hours" value="2 hours" color={theme.text} />
              </Picker>
            </View>
            <TouchableOpacity
              style={[styles.doneButton, { backgroundColor: theme.buttonBackground }]}
              onPress={handleEveryDone}
            >
              <Text style={[styles.doneButtonText, { color: theme.buttonTextColor }]}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Display Scheduled Reminder Range */}
      {waterReminderRange && (
        <View style={styles.reminderContainer}>
          <View style={styles.reminderRow}>
            <Ionicons name="water-outline" size={24} color="orange" style={styles.leftIcon} />
            <Text style={[styles.reminderText, { color: theme.text }]}>{waterReminderRange}</Text>
            <TouchableOpacity onPress={handleDeleteReminder}>
              <Ionicons name="trash-outline" size={24} color="red" />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

// Generate dynamic styles based on the current theme
const getStyles = (theme) =>
  StyleSheet.create({
    safeContainer: { flex: 1, backgroundColor: theme.background },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: wp(6),
      marginBottom: hp(1),
      padding: wp(5),
    },
    watercontainer: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      paddingVertical: hp(3),
    },
    waterIcon: { marginRight: wp(2) },
    title: {
      fontSize: wp(13),
      fontFamily: "Figtree",
      fontWeight: "400",
      textAlign: "center",
      color: theme.text,
    },
    contentContainer: {
      padding: wp(5),
    },
    timeBox: {
      marginTop: hp(1.5),
      paddingHorizontal: wp(5),
      marginHorizontal: wp(4),
      borderWidth: wp(0.4),
      borderColor: theme.border || "#ddd",
      borderRadius: wp(10),
      paddingVertical: hp(1.3),
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    timeBox1: {
      marginTop: hp(2),
      paddingHorizontal: wp(5),
      marginHorizontal: wp(4),
      borderWidth: wp(0.4),
      borderColor: theme.border || "#ddd",
      borderRadius: wp(10),
      paddingVertical: hp(1.2),
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    iconWithLabel: { flexDirection: "row", alignItems: "center" },
    label: { fontSize: wp(4.5), marginLeft: wp(2.5), fontWeight: "500" },
    timeTextContainer: { flexDirection: "row", alignItems: "center" },
    timeValue: { fontSize: wp(7), fontWeight: "400", marginRight: wp(5) },
    timeSuffix: { fontSize: wp(5), fontWeight: "400", marginRight: wp(3) },
    modalContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    modalContent: {
      backgroundColor: theme.background,
      borderRadius: wp(5),
      padding: wp(5),
      width: wp(80),
      alignItems: "center",
    },
    doneButton: {
      marginTop: hp(2),
      padding: hp(1.5),
      borderRadius: wp(5),
      width: wp(50),
      alignItems: "center",
    },
    doneButtonText: { fontSize: wp(5), fontWeight: "500" },
    addButton: {
      padding: hp(1.3),
      borderRadius: wp(10),
      marginTop: hp(5.5),
      alignItems: "center",
      justifyContent: "center",
      width: wp(30),
      alignSelf: "center",
      backgroundColor: "#0B82FF",
    },
    addButtonText: { fontSize: wp(6), fontWeight: "500" },
    reminderContainer: {
      marginTop: hp(3),
      paddingHorizontal: wp(5),
      paddingVertical: hp(2),
      borderWidth: 1,
      borderColor: theme.border || "#B2B2B2",
      borderRadius: 35,
      marginHorizontal: wp(5),
    },
    reminderRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    leftIcon: { marginRight: wp(3) },
    reminderText: { fontSize: wp(4.5), flex: 1 },
  });

export default WaterScreen;
