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
import { useTheme } from "../ThemeProvider"; // ThemeProvider hook
import { useRouter } from "expo-router"; // Router for navigation
import { Dropdown } from "react-native-element-dropdown";
import { useFonts, Figtree_400Regular } from "@expo-google-fonts/figtree";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as Notifications from "expo-notifications";

// Configure notifications to show alerts even if the app is foregrounded.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const MedicationScreen: React.FC = () => {
  const theme = useTheme();
  const router = useRouter();
  const [fontsLoaded] = useFonts({
    Figtree: Figtree_400Regular,
  });

  // Bottom sheet reference for Medication Details
  const sheetRef = useRef<BottomSheet>(null);

  // -------- Time Popup States --------
  const [isTimePickerVisible, setIsTimePickerVisible] = useState(false);
  const [startTime, setStartTime] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState(""); // Formatted time string

  // -------- Schedule Popup States --------
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

  // Register for notifications on component mount.
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

  // Formats a Date object to a custom 12-hour time string.
  const formatCustomTime = (time: Date) => {
    let hours = time.getHours();
    const minutes = time.getMinutes().toString().padStart(2, "0");
    const period = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12; // Convert to 12-hour format.
    return { timeString: `${hours} : ${minutes}`, period };
  };

  // Handler for the popup time picker's Done button.
  const handleDoneTime = () => {
    const { timeString, period } = formatCustomTime(startTime);
    setSelectedTime(`${timeString} ${period}`);
    setIsTimePickerVisible(false);
  };

  // Toggle medication active state.
  const toggleMedicationActive = (id: number) => {
    setMedications((prev) =>
      prev.map((medication) =>
        medication.id === id
          ? { ...medication, isActive: !medication.isActive }
          : medication
      )
    );
  };

  const handleDeleteMedication = (id: number) => {
    setMedications((prev) =>
      prev.filter((medication) => medication.id !== id)
    );
  };

  // Save medication and schedule notifications (if schedule is provided).
  const handleSaveMedication = async () => {
    if (medicationName.trim() === "") return;

    // Create a new medication object with schedule details.
    const newMedication = {
      id: Date.now(),
      name: medicationName,
      notes,
      isActive: isMedicationActive,
      startDate: startDate ? startDate.toISOString() : null,
      endDate: endDate ? endDate.toISOString() : null,
      time: selectedTime || null,
    };

    setMedications((prev) => [...prev, newMedication]);

    // Schedule notifications if startDate, endDate, and time are provided.
    if (startDate && endDate && startTime) {
      // Loop from startDate to endDate (inclusive).
      let currentDate = new Date(startDate);
      while (currentDate <= endDate) {
        // Create a trigger date with the current day's date and the selected time.
        const triggerDate = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth(),
          currentDate.getDate(),
          startTime.getHours(),
          startTime.getMinutes(),
          0
        );
        // Only schedule if the trigger date is in the future.
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
        // Increment the currentDate by one day.
        currentDate.setDate(currentDate.getDate() + 1);
      }
    }

    // Reset form fields.
    setMedicationName("");
    setNotes("");
    setIsMedicationActive(false);
    // (Optionally, you can clear schedule and time fields here if desired)
    // setStartDate(null);
    // setEndDate(null);
    // setSelectedTime("");
    sheetRef.current?.close();
  };

  // Renders the content for Medication Details Bottom Sheet.
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
        <TouchableOpacity
          style={styles.addButton}
          onPress={async () => {
            console.log("Medication saved");
            await handleSaveMedication();
          }}
        >
          <Text style={[styles.addButtonText, { color: theme.text }]}>
            Save
          </Text>
        </TouchableOpacity>
      </View>
      {/* Input Fields */}
      <TextInput
        style={[
          styles.input,
          { backgroundColor: theme.inputBackground, color: theme.text },
        ]}
        placeholder="Enter Medication Name"
        placeholderTextColor="#aaa"
        value={medicationName}
        onChangeText={setMedicationName}
      />

      <TextInput
        style={[
          styles.notesInput,
          { backgroundColor: theme.inputBackground, color: theme.text },
        ]}
        placeholder="Notes..."
        placeholderTextColor="#aaa"
        value={notes}
        onChangeText={setNotes}
        multiline
      />

      {/* Schedule */}
      <TouchableOpacity
        style={[styles.optionBox, { backgroundColor: theme.inputBackground }]}
        onPress={() => {
          console.log("Schedule selected");
          setIsScheduleModalVisible(true);
        }}
      >
        <Ionicons name="calendar-outline" size={wp(6)} color="#4a90e2" />
        <Text style={[styles.optionText, { color: theme.text }]}>
          Schedule
        </Text>
        <Ionicons name="chevron-forward" size={wp(6)} color="#aaa" />
      </TouchableOpacity>

      {/* Time */}
      <TouchableOpacity
        style={[styles.optionBox, { backgroundColor: theme.inputBackground }]}
        onPress={() => {
          setIsTimePickerVisible(true); // Open the popup time picker
        }}
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
      <SafeAreaView
        style={[styles.safeContainer, { backgroundColor: theme.background }]}
      >
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
          <MaterialCommunityIcons
            name="pill"
            size={wp(13)}
            color="#ff5a5a"
          />
          <Text style={[styles.title, { color: theme.text }]}>
            Medication
          </Text>
        </View>

        {/* Medication List */}
        <View style={styles.medicationList}>
          {medications.map((medication) => (
            <View key={medication.id} style={styles.medicationItem}>
              <View style={{ flex: 1 }}>
                <Text style={styles.medicationName}>{medication.name}</Text>
                {medication.startDate &&
                  medication.endDate &&
                  medication.time && (
                    <Text style={styles.scheduleText}>
                      {new Date(medication.startDate).toLocaleDateString()} -{" "}
                      {new Date(medication.endDate).toLocaleDateString()} @{" "}
                      {medication.time}
                    </Text>
                  )}
              </View>
              <Switch
                style={styles.switch}
                value={medication.isActive}
                onValueChange={() => toggleMedicationActive(medication.id)}
              />
              <TouchableOpacity
                onPress={() => handleDeleteMedication(medication.id)}
              >
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

        {/* Popup Time Picker Modal */}
        {isTimePickerVisible && (
          <Modal
            transparent={true}
            animationType="slide"
            visible={isTimePickerVisible}
            onRequestClose={() => setIsTimePickerVisible(false)}
          >
            <View style={styles.modalOverlay}>
              <View
                style={[
                  styles.modalContent,
                  { backgroundColor: theme.background },
                ]}
              >
                <DateTimePicker
                  value={startTime}
                  mode="time"
                  display="spinner"
                  onChange={(event, date) => {
                    if (date) setStartTime(date);
                  }}
                />
                <TouchableOpacity
                  style={styles.doneButton}
                  onPress={handleDoneTime}
                >
                  <Text style={styles.doneButtonText}>Done</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        )}

        {/* Popup Schedule Modal */}
        {isScheduleModalVisible && (
          <Modal
            transparent={true}
            animationType="slide"
            visible={isScheduleModalVisible}
            onRequestClose={() => setIsScheduleModalVisible(false)}
          >
            <View style={styles.modalOverlay}>
              <View
                style={[
                  styles.modalContent,
                  { backgroundColor: theme.background },
                ]}
              >
                <Text style={styles.modalTitle}>Select Dates</Text>
                <View style={styles.datePickerContainer}>
                  <Text style={styles.dateLabel}>Start Date</Text>
                  <DateTimePicker
                    value={startDate || new Date()}
                    mode="date"
                    display="spinner"
                    onChange={(event, date) => {
                      if (date) setStartDate(date);
                    }}
                  />
                </View>
                <View style={styles.datePickerContainer}>
                  <Text style={styles.dateLabel}>End Date</Text>
                  <DateTimePicker
                    value={endDate || new Date()}
                    mode="date"
                    display="spinner"
                    onChange={(event, date) => {
                      if (date) setEndDate(date);
                    }}
                  />
                </View>
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
    backgroundColor: "#fff",
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
    backgroundColor: "transparent",
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
    backgroundColor: "#f9f9f9",
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
    backgroundColor: "#f9f9f9",
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
    backgroundColor: "#fff",
  },
  optionText: {
    fontSize: wp(4.5),
    fontWeight: "500",
    flex: 0,
    fontFamily: "Figtree",
    color: "#333",
  },
  addButton: {},
  addButtonText: {
    fontSize: wp(5),
    fontFamily: "Figtree",
    fontWeight: "500",
    color: "#000",
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
    color: "#333",
    flex: 1,
    fontWeight: "500",
    fontFamily: "Figtree_400Regular",
  },
  scheduleText: {
    fontSize: wp(3.8),
    color: "#666",
    marginTop: hp(0.5),
    fontFamily: "Figtree",
  },
  switch: {
    paddingHorizontal: -wp(2),
    marginRight: wp(7),
  },
  medicationList: {
    paddingHorizontal: wp(6),
    marginTop: hp(4),
  },
  // ------ Modal Styles (for both Time and Schedule) ------
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
  // Additional styles for the Schedule Modal
  modalTitle: {
    fontSize: wp(5),
    fontFamily: "Figtree",
    fontWeight: "500",
    marginBottom: hp(2),
    color: "#333",
  },
  datePickerContainer: {
    marginVertical: hp(1),
    alignItems: "center",
  },
  dateLabel: {
    fontSize: wp(4.5),
    fontFamily: "Figtree",
    marginBottom: hp(1),
    color: "#333",
  },
});

export default MedicationScreen;
