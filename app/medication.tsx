import React, { useState, useRef, useMemo } from "react";
import {View,Text,StyleSheet,SafeAreaView,TouchableOpacity,TextInput,} from "react-native";
import {Feather,AntDesign,MaterialCommunityIcons,Ionicons,} from "@expo/vector-icons";
import BottomSheet, { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useTheme } from "../ThemeProvider"; // ThemeProvider hook
import { useRouter } from "expo-router"; // Router for navigation

const MedicationScreen: React.FC = () => {
  const theme = useTheme();
  const router = useRouter();
  const sheetRef = useRef<BottomSheet>(null); // Ref for Medication Details Sheet
  const timeSheetRef = useRef<BottomSheet>(null); // Ref for Time Selection Sheet

  const [medicationName, setMedicationName] = useState("");
  const [notes, setNotes] = useState("");
  const [selectedTime, setSelectedTime] = useState(""); // Holds selected time

  const snapPoints = useMemo(() => ["60%", "85%"], []); // Snap points for medication sheet
  const timeSnapPoints = useMemo(() => ["60%", "85%"], []); // Snap points for time sheet








  // Renders the content for Time Selection
  const renderTimeContent = () => (
    <BottomSheetScrollView
      contentContainerStyle={[
        styles.bottomSheetContent,
        { backgroundColor: theme.background },
      ]}
    >
    <View style={styles.timeContent}>
      <Text style={styles.timeTitle}>Select Time</Text>
      <View style={styles.timeSelector}>
        <Text style={styles.timeText}>{selectedTime || "No Time Selected"}</Text>
        {/* Example buttons for time selection */}
        <TouchableOpacity
          style={styles.timeButton}
          onPress={() => setSelectedTime("03:50 AM")}
        >
          <Text style={styles.timeButtonText}>03:50 AM</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.timeButton}
          onPress={() => setSelectedTime("06:30 PM")}
        >
          <Text style={styles.timeButtonText}>06:30 PM</Text>
        </TouchableOpacity>
      </View>
      {/* Save Time Button */}
      <TouchableOpacity
        style={styles.saveTimeButton}
        onPress={() => {
          timeSheetRef.current?.close(); // Close time sheet
        }}
      >
        <Text style={styles.saveTimeButtonText}>Save</Text>
      </TouchableOpacity>
    </View>
    </BottomSheetScrollView>
  );










  // Renders the content for Medication Details
  const renderContent = () => (
    <BottomSheetScrollView
      contentContainerStyle={[
        styles.bottomSheetContent,
        { backgroundColor: theme.background },
      ]}
    >
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
        onPress={() => console.log("Schedule selected")}
      >
        <Ionicons name="calendar-outline" size={24} color="#4a90e2" />
        <Text style={[styles.optionText, { color: theme.text }]}>Schedule</Text>
        <Ionicons name="chevron-forward" size={24} color="#aaa" />
      </TouchableOpacity>

      {/* Time */}
      <TouchableOpacity
        style={[styles.optionBox, { backgroundColor: theme.inputBackground }]}
        onPress={() => {
          timeSheetRef.current?.expand(); // Expand the time selection sheet
        }}
      >
        <Ionicons name="alarm-outline" size={24} color="orange" />
        <Text style={[styles.optionText, { color: theme.text }]}>
          {selectedTime || "Set Time"}
        </Text>
        <Ionicons name="chevron-forward" size={24} color="#aaa" />
      </TouchableOpacity>

      {/* Save Button */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => console.log("Medication saved")}
      >
        <Text style={styles.addButtonText}>Save</Text>
      </TouchableOpacity>
    </BottomSheetScrollView>
  );









  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={[styles.safeContainer, { backgroundColor: theme.background }]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Feather name="arrow-left" size={27} color="#4a90e2" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => sheetRef.current?.expand()}>
            <AntDesign name="plus" size={35} color="orange" />
          </TouchableOpacity>
        </View>

        {/* Title */}
        <View style={styles.medContainer}>
          <MaterialCommunityIcons name="pill" size={40} color="#ff5a5a" />
          <Text style={[styles.title, { color: theme.text }]}>Medication</Text>
        </View>

        {/* Medication Details Bottom Sheet */}
        <BottomSheet
          ref={sheetRef}
          index={-1} // Initially closed
          snapPoints={snapPoints}
          enablePanDownToClose
          backgroundStyle={styles.bottomSheetBackground}
          handleIndicatorStyle={styles.handleIndicator}
        >
          {renderContent()}
        </BottomSheet>

        {/* Time Selection Bottom Sheet */}
        <BottomSheet
          ref={timeSheetRef}
          index={-1} // Initially closed
          snapPoints={timeSnapPoints}
          enablePanDownToClose
          backgroundStyle={styles.bottomSheetBackground}
          handleIndicatorStyle={styles.handleIndicator}
        >
          {renderTimeContent()}
        </BottomSheet>
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
    paddingHorizontal: 20,
    marginVertical: 10,
    paddingTop: 20,
  },
  title: {
    fontSize: 38,
    fontWeight: "400",
    textAlign: "center",
    marginTop: 10,
  },
  medContainer: {
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    paddingVertical: 15,
    marginBottom: 10,
  },
  bottomSheetContent: {
    flex: 1, // Ensure it stretches to fill available space
    padding:10,
    marginHorizontal:10,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    // Debugging border for alignment
    
    backgroundColor: "transparent", // Avoid conflicting with background
  },
  bottomSheetBackground: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    shadowColor: "#383838",
    marginHorizontal:8,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: .6,
    shadowRadius: 10,
    // elevation: 5,
   
  },
  handleIndicator: {
    backgroundColor: "#EA4335",
    width: 60,
    height: 5,
    borderRadius: 3,
    alignSelf: "center",
    marginVertical: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#B2B2B2",
    borderRadius: 40,
    padding: 20,
    fontSize: 16,
    margin:30,
    backgroundColor: "#f9f9f9",
  },
  notesInput: {
    borderWidth: 1,
    borderColor: "#B2B2B2",
    borderRadius: 20,
    padding: 14,
    fontSize: 16,
    height: 150,
    margin:30,
    marginBottom: 15,
    textAlignVertical: "top",
    backgroundColor: "#f9f9f9",
  },
  optionBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderRadius: 35,
    padding: 20,
    borderColor:"#B2B2B2",
    margin:30,
    marginBottom: 15,
    backgroundColor: "#fff",
   
  },
  optionText: {
    fontSize: 18,
    fontWeight: "500",
    flex: 0,
    marginLeft: 0,
    color: "#333",
  },
  addButton: {
    backgroundColor: "#0B82FF",
    padding: 14,
    borderRadius: 25,
    alignItems: "center",
    marginTop: 60,
    marginHorizontal:130,
  },
  addButtonText: {
    fontSize: 20,
    fontWeight: "500",
    color: "#fff",
  },

  timeContent: {
    padding: 20,
    flex: .9,
    borderWidth:2,
    alignItems: "center",
  },
  timeTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 10,
  },
  timeSelector: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    width: "100%",
    marginBottom: 20,
  },
  timeText: {
    fontSize: 22,
    fontWeight: "500",
    color: "#333",
  },
  timeButton: {
    padding: 10,
    borderRadius: 10,
    backgroundColor: "#f0f0f0",
    marginHorizontal: 10,
  },
  timeButtonText: { fontSize: 16, color: "#000" },
  saveTimeButton: {
    backgroundColor: "#0B82FF",
    padding: 12,
    borderRadius: 25,
    alignItems: "center",
    width: "60%",
  },
  saveTimeButtonText: { fontSize: 18, color: "#fff" },
});

export default MedicationScreen;