import React, { useState, useRef, useMemo, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  Switch,
  Modal,
} from "react-native";
import {
  Feather,
  AntDesign,
  MaterialCommunityIcons,
  Ionicons,
} from "@expo/vector-icons";
import BottomSheet, { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useTheme } from "../ThemeProvider"; // Your custom theme hook
import { useRouter } from "expo-router"; // Router for navigation
import { useFonts, Figtree_400Regular } from "@expo-google-fonts/figtree";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as Notifications from "expo-notifications";
import { Calendar } from "react-native-calendars";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Configure notifications to show alerts even if the app is foregrounded.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const MedicationScreen: React.FC = () => {
  const theme = useTheme(); // Contains background, text, inputBackground, mode, etc.
  const router = useRouter();
  const [fontsLoaded] = useFonts({
    Figtree: Figtree_400Regular,
  });

  // Bottom sheet reference for Medication Details
  const sheetRef = useRef<BottomSheet>(null);

  // -------- Time Picker States --------
  const [isTimePickerVisible, setIsTimePickerVisible] = useState(false);
  const [startTime, setStartTime] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState(""); // Formatted time string

  // -------- Schedule Modal States --------
  const [isScheduleModalVisible, setIsScheduleModalVisible] = useState(false);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  // Medication details state
  const [medicationName, setMedicationName] = useState("");
  const [notes, setNotes] = useState("");
  const [isMedicationActive, setIsMedicationActive] = useState(false);
  const [medications, setMedications] = useState<
    Array<{
      id: number;
      name: string;
      notes: string;
      isActive: boolean;
      startDate?: string | null;
      endDate?: string | null;
      time?: string | null;
    }>
  >([]);

  // Bottom sheet snap points for Medication Details
  const snapPoints = useMemo(() => [hp(65), hp(85)], []);

  // Load medications from AsyncStorage when the component mounts.
  useEffect(() => {
    async function loadMedications() {
      try {
        const savedMedications = await AsyncStorage.getItem("medications");
        if (savedMedications !== null) {
          setMedications(JSON.parse(savedMedications));
        }
      } catch (error) {
        console.error("Error loading medications", error);
      }
    }
    loadMedications();
  }, []);

  // Register for notifications when the component mounts.
  useEffect(() => {
    registerForPushNotificationsAsync();
  }, []);

  async function registerForPushNotificationsAsync() {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== "granted") {
      alert("Failed to get push token for notifications!");
      return;
    }
  }

  // Format a Date object into a custom 12-hour time string.
  const formatCustomTime = (time: Date) => {
    let hours = time.getHours();
    const minutes = time.getMinutes().toString().padStart(2, "0");
    const period = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;
    return { timeString: `${hours} : ${minutes}`, period };
  };

  const handleDoneTime = () => {
    const { timeString, period } = formatCustomTime(startTime);
    setSelectedTime(`${timeString} ${period}`);
    setIsTimePickerVisible(false);
  };

  const toggleMedicationActive = (id: number) => {
    const updatedMedications = medications.map((medication) =>
      medication.id === id
        ? { ...medication, isActive: !medication.isActive }
        : medication
    );
    setMedications(updatedMedications);
    AsyncStorage.setItem("medications", JSON.stringify(updatedMedications));
  };

  const handleDeleteMedication = async (id: number) => {
    const updatedMedications = medications.filter(
      (medication) => medication.id !== id
    );
    setMedications(updatedMedications);
    await AsyncStorage.setItem("medications", JSON.stringify(updatedMedications));
  };

  // Save the medication and schedule notifications (if schedule & time are provided).
  const handleSaveMedication = async () => {
    if (medicationName.trim() === "") return;

    const newMedication = {
      id: Date.now(),
      name: medicationName,
      notes,
      isActive: isMedicationActive,
      startDate: startDate ? startDate.toISOString() : null,
      endDate: endDate ? endDate.toISOString() : null,
      time: selectedTime || null,
    };

    const updatedMedications = [...medications, newMedication];
    setMedications(updatedMedications);
    await AsyncStorage.setItem("medications", JSON.stringify(updatedMedications));

    // Schedule notifications if startDate, endDate, and time are provided.
    if (startDate && endDate && startTime) {
      let currentDate = new Date(startDate);
      while (currentDate <= endDate) {
        // Create a trigger date for the current day at the selected time.
        const triggerDate = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth(),
          currentDate.getDate(),
          startTime.getHours(),
          startTime.getMinutes(),
          0
        );
        // Schedule notification only if the trigger date is in the future.
        if (triggerDate > new Date()) {
          await Notifications.scheduleNotificationAsync({
            content: {
              title: "Medication Reminder",
              body: `Time to take ${medicationName}`,
              data: { medicationId: newMedication.id },
            },
            trigger: triggerDate,
          });
        }
        // Move to the next day.
        currentDate.setDate(currentDate.getDate() + 1);
      }
    }

    // Reset form fields and close the bottom sheet.
    setMedicationName("");
    setNotes("");
    setIsMedicationActive(false);
    sheetRef.current?.close();
  };

  // Helper to format a Date as YYYY-MM-DD for the calendar.
  const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Handler for calendar day press.
  const handleDayPress = (day: {
    dateString: string;
    timestamp: number;
    day: number;
    month: number;
    year: number;
  }) => {
    const selectedDate = new Date(day.timestamp);
    if (!startDate || (startDate && endDate)) {
      // Start a new range.
      setStartDate(selectedDate);
      setEndDate(null);
    } else {
      // If the selected date is before the start date, update the start.
      if (selectedDate < startDate) {
        setStartDate(selectedDate);
      } else {
        setEndDate(selectedDate);
      }
    }
  };

  // Mark the selected dates on the calendar.
  const getMarkedDates = () => {
    let marks: { [date: string]: any } = {};
    if (startDate) {
      const start = formatDate(startDate);
      marks[start] = { startingDay: true, color: "#50cebb", textColor: "#fff" };
      if (endDate) {
        const end = formatDate(endDate);
        marks[end] = { endingDay: true, color: "#50cebb", textColor: "#fff" };
        let current = new Date(startDate);
        current.setDate(current.getDate() + 1);
        while (current < endDate) {
          marks[formatDate(current)] = { color: "#70d7c7", textColor: "#fff" };
          current.setDate(current.getDate() + 1);
        }
      }
    }
    return marks;
  };

  // Define a calendar theme that adapts to dark/light mode.
  const calendarTheme = {
    backgroundColor: theme.inputBackground,
    calendarBackground: theme.inputBackground,
    textSectionTitleColor: theme.text,
    dayTextColor: theme.text,
    textDisabledColor: theme.mode === "dark" ? "#888" : "#d9e1e8",
    dotColor: theme.mode === "dark" ? "#1e90ff" : "#00adf5",
    selectedDayBackgroundColor: theme.mode === "dark" ? "#1e90ff" : "#00adf5",
    selectedDayTextColor: "#fff",
    todayTextColor: theme.mode === "dark" ? "#1e90ff" : "#00adf5",
    arrowColor: theme.text,
    monthTextColor: theme.text,
    indicatorColor: theme.text,
    textDayFontFamily: "Figtree",
    textMonthFontFamily: "Figtree",
    textDayHeaderFontFamily: "Figtree",
    textMonthFontWeight: "bold",
  };

  // Renders the content for the Medication Details Bottom Sheet.
  const renderContent = () => (
    <BottomSheetScrollView
      contentContainerStyle={[
        styles.bottomSheetContent,
        { backgroundColor: theme.background },
      ]}
    >
      <View style={styles.header1}>
        <TouchableOpacity onPress={() => sheetRef.current?.close()}>
          <Feather name="arrow-left" size={wp(7)} color="#4a90e2" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.addButton} onPress={handleSaveMedication}>
          <Text style={[styles.addButtonText, { color: theme.text }]}>Save</Text>
        </TouchableOpacity>
      </View>
      <TextInput
        style={[
          styles.input,
          { backgroundColor: theme.inputBackground, color: theme.text },
        ]}
        placeholder="Enter Medication Name"
        placeholderTextColor={theme.mode === "dark" ? "#aaa" : "#555"}
        value={medicationName}
        onChangeText={setMedicationName}
      />
      <TextInput
        style={[
          styles.notesInput,
          { backgroundColor: theme.inputBackground, color: theme.text },
        ]}
        placeholder="Notes..."
        placeholderTextColor={theme.mode === "dark" ? "#aaa" : "#555"}
        value={notes}
        onChangeText={setNotes}
        multiline
      />
      <TouchableOpacity
        style={[styles.optionBox, { backgroundColor: theme.inputBackground }]}
        onPress={() => setIsScheduleModalVisible(true)}
      >
        <Ionicons name="calendar-outline" size={wp(6)} color="#4a90e2" />
        <Text style={[styles.optionText, { color: theme.text }]}>Schedule</Text>
        <Ionicons name="chevron-forward" size={wp(6)} color="#aaa" />
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.optionBox, { backgroundColor: theme.inputBackground }]}
        onPress={() => setIsTimePickerVisible(true)}
      >
        <Ionicons name="alarm-outline" size={wp(6)} color="orange" />
        <Text style={[styles.optionText, { color: theme.text }]}>
          {selectedTime || "Set Time"}
        </Text>
        <Ionicons name="chevron-forward" size={wp(6)} color="#aaa" />
      </TouchableOpacity>
    </BottomSheetScrollView>
  );

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={[styles.safeContainer, { backgroundColor: theme.background }]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Feather name="arrow-left" size={wp(7)} color="#4a90e2" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => sheetRef.current?.expand()}>
            <AntDesign name="plus" size={wp(7.5)} color="orange" />
          </TouchableOpacity>
        </View>

        {/* Title */}
        <View style={styles.medContainer}>
          <MaterialCommunityIcons name="pill" size={wp(13)} color="#ff5a5a" />
          <Text style={[styles.title, { color: theme.text }]}>Medication</Text>
        </View>

        {/* Medication List */}
        <View style={styles.medicationList}>
          {medications.map((medication) => (
            <View key={medication.id} style={styles.medicationItem}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.medicationName, { color: theme.text }]}>
                  {medication.name}
                </Text>
                {medication.startDate &&
                  medication.endDate &&
                  medication.time && (
                    <Text style={[styles.scheduleText, { color: theme.text }]}>
                      {new Date(medication.startDate).toLocaleDateString()} -{" "}
                      {new Date(medication.endDate).toLocaleDateString()} @ {medication.time}
                    </Text>
                  )}
              </View>
              <Switch
                style={styles.switch}
                value={medication.isActive}
                onValueChange={() => toggleMedicationActive(medication.id)}
              />
              <TouchableOpacity onPress={() => handleDeleteMedication(medication.id)}>
                <Ionicons name="trash-outline" size={24} color="red" />
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Medication Details Bottom Sheet */}
        <BottomSheet
          ref={sheetRef}
          index={-1} // Initially closed
          snapPoints={snapPoints}
          enablePanDownToClose
          backgroundStyle={[
            styles.bottomSheetBackground,
            { backgroundColor: theme.background },
          ]}
          handleIndicatorStyle={styles.handleIndicator}
        >
          {renderContent()}
        </BottomSheet>

        {/* Time Picker Modal */}
        {isTimePickerVisible && (
          <Modal
            transparent
            animationType="slide"
            visible={isTimePickerVisible}
            onRequestClose={() => setIsTimePickerVisible(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={[styles.modalContent, { backgroundColor: theme.background }]}>
                {/* No extra header text */}
                <DateTimePicker
                  value={startTime}
                  mode="time"
                  display="spinner"
                  onChange={(event, date) => {
                    if (date) setStartTime(date);
                  }}
                />
                <TouchableOpacity style={styles.doneButton} onPress={handleDoneTime}>
                  <Text style={styles.doneButtonText}>Done</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        )}

        {/* Schedule Modal with Calendar */}
        {isScheduleModalVisible && (
          <Modal
            transparent
            animationType="slide"
            visible={isScheduleModalVisible}
            onRequestClose={() => setIsScheduleModalVisible(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={[styles.modalContent, { backgroundColor: theme.background }]}>
                {/* No extra header text */}
                <Calendar
                  onDayPress={handleDayPress}
                  markingType="period"
                  markedDates={getMarkedDates()}
                  style={styles.calendar}
                  theme={calendarTheme}
                />
                <TouchableOpacity
                  style={styles.doneButton}
                  onPress={() => setIsScheduleModalVisible(false)}
                >
                  <Text style={styles.doneButtonText}>Done</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        )}
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: wp(6),
    marginBottom: hp(1),
    padding: wp(5),
  },
  header1: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 12,
    marginBottom: 30,
  },
  title: {
    fontSize: wp(11),
    marginRight: wp(4),
    marginLeft: wp(1),
    fontFamily: "Figtree",
    fontWeight: "400",
    textAlign: "center",
  },
  medContainer: {
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    paddingVertical: hp(3),
    marginBottom: 10,
  },
  bottomSheetContent: {
    flex: 1,
    padding: wp(2.45),
    marginHorizontal: wp(2.5),
    borderTopLeftRadius: wp(10),
    borderTopRightRadius: wp(10),
  },
  bottomSheetBackground: {
    borderTopLeftRadius: wp(9),
    borderTopRightRadius: wp(9),
    shadowColor: "#383838",
    marginHorizontal: wp(1.9),
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: wp(1),
    shadowRadius: wp(1),
  },
  handleIndicator: {
    backgroundColor: "#EA4335",
    width: wp(14),
    height: wp(1.1),
    borderRadius: wp(1),
    alignSelf: "center",
    marginVertical: wp(2.3),
  },
  input: {
    borderWidth: wp(0.3),
    borderColor: "#B2B2B2",
    borderRadius: wp(13),
    padding: wp(4),
    fontSize: wp(4.7),
    margin: wp(7),
    fontFamily: "Figtree",
  },
  notesInput: {
    borderWidth: wp(0.3),
    borderColor: "#B2B2B2",
    borderRadius: wp(3),
    padding: wp(3),
    fontSize: wp(4.7),
    height: hp(16),
    margin: wp(7),
    fontFamily: "Figtree",
    marginBottom: hp(2.5),
    textAlignVertical: "top",
  },
  optionBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: wp(0.3),
    borderRadius: wp(13),
    padding: wp(5),
    borderColor: "#B2B2B2",
    margin: wp(7),
    marginBottom: 15,
  },
  optionText: {
    fontSize: wp(4.5),
    fontWeight: "500",
    fontFamily: "Figtree",
  },
  addButton: {},
  addButtonText: {
    fontSize: wp(5),
    fontFamily: "Figtree",
    fontWeight: "500",
  },
  medicationItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: wp(4),
    borderWidth: wp(0.4),
    borderColor: "#ddd",
    borderRadius: wp(10),
    marginBottom: hp(2),
  },
  medicationName: {
    fontSize: wp(5),
    fontWeight: "500",
    fontFamily: "Figtree_400Regular",
  },
  scheduleText: {
    fontSize: wp(3.8),
    marginTop: hp(0.5),
    fontFamily: "Figtree",
  },
  switch: {
    marginRight: wp(7),
  },
  medicationList: {
    paddingHorizontal: wp(6),
    marginTop: hp(4),
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    padding: wp(5),
    borderRadius: wp(5),
    alignItems: "center",
  },
  doneButton: {
    marginTop: hp(2),
    backgroundColor: "#0B82FF",
    paddingVertical: hp(1.5),
    paddingHorizontal: wp(6),
    borderRadius: wp(3),
  },
  doneButtonText: {
    color: "#fff",
    fontSize: wp(4.5),
    fontFamily: "Figtree",
    fontWeight: "500",
  },
  modalTitle: {
    fontSize: wp(5),
    fontFamily: "Figtree",
    fontWeight: "500",
    marginBottom: hp(2),
  },
  calendar: {
    borderRadius: wp(5),
    marginBottom: hp(2),
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
});

export default MedicationScreen;
